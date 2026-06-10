<?php

namespace App\Http\Controllers;

use App\Models\Ciudad;
use App\Models\Colegio;
use App\Models\Estudiante;
use App\Models\Cup;
use App\Models\CarreraCup;
use App\Models\Usuario;
use App\Models\Rol;
use App\Models\Pago;
use App\Models\EstudianteCup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class InscripcionPublicaController extends Controller
{
    /**
     * Show the public registration form.
     */
    public function create()
    {
        $colegios = Colegio::orderBy('NOMBRE')->get(['ID', 'NOMBRE']);
        $ciudades = Ciudad::orderBy('NOMBRE')->get(['ID', 'NOMBRE', 'DEPARTAMENTO']);
        
        $activeCup = Cup::where('ESTADO', 'Inscripciones')->orderBy('ID_CUP', 'desc')->first();
        
        if (!$activeCup) {
            return redirect('/')->with('error', 'Actualmente no hay inscripciones abiertas.');
        }

        $carreras = CarreraCup::where('ID_CUP', $activeCup->ID_CUP)
            ->with('carrera')
            ->get();

        return Inertia::render('public/RegistroPostulante', [
            'colegios'       => $colegios,
            'ciudades'       => $ciudades,
            'carreras'       => $carreras,
            'activeCup'      => $activeCup,
            'paypalClientId' => getenv('PAYPAL_CLIENT_ID') ?: config('services.paypal.client_id') ?: 'ASWDOgCKeUFpkFAVbBVS95PFzP1djtURGd3XBJiRjkQ2FWBK57d5FZYqtVnt7lrbFY4Y3OhHQO_1hJZ5',
        ]);
    }

    /**
     * Store a newly created student, their user account, and enroll them in the active CUP.
     */
    public function store(Request $request)
    {
        $activeCup = Cup::where('ESTADO', 'Inscripciones')->orderBy('ID_CUP', 'desc')->first();

        if (!$activeCup) {
            throw ValidationException::withMessages([
                'general' => 'No hay inscripciones abiertas en este momento.'
            ]);
        }

        $rules = [
            'CARNET'                    => 'required|integer|unique:ESTUDIANTE,CARNET',
            'NOMBRE'                    => 'required|string|max:100',
            'APELLIDO'                  => 'required|string|max:100',
            'FECHA_NAC'                 => 'required|date',
            'SEXO'                      => 'required|in:M,F',
            'CORREO'                    => 'required|email|max:150|unique:ESTUDIANTE,CORREO',
            'TELEFONO'                  => 'nullable|regex:/^\d+$/|max:20',
            'DIRECCION'                 => 'nullable|string|max:255',
            'TITULO_BACHILLER'          => 'required|string|max:255|unique:ESTUDIANTE,TITULO_BACHILLER',
            'NUEVA_CIUDAD_NOMBRE'       => 'required_if:CIUDAD_ID,NEW|nullable|string|max:100',
            'NUEVA_CIUDAD_DEPARTAMENTO' => 'required_if:CIUDAD_ID,NEW|nullable|string|max:100',
            'NUEVO_COLEGIO_NOMBRE'      => 'required_if:COLEGIO_ID,NEW|nullable|string|max:100',
            'OPCION_1'                  => 'required|exists:CARRERA_CUP,ID',
            'OPCION_2'                  => 'required|exists:CARRERA_CUP,ID',
            'paypal_order_id'           => 'required|string',
        ];

        if ($request->input('CIUDAD_ID') === 'NEW') {
            $rules['CIUDAD_ID'] = 'required';
        } else {
            $rules['CIUDAD_ID'] = 'required|integer|exists:CIUDAD,ID';
        }

        if ($request->input('COLEGIO_ID') === 'NEW') {
            $rules['COLEGIO_ID'] = 'required';
        } else {
            $rules['COLEGIO_ID'] = 'required|integer|exists:COLEGIO,ID';
        }

        $messages = [
            'required' => 'El campo :attribute es obligatorio.',
            'date' => 'El campo :attribute debe ser una fecha válida.',
            'integer' => 'El campo :attribute debe ser un número entero.',
            'string' => 'El campo :attribute debe ser un texto.',
            'email' => 'El campo :attribute debe ser un correo electrónico válido.',
            'unique' => 'El valor ingresado en :attribute ya existe en nuestros registros.',
            'max' => 'El campo :attribute no puede exceder los :max caracteres.',
            'in' => 'El valor seleccionado para :attribute no es válido.',
            'exists' => 'El valor seleccionado para :attribute no existe.',
            'required_if' => 'El campo :attribute es obligatorio bajo las condiciones dadas.',
            'regex' => 'El formato del campo :attribute no es válido.'
        ];

        $attributes = [
            'CARNET' => 'carnet de identidad',
            'NOMBRE' => 'nombres',
            'APELLIDO' => 'apellidos',
            'FECHA_NAC' => 'fecha de nacimiento',
            'SEXO' => 'sexo',
            'CORREO' => 'correo electrónico',
            'TELEFONO' => 'teléfono',
            'DIRECCION' => 'dirección',
            'TITULO_BACHILLER' => 'título de bachiller',
            'CIUDAD_ID' => 'ciudad',
            'COLEGIO_ID' => 'colegio',
            'NUEVA_CIUDAD_NOMBRE' => 'nombre de la nueva ciudad',
            'NUEVA_CIUDAD_DEPARTAMENTO' => 'departamento de la nueva ciudad',
            'NUEVO_COLEGIO_NOMBRE' => 'nombre del nuevo colegio',
            'OPCION_1' => 'primera opción de carrera',
            'OPCION_2' => 'segunda opción de carrera',
            'paypal_order_id' => 'orden de pago de PayPal'
        ];

        $validated = $request->validate($rules, $messages, $attributes);

        if ($validated['OPCION_1'] == $validated['OPCION_2']) {
            throw ValidationException::withMessages([
                'OPCION_2' => 'La primera y segunda opción de carrera deben ser estrictamente diferentes.'
            ]);
        }

        try {
            // Verificar el pago con PayPal
            $paypalClientId = env('PAYPAL_CLIENT_ID');
            $paypalSecret = env('PAYPAL_SECRET');

            if (!$paypalClientId || !$paypalSecret) {
                throw new \Exception("La pasarela de pago no está configurada correctamente en el servidor.");
            }

            // 1. Obtener Token de Acceso
            $authResponse = Http::asForm()->withBasicAuth($paypalClientId, $paypalSecret)
                ->post('https://api-m.sandbox.paypal.com/v1/oauth2/token', [
                    'grant_type' => 'client_credentials'
                ]);

            if (!$authResponse->successful()) {
                throw new \Exception("Fallo en la autenticación con PayPal.");
            }

            $accessToken = $authResponse->json('access_token');

            // 2. Verificar la orden
            $orderId = $validated['paypal_order_id'];
            $orderResponse = Http::withToken($accessToken)
                ->get("https://api-m.sandbox.paypal.com/v2/checkout/orders/{$orderId}");

            if (!$orderResponse->successful()) {
                throw new \Exception("No se pudo verificar la orden de PayPal.");
            }

            $orderData = $orderResponse->json();

            // Verificamos si la orden esta completada (o aprobada si la capturamos aquí)
            if ($orderData['status'] !== 'COMPLETED' && $orderData['status'] !== 'APPROVED') {
                throw new \Exception("El pago no ha sido completado exitosamente.");
            }

            // Realizar la transacción completa en PostgreSQL
            $rawPassword = $validated['CARNET'] . '@' . strtoupper(substr($validated['NOMBRE'], 0, 1)) . strtolower(substr($validated['APELLIDO'], 0, 1));
            $hashedPassword = Hash::make($rawPassword);

            try {
                $usuarioId = DB::selectOne('
                    SELECT public.f_registro_completo_postulante(
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    ) as usuario_id
                ', [
                    $validated['CARNET'],
                    $validated['NOMBRE'],
                    $validated['APELLIDO'],
                    $validated['FECHA_NAC'],
                    $validated['SEXO'],
                    $validated['CORREO'],
                    $validated['TELEFONO'] ?? 0,
                    $validated['DIRECCION'] ?? 'S/N',
                    $validated['TITULO_BACHILLER'],
                    $validated['CIUDAD_ID'] !== 'NEW' ? $validated['CIUDAD_ID'] : null,
                    $validated['CIUDAD_ID'] === 'NEW' ? $validated['NUEVA_CIUDAD_NOMBRE'] : null,
                    $validated['CIUDAD_ID'] === 'NEW' ? ($validated['NUEVA_CIUDAD_DEPARTAMENTO'] ?? null) : null,
                    $validated['COLEGIO_ID'] !== 'NEW' ? $validated['COLEGIO_ID'] : null,
                    $validated['COLEGIO_ID'] === 'NEW' ? $validated['NUEVO_COLEGIO_NOMBRE'] : null,
                    $activeCup->ID_CUP,
                    $validated['OPCION_1'],
                    $validated['OPCION_2'],
                    $orderId,
                    10.00,
                    $hashedPassword
                ])->usuario_id;
            } catch (\Exception $qe) {
                $errorMsg = $qe->getMessage();
                if (preg_match('/ERROR:\s*(.+?)(?:\n|Contexto|$)/i', $errorMsg, $matches)) {
                    throw new \Exception(trim($matches[1]));
                }
                throw $qe;
            }

            // Iniciar sesión automáticamente
            Auth::loginUsingId($usuarioId);

            return redirect('/dashboard')->with('success', 'Te has registrado correctamente y ya estás inscrito al CUP.');
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'general' => $e->getMessage()
            ]);
        }
    }
}
