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
            // Consulta de estudiantes inscritos en el CUP actual mediante función de base de datos
            $estudiantesRaw = \Illuminate\Support\Facades\DB::select(
                'SELECT * FROM public.f_obtener_lista_general_postulantes(?)',
                [$cup->ID_CUP]
            );

            $estudiantes = array_map(function ($row) {
                $row->id = (int)$row->id;
                $row->carnet = (int)$row->carnet;
                $row->nota_final = $row->nota_final !== null ? (float)$row->nota_final : null;
                if ($row->preferencia_asignada !== null && is_numeric($row->preferencia_asignada)) {
                    $row->preferencia_asignada = (int)$row->preferencia_asignada;
                }
                $row->notas_materias = json_decode($row->notas_materias);
                return $row;
            }, $estudiantesRaw);

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

            // Obtener postulantes reprobados desde la base de datos
            $postulantesReprobadosRaw = \Illuminate\Support\Facades\DB::select(
                'SELECT * FROM public.f_obtener_postulantes_reprobados(?)',
                [$cup->ID_CUP]
            );

            $postulantesReprobados = array_map(function ($row) {
                $row->id = (int)$row->id;
                $row->carnet = (int)$row->carnet;
                $row->nota_final = $row->nota_final !== null ? (float)$row->nota_final : null;
                $row->notas_materias = json_decode($row->notas_materias);
                return $row;
            }, $postulantesReprobadosRaw);

            // Obtener estadísticas de reprobados por materia desde la base de datos
            $reprobadosPorMateria = \Illuminate\Support\Facades\DB::select(
                'SELECT * FROM public.f_obtener_reprobados_por_materia(?)',
                [$cup->ID_CUP]
            );
        } else {
            $estadisticasCarreras = [];
            $distribucionAprobados = [];
            $postulantesAprobados = [];
            $postulantesReprobados = [];
            $reprobadosPorMateria = [];
        }

        return inertia('reportes/index', [
            'cup' => $cup,
            'cups' => $cups,
            'estudiantes' => $estudiantes,
            'estadisticasCarreras' => $estadisticasCarreras,
            'distribucionAprobados' => $distribucionAprobados,
            'postulantesAprobados' => $postulantesAprobados,
            'postulantesReprobados' => $postulantesReprobados,
            'reprobadosPorMateria' => $reprobadosPorMateria,
        ]);
    }
}
