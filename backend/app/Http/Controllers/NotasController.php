<?php

namespace App\Http\Controllers;

use App\Models\Cup;
use App\Models\Clase;
use App\Models\EstudianteClase;
use App\Models\Calificacion;
use App\Models\Bitacora;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class NotasController extends Controller
{
    /**
     * Muestra el listado de clases del CUP activo para el módulo de notas.
     */
    public function clases(Request $request)
    {
        $cups = Cup::orderBy('ANIO', 'desc')->orderBy('SEMESTRE', 'desc')->get(['ID_CUP', 'ANIO', 'SEMESTRE', 'ESTADO']);

        // Si viene cup_id en la query, usamos ese; si no, el CUP activo o el más reciente
        if ($request->filled('cup_id')) {
            $cup = Cup::find((int)$request->cup_id);
        } else {
            $cup = Cup::where('ESTADO', 'En curso')->orderBy('ID_CUP', 'desc')->first()
                ?? Cup::orderBy('ID_CUP', 'desc')->first();
        }

        $clases = [];
        if ($cup) {
            $clases = Clase::where('ID_CUP', $cup->ID_CUP)
                ->with([
                    'materia',
                    'grupo',
                    'bloqueHorario',
                    'docenteCup.docente.usuario',
                ])
                ->withCount('estudianteCups')
                ->get();
        }

        return inertia('notas/clases', [
            'cup'    => $cup,
            'cups'   => $cups,
            'clases' => $clases,
        ]);
    }

    /**
     * Muestra la pantalla para gestionar notas de una clase específica.
     */
    public function gestionar($id_clase)
    {
        $clase = Clase::with([
            'materia',
            'grupo',
            'bloqueHorario',
            'docenteCup.docente.usuario',
            'cup'
        ])->findOrFail($id_clase);

        $estudiantesClase = EstudianteClase::where('ID_CLASE', $id_clase)
            ->with([
                'estudianteCup.estudiante',
                'calificaciones'
            ])
            ->get();

        return inertia('notas/gestionar', [
            'clase' => $clase,
            'estudiantesClase' => $estudiantesClase,
        ]);
    }

    /**
     * Guarda las calificaciones ingresadas para los estudiantes de una clase.
     */
    public function guardarNotas(Request $request, $id_clase)
    {
        $request->validate([
            'calificaciones' => 'required|array',
            'calificaciones.*.estudiante_clase_id' => 'required|exists:ESTUDIANTES_CLASE,ID',
            'calificaciones.*.grades' => 'required|array',
            'calificaciones.*.grades.*.nombre' => 'required|string|max:100',
            'calificaciones.*.grades.*.calificacion' => 'required|numeric|min:0|max:100',
            'calificaciones.*.grades.*.ponderacion' => 'required|numeric|min:0|max:100',
        ]);

        $clase = Clase::with('cup')->findOrFail($id_clase);

        // Cargamos los datos de inscripción con estudiantes para poder comparar y armar la descripción
        $estudiantesClase = EstudianteClase::where('ID_CLASE', $id_clase)
            ->with('estudianteCup.estudiante')
            ->get()
            ->keyBy('ID');

        $cambios = [];

        DB::transaction(function () use ($request, $clase, $estudiantesClase, &$cambios) {
            foreach ($request->calificaciones as $studentGrade) {
                $estClaseId = $studentGrade['estudiante_clase_id'];
                $grades = $studentGrade['grades'];

                $estClase = $estudiantesClase->get($estClaseId);
                if (!$estClase) {
                    continue;
                }

                // Calcular nota final anterior
                $notaAnterior = $estClase->NOTA_FINAL;

                // 1. Eliminar calificaciones anteriores
                Calificacion::where('ESTUDIANTE_CLASE_ID', $estClaseId)->delete();

                // 2. Insertar nuevas calificaciones y calcular promedio ponderado
                $notaFinal = 0.0;
                foreach ($grades as $g) {
                    $score = (float)$g['calificacion'];
                    $weight = (float)$g['ponderacion'];

                    Calificacion::create([
                        'NOMBRE' => $g['nombre'],
                        'CALIFICACION' => $score,
                        'PONDERACION' => $weight,
                        'ESTUDIANTE_CLASE_ID' => $estClaseId
                    ]);

                    $notaFinal += ($score * $weight) / 100.0;
                }

                $notaFinalFormatted = round($notaFinal, 2);

                // 3. Comparar si cambió la nota final
                $cambioSignificativo = is_null($notaAnterior) || abs((float)$notaAnterior - $notaFinalFormatted) >= 0.01;

                if ($cambioSignificativo) {
                    $studentObj = $estClase->estudianteCup->estudiante ?? null;
                    $nombreCompleto = $studentObj ? "{$studentObj->APELLIDO} {$studentObj->NOMBRE}" : "Estudiante ID {$estClase->ESTUDIANTE_CUP_ID}";
                    $carnet = $studentObj ? $studentObj->CARNET : 'S/N';
                    
                    $notaAntTexto = is_null($notaAnterior) ? 'S/N' : number_format((float)$notaAnterior, 1);
                    $notaNueTexto = number_format($notaFinalFormatted, 1);
                    
                    $cambios[] = "{$nombreCompleto} (CI: {$carnet}) [Nota anterior: {$notaAntTexto} -> Nueva: {$notaNueTexto}]";
                }

                // 4. Actualizar EstudianteClase (NOTA_FINAL y ESTADO)
                $notaMinima = (float) ($clase->cup->NOTA_MINIMA ?? 51.0);
                $estadoClase = $notaFinalFormatted >= $notaMinima ? 'APROBADO' : 'REPROBADO';
                $estClase->update([
                    'NOTA_FINAL' => $notaFinalFormatted,
                    'ESTADO' => $estadoClase
                ]);

                // 5. Actualizar la nota final global y estado del estudiante en el CUP (promedio de todas sus materias del CUP)
                $estudianteCupId = $estClase->ESTUDIANTE_CUP_ID;
                $avgNota = EstudianteClase::where('ESTUDIANTE_CUP_ID', $estudianteCupId)->avg('NOTA_FINAL');

                $estudianteCup = \App\Models\EstudianteCup::find($estudianteCupId);
                if ($estudianteCup) {
                    $hasFailed = EstudianteClase::where('ESTUDIANTE_CUP_ID', $estudianteCupId)
                        ->where('ESTADO', 'REPROBADO')
                        ->exists();

                    $hasPending = EstudianteClase::where('ESTUDIANTE_CUP_ID', $estudianteCupId)
                        ->whereNull('NOTA_FINAL')
                        ->exists();

                    if ($hasFailed) {
                        $estadoCup = 'REPROBADO';
                    } elseif ($hasPending) {
                        $estadoCup = 'INSCRITO';
                    } else {
                        $estadoCup = 'APROBADO';
                    }

                    $estudianteCup->update([
                        'NOTA_FINAL' => $avgNota,
                        'ESTADO' => $estadoCup
                    ]);
                }
            }

            // 6. Construir descripción detallada para la bitácora
            $descripcionBitacora = "Se registraron/actualizaron las calificaciones para la clase de la materia {$clase->materia->NOMBRE} (ID Clase: {$clase->ID_CLASE}) en el grupo {$clase->grupo->NOMBRE}.";
            
            if (count($cambios) > 0) {
                $descripcionBitacora .= " Modificaciones realizadas a " . count($cambios) . " estudiante(s): " . implode(", ", $cambios) . ".";
            } else {
                $descripcionBitacora .= " No se detectaron cambios en las notas finales.";
            }

            // 7. Registrar en Bitácora
            Bitacora::create([
                'USUARIO_ID'     => \Auth::id(),
                'SESSION_ID'     => request()->session()->getId(),
                'ACCION'         => 'MODIFICAR',
                'TABLA'          => 'CALIFICACIONES',
                'REGISTRO_ID'    => $clase->ID_CLASE,
                'DESCRIPCION'    => $descripcionBitacora,
                'IP_DIRECCION'   => request()->ip(),
                'FECHA_REGISTRO' => now(),
            ]);
        });

        return redirect()->back()->with('success', 'Calificaciones actualizadas correctamente.');
    }
}

