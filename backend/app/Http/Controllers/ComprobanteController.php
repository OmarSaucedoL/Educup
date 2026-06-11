<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Estudiante;
use App\Models\Cup;
use App\Models\EstudianteCup;
use App\Models\Pago;

class ComprobanteController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $rolNombre = strtoupper($user->rol?->NOMBRE ?? '');

        if (!str_contains($rolNombre, 'ESTUDIANTE')) {
            abort(403, 'Acceso denegado. Solo los estudiantes pueden ver sus comprobantes.');
        }

        $estudiante = Estudiante::where('USUARIO_ID', $user->ID)->first();
        if (!$estudiante) {
            abort(404, 'No se encontró el registro de estudiante.');
        }

        // Obtener todos los CUPs en los que el estudiante se ha inscrito y tiene pagos
        $cupsDisponibles = Cup::whereHas('estudianteCups', function($q) use ($estudiante) {
            $q->where('ID_ESTUDIANTE', $estudiante->ID_ESTUDIANTE)
              ->whereHas('pagos', function($q2) {
                  $q2->where('ESTADO', 'COMPLETADO');
              });
        })->orderBy('ID_CUP', 'desc')->get();

        $cup = null;
        $pago = null;
        $opcionesCarrera = [];

        if ($cupsDisponibles->count() > 0) {
            $selectedCupId = $request->input('cup_id');
            if ($selectedCupId) {
                $cup = $cupsDisponibles->firstWhere('ID_CUP', $selectedCupId);
            }
            
            if (!$cup) {
                $cup = $cupsDisponibles->first();
            }

            // Buscar la inscripción en el CUP actual
            $estudianteCup = EstudianteCup::where('ID_CUP', $cup->ID_CUP)
                ->where('ID_ESTUDIANTE', $estudiante->ID_ESTUDIANTE)
                ->with(['opcionesCarrera.carreraCup.carrera'])
                ->first();
            
            if ($estudianteCup) {
                // Obtener el pago
                $pago = Pago::where('ESTUDIANTE_CUP_ID', $estudianteCup->ID)
                    ->where('ESTADO', 'COMPLETADO')
                    ->first();
                    
                $opcionesCarrera = $estudianteCup->opcionesCarrera;
            }
        }

        return Inertia::render('estudiantes/Comprobante', [
            'cup' => $cup,
            'cups_disponibles' => $cupsDisponibles,
            'pago' => $pago,
            'estudiante' => $estudiante,
            'opciones' => $opcionesCarrera,
        ]);
    }
}
