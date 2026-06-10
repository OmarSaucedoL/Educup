<?php

namespace App\Http\Controllers;

use App\Models\Cup;
use Illuminate\Http\Request;

class ReporteAcademicoController extends Controller
{
    /**
     * Muestra la pantalla de reportes del módulo académico.
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

        $postulantesCriticos = [];
        $selectedMaterias = [];
        $notaLimite = (float)$request->input('nota_limite', 51.0);

        if ($request->filled('materias')) {
            $materiasInput = $request->input('materias');
            if (is_string($materiasInput)) {
                $selectedMaterias = array_filter(array_map('intval', explode(',', $materiasInput)));
            } elseif (is_array($materiasInput)) {
                $selectedMaterias = array_map('intval', $materiasInput);
            }
        }

        if ($cup && !empty($selectedMaterias)) {
            // Construir el array literal de postgres: '{2,4}'
            $postgresArray = '{' . implode(',', $selectedMaterias) . '}';
            
            $rawResults = \Illuminate\Support\Facades\DB::select(
                'SELECT * FROM public.f_filtrar_postulantes_criticos_and(?, ?, ?)',
                [$cup->ID_CUP, $postgresArray, $notaLimite]
            );

            $postulantesCriticos = array_map(function ($row) {
                $row->id = (int)$row->id;
                $row->carnet = (int)$row->carnet;
                $row->nota_computacion = $row->nota_computacion !== null ? (float)$row->nota_computacion : 0.0;
                $row->nota_matematica = $row->nota_matematica !== null ? (float)$row->nota_matematica : 0.0;
                $row->nota_ingles = $row->nota_ingles !== null ? (float)$row->nota_ingles : 0.0;
                $row->nota_fisica = $row->nota_fisica !== null ? (float)$row->nota_fisica : 0.0;
                $row->nota_final_promedio = $row->nota_final_promedio !== null ? (float)$row->nota_final_promedio : 0.0;
                return $row;
            }, $rawResults);
        }

        // Obtener catálogo de materias
        $materiasCatalogo = \App\Models\Materia::orderBy('NOMBRE')->get(['ID_MATERIA', 'NOMBRE'])->map(function($m) {
            return [
                'id' => (int)$m->ID_MATERIA,
                'nombre' => $m->NOMBRE
            ];
        });

        // Obtener catálogo de docentes
        $docentesCatalogo = \App\Models\Usuario::whereHas('rol', function($q) {
            $q->where('NOMBRE', 'DOCENTE');
        })->get(['ID', 'NOMBRE', 'APELLIDO'])->map(function($d) {
            return [
                'id' => (int)$d->ID,
                'nombre_completo' => $d->NOMBRE . ' ' . $d->APELLIDO
            ];
        })->toArray();

        $activeTab = in_array($request->input('tab'), ['materias', 'grupos', 'docentes', 'aceptados'], true)
            ? $request->input('tab')
            : 'materias';

        $shouldRunGroupReport = $request->boolean('run_grupos_report', false);
        $shouldRunDocentesReport = $request->boolean('run_docentes_report', false);
        $shouldRunAceptadosReport = $request->boolean('run_aceptados_report', false);

        $gruposReporte = [];
        if ($cup && $activeTab === 'grupos' && $shouldRunGroupReport) {
            $rawGrupos = \Illuminate\Support\Facades\DB::select(
                'SELECT * FROM public.f_reporte_general_grupo(?)',
                [$cup->ID_CUP]
            );

            $gruposReporte = array_map(function ($row) {
                return [
                    'id_grupo' => (int)$row->id_grupo,
                    'nombre_grupo' => $row->nombre_grupo,
                    'turno' => $row->turno,
                    'total_aprobados' => (int)$row->total_aprobados,
                    'total_reprobados' => (int)$row->total_reprobados,
                    'promedio_grupo' => $row->promedio_grupo !== null ? (float)$row->promedio_grupo : null,
                ];
            }, $rawGrupos);
        }

        $docentesReporte = [];
        if ($cup && $activeTab === 'docentes' && $shouldRunDocentesReport) {
            $rawDocentes = \Illuminate\Support\Facades\DB::select(
                'SELECT * FROM public.f_reporte_general_docente(?)',
                [$cup->ID_CUP]
            );

            $docentesReporte = array_map(function ($row) {
                return [
                    'codigo_docente' => (int)$row->codigo_docente,
                    'nombre_docente' => $row->nombre_docente,
                    'clases_dadas' => (int)$row->clases_dadas,
                    'grupos_asignados' => (int)$row->grupos_asignados,
                    'materias_dadas' => $row->materias_dadas,
                    'total_estudiantes' => (int)$row->total_estudiantes,
                    'total_aprobados' => (int)$row->total_aprobados,
                    'total_reprobados' => (int)$row->total_reprobados,
                    'promedio_por_materia' => $row->promedio_por_materia,
                ];
            }, $rawDocentes);
        }

        $historicoDocenteReporte = [];
        $shouldRunHistoricoDocente = $request->boolean('run_historico_docente', false);
        if ($activeTab === 'docentes' && $shouldRunHistoricoDocente && $request->filled('id_docente')) {
            $rawHistorico = \Illuminate\Support\Facades\DB::select(
                'SELECT * FROM public.f_reporte_historico_docente(?)',
                [(int)$request->input('id_docente')]
            );
            $historicoDocenteReporte = array_map(function ($row) {
                return [
                    'docente' => $row->docente,
                    'grupo' => $row->grupo,
                    'materia' => $row->materia,
                    'turno' => $row->turno,
                    'numero_estudiantes' => (int)$row->numero_estudiantes,
                    'nota_promedio' => $row->nota_promedio !== null ? (float)$row->nota_promedio : null,
                    'cup' => $row->cup,
                ];
            }, $rawHistorico);
        }

        $aceptadosReporte = [];
        if ($cup && $activeTab === 'aceptados' && $shouldRunAceptadosReport) {
            $rawAceptados = \Illuminate\Support\Facades\DB::select(
                'SELECT * FROM public.f_reporte_general_aceptados(?)',
                [$cup->ID_CUP]
            );

            $aceptadosReporte = array_map(function ($row) {
                return [
                    'carnet' => $row->carnet,
                    'nombre_completo' => $row->nombre_completo,
                    'carrera_asignada' => $row->carrera_asignada,
                ];
            }, $rawAceptados);
        }

        return inertia('reportes-academicos/index', [
            'cup' => $cup,
            'cups' => $cups,
            'postulantesCriticos' => $postulantesCriticos,
            'materiasSeleccionadas' => $selectedMaterias,
            'notaLimite' => $notaLimite,
            'materiasCatalogo' => $materiasCatalogo,
            'gruposReporte' => $gruposReporte,
            'docentesReporte' => $docentesReporte,
            'historicoDocenteReporte' => $historicoDocenteReporte,
            'aceptadosReporte' => $aceptadosReporte,
            'activeTab' => $activeTab,
            'gruposReportExecuted' => $shouldRunGroupReport,
            'docentesReportExecuted' => $shouldRunDocentesReport,
            'historicoDocenteReportExecuted' => $shouldRunHistoricoDocente,
            'aceptadosReportExecuted' => $shouldRunAceptadosReport,
            'docentesCatalogo' => $docentesCatalogo,
        ]);

    }
}
