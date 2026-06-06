<?php

namespace App\Http\Controllers;

use App\Models\Cup;
use App\Models\EstudianteCup;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    /**
     * Muestra la pantalla de reportes del módulo de notas.
     */
    public function index(Request $request)
    {
        // Obtener todos los CUPs para el selector, ordenados de forma descendente
        $cups = Cup::orderBy('ANIO', 'desc')->orderBy('SEMESTRE', 'desc')->get(['ID_CUP', 'ANIO', 'SEMESTRE', 'ESTADO']);

        // Determinar el CUP seleccionado (por query param, CUP en curso o el más reciente)
        if ($request->filled('cup_id')) {
            $cup = Cup::find((int)$request->cup_id);
        } else {
            $cup = Cup::where('ESTADO', 'En curso')->orderBy('ID_CUP', 'desc')->first()
                ?? Cup::orderBy('ID_CUP', 'desc')->first();
        }

        $estudiantes = [];
        if ($cup) {
            // Consulta de estudiantes inscritos en el CUP actual, cargando sus relaciones de manera eficiente
            $estudiantesRaw = EstudianteCup::where('ID_CUP', $cup->ID_CUP)
                ->with([
                    'estudiante.colegio',
                    'estudiante.ciudad',
                    'opcionesCarrera.carreraCup.carrera',
                    'estudiantesClases.clase.materia'
                ])
                ->join('ESTUDIANTE', 'ESTUDIANTE_CUP.ID_ESTUDIANTE', '=', 'ESTUDIANTE.ID_ESTUDIANTE')
                ->select('ESTUDIANTE_CUP.*')
                ->orderBy('ESTUDIANTE.APELLIDO', 'asc')
                ->orderBy('ESTUDIANTE.NOMBRE', 'asc')
                ->get();

            // Transformar la información para enviarla limpia al frontend React
            $estudiantes = $estudiantesRaw->map(function ($ec) {
                // Obtener nombres de las opciones de carrera
                $opcion1 = null;
                $opcion2 = null;
                foreach ($ec->opcionesCarrera as $op) {
                    if ($op->OPCION == 1) {
                        $opcion1 = $op->carreraCup?->carrera?->NOMBRE ?? null;
                    } elseif ($op->OPCION == 2) {
                        $opcion2 = $op->carreraCup?->carrera?->NOMBRE ?? null;
                    }
                }

                // Determinar el número de opción/preferencia de carrera que le fue asignada
                $preferenciaAsignada = null;
                if (!empty($ec->CARRERA)) {
                    if ($opcion1 === $ec->CARRERA) {
                        $preferenciaAsignada = 1;
                    } elseif ($opcion2 === $ec->CARRERA) {
                        $preferenciaAsignada = 2;
                    } else {
                        $preferenciaAsignada = 'Otro';
                    }
                }

                // Mapear materias cursadas con sus respectivas notas en este CUP
                $notasMaterias = $ec->estudiantesClases->map(function ($ecClase) {
                    return [
                        'materia' => $ecClase->clase?->materia?->NOMBRE ?? 'Desconocida',
                        'materia_sigla' => $ecClase->clase?->materia?->SIGLA ?? '',
                        'nota_final' => $ecClase->NOTA_FINAL !== null ? (float)$ecClase->NOTA_FINAL : null,
                        'estado' => $ecClase->ESTADO
                    ];
                });

                return [
                    'id' => $ec->ID,
                    'carnet' => $ec->estudiante?->CARNET,
                    'nombre' => $ec->estudiante?->NOMBRE,
                    'apellido' => $ec->estudiante?->APELLIDO,
                    'nombre_completo' => trim(($ec->estudiante?->APELLIDO ?? '') . ' ' . ($ec->estudiante?->NOMBRE ?? '')),
                    'correo' => $ec->estudiante?->CORREO,
                    'telefono' => $ec->estudiante?->TELEFONO,
                    'colegio' => $ec->estudiante?->colegio?->NOMBRE ?? 'No especificado',
                    'ciudad' => $ec->estudiante?->ciudad?->NOMBRE ?? 'No especificada',
                    'estado' => $ec->ESTADO,
                    'nota_final' => $ec->NOTA_FINAL !== null ? (float)$ec->NOTA_FINAL : null,
                    'carrera_asignada' => $ec->CARRERA,
                    'preferencia_asignada' => $preferenciaAsignada,
                    'opcion_1' => $opcion1 ?? 'Sin seleccionar',
                    'opcion_2' => $opcion2 ?? 'Sin seleccionar',
                    'notas_materias' => $notasMaterias,
                    'fecha_inscripcion' => $ec->FECHA ? $ec->FECHA->format('d/m/Y') : 'No registrada',
                ];
            });

            // Obtener estadísticas de carreras en el CUP desde la base de datos
            $estadisticasCarreras = \Illuminate\Support\Facades\DB::select(
                'SELECT * FROM public.f_obtener_estadisticas_carreras_cup(?)',
                [$cup->ID_CUP]
            );

            // Obtener distribución de cupos y aprobados desde la base de datos
            $distribucionAprobados = \Illuminate\Support\Facades\DB::select(
                'SELECT * FROM public.f_obtener_distribucion_cupos_aprobados(?)',
                [$cup->ID_CUP]
            );

            // Obtener postulantes aprobados desde la base de datos
            $postulantesAprobadosRaw = \Illuminate\Support\Facades\DB::select(
                'SELECT * FROM public.f_obtener_postulantes_aprobados(?)',
                [$cup->ID_CUP]
            );

            $postulantesAprobados = array_map(function ($row) {
                $row->id = (int)$row->id;
                $row->carnet = (int)$row->carnet;
                $row->nota_final = $row->nota_final !== null ? (float)$row->nota_final : null;
                $row->preferencia_asignada = $row->preferencia_asignada !== null ? (int)$row->preferencia_asignada : null;
                return $row;
            }, $postulantesAprobadosRaw);
        } else {
            $estadisticasCarreras = [];
            $distribucionAprobados = [];
            $postulantesAprobados = [];
        }

        return inertia('reportes/index', [
            'cup' => $cup,
            'cups' => $cups,
            'estudiantes' => $estudiantes,
            'estadisticasCarreras' => $estadisticasCarreras,
            'distribucionAprobados' => $distribucionAprobados,
            'postulantesAprobados' => $postulantesAprobados,
        ]);
    }
}
