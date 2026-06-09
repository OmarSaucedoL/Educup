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
            'paypalClientId' => config('services.paypal.client_id', env('PAYPAL_CLIENT_ID', '')),
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

        $validated = $request->validate($rules);

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

            DB::beginTransaction();

            // 1. Obtener o crear el Rol ESTUDIANTE
            $rolEstudiante = Rol::firstOrCreate(['NOMBRE' => 'ESTUDIANTE']);

            if ($usuarioRegistrado = Usuario::where('CARNET', $validated['CARNET'])->first()) {
                $usuario = $usuarioRegistrado;
            } else {
                $rawPassword = $validated['CARNET'] . '@' . strtoupper(substr($validated['NOMBRE'], 0, 1)) . strtolower(substr($validated['APELLIDO'], 0, 1));
                $usuario = Usuario::create([
                    'USERNAME' => $validated['CARNET'],
                    'CONTRASENIA' => Hash::make($rawPassword),
                    'CARNET' => $validated['CARNET'],
                    'NOMBRE' => strtoupper(trim($validated['NOMBRE'])),
                    'APELLIDO' => strtoupper(trim($validated['APELLIDO'])),
                    'CORREO' => strtolower(trim($validated['CORREO'])),
                    'ESTADO' => 'ACTIVO',
                    'FECHA_CREACION' => Carbon::now(),
                    'ROL_ID' => $rolEstudiante->ID
                ]);
            }

            // 3. Procesar nueva Ciudad y Colegio si se especificaron
            $ciudadId = $validated['CIUDAD_ID'] ?? null;
            if (!empty($validated['NUEVA_CIUDAD_NOMBRE'])) {
                $ciudad = Ciudad::firstOrCreate(
                    ['NOMBRE' => strtoupper(trim($validated['NUEVA_CIUDAD_NOMBRE']))],
                    ['DEPARTAMENTO' => strtoupper(trim($validated['NUEVA_CIUDAD_DEPARTAMENTO'] ?? 'SANTA CRUZ'))]
                );
                $ciudadId = $ciudad->ID;
            }

            $colegioId = $validated['COLEGIO_ID'] ?? null;
            if (!empty($validated['NUEVO_COLEGIO_NOMBRE'])) {
                $colegio = Colegio::firstOrCreate(
                    ['NOMBRE' => strtoupper(trim($validated['NUEVO_COLEGIO_NOMBRE']))]
                );
                $colegioId = $colegio->ID;
            }

            // 4. Crear registro de Estudiante
            // Se puede asociar el estudiante a su usuario si hay una llave foránea o compartiendo datos.
            // Actualmente la tabla ESTUDIANTE tiene su propio ID_ESTUDIANTE.
            $estudiante = Estudiante::create([
                'CARNET'           => $validated['CARNET'],
                'NOMBRE'           => strtoupper(trim($validated['NOMBRE'])),
                'APELLIDO'         => strtoupper(trim($validated['APELLIDO'])),
                'FECHA_NAC'        => $validated['FECHA_NAC'],
                'SEXO'             => strtoupper(trim($validated['SEXO'])),
                'DIRECCION'        => isset($validated['DIRECCION']) ? strtoupper(trim($validated['DIRECCION'])) : null,
                'TELEFONO'         => $validated['TELEFONO'] ?? null,
                'CORREO'           => strtolower(trim($validated['CORREO'])),
                'TITULO_BACHILLER' => strtoupper(trim($validated['TITULO_BACHILLER'])),
                'ESTADO'           => 'ACTIVO',
                'COLEGIO_ID'       => $colegioId,
                'CIUDAD_ID'        => $ciudadId,
                'USUARIO_ID'       => $usuario->ID,
            ]);

            // 5. Inscribir usando el procedimiento almacenado
            try {
                DB::statement('CALL p_inscribir_estudiante_cup(?, ?, ?, ?)', [
                    $estudiante->ID_ESTUDIANTE,
                    $activeCup->ID_CUP,
                    $validated['OPCION_1'],
                    $validated['OPCION_2']
                ]);
            } catch (\Illuminate\Database\QueryException $qe) {
                $errorMsg = $qe->getMessage();
                $mensajeLimpio = 'Error al inscribir al estudiante.';
                if (preg_match('/ERROR:\s*(.+?)(?:\n|Contexto|$)/i', $errorMsg, $matches)) {
                    $mensajeLimpio = trim($matches[1]);
                } else {
                    $mensajeLimpio = $errorMsg;
                }
                throw new \Exception($mensajeLimpio);
            }

            // 6. Obtener el ID de la inscripción generada
            $inscripcion = EstudianteCup::where('ID_ESTUDIANTE', $estudiante->ID_ESTUDIANTE)
                ->where('ID_CUP', $activeCup->ID_CUP)
                ->first();

            if (!$inscripcion) {
                throw new \Exception("No se pudo confirmar la inscripción en la base de datos.");
            }

            // 7. Registrar el Pago
            Pago::create([
                'ESTUDIANTE_CUP_ID' => $inscripcion->ID,
                'PAYPAL_ORDER_ID'   => $orderId,
                'MONTO'             => 10.00,
                'ESTADO'            => 'COMPLETADO',
            ]);

            DB::commit();

            // 6. Iniciar sesión automáticamente
            Auth::login($usuario);

            return redirect('/dashboard')->with('success', 'Te has registrado correctamente y ya estás inscrito al CUP.');
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'CARNET' => $e->getMessage()
            ]);
        }
    }
}
