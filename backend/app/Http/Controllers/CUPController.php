<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use App\Models\Cup;
use App\Models\Carrera;
use App\Models\Materia;
use App\Models\CarreraCup;
use App\Models\MateriaCup;
use App\Models\Docente;
use App\Models\DocenteCup;
use App\Models\DocenteCupMat;
use App\Models\Usuario;
use App\Models\BloqueHorario;
use App\Models\Clase;
use App\Models\Grupo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CUPController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Load the CUPs with the associated user (administrator)
        $cups = Cup::with(['usuario', 'carreraCups.carrera', 'materias'])
            ->orderBy('ID_CUP')
            ->get();

        $hayActivo = Cup::where('ESTADO', '!=', 'Concluido')->exists();

        return inertia('cup/index', [
            'cups'      => $cups,
            'hayActivo' => $hayActivo,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Bloquear si ya existe un CUP activo (no concluido)
        if (Cup::where('ESTADO', '!=', 'Concluido')->exists()) {
            return redirect('/cup')->with('error', 'Ya existe un CUP activo en el sistema. Debe concluirlo antes de crear uno nuevo.');
        }

        $usuarios = Usuario::orderBy('NOMBRE')->get(['ID', 'NOMBRE', 'APELLIDO']);
        $carreras = Carrera::orderBy('NOMBRE')->get(['ID_CARRERA', 'NOMBRE']);
        $materias = Materia::orderBy('NOMBRE')->get(['ID_MATERIA', 'NOMBRE']);

        return inertia('cup/crearCUP', [
            'usuarios' => $usuarios,
            'carreras' => $carreras,
            'materias' => $materias
        ]);
    }

    /**
     * Show the form for editing an existing resource.
     */
    public function edit(string $id)
    {
        $cup = Cup::findOrFail($id);
        $usuarios = Usuario::orderBy('NOMBRE')->get(['ID', 'NOMBRE', 'APELLIDO']);
        $carreras = Carrera::orderBy('NOMBRE')->get(['ID_CARRERA', 'NOMBRE']);
        $materias = Materia::orderBy('NOMBRE')->get(['ID_MATERIA', 'NOMBRE']);

        // Load currently associated careers and subject IDs
        $cupCarreras = CarreraCup::where('ID_CUP', $id)->get(['ID_CARRERA', 'CUPOS'])->toArray();
        $cupMateriaIds = MateriaCup::where('ID_CUP', $id)->pluck('ID_MATERIA')->toArray();

        return inertia('cup/editarCUP', [
            'cup' => [
                'ID_CUP' => $cup->ID_CUP,
                'ANIO' => $cup->ANIO,
                'SEMESTRE' => $cup->SEMESTRE,
                'NOTA_MINIMA' => $cup->NOTA_MINIMA,
                'CUPOS' => $cup->CUPOS,
                'FECHA_INICIO' => $cup->FECHA_INICIO ? $cup->FECHA_INICIO->format('Y-m-d') : null,
                'FECHA_FIN' => $cup->FECHA_FIN ? $cup->FECHA_FIN->format('Y-m-d') : null,
                'USUARIO_ID' => $cup->USUARIO_ID,
                'ESTADO' => $cup->ESTADO,
                'carreras' => $cupCarreras,
                'materias' => $cupMateriaIds
            ],
            'usuarios' => $usuarios,
            'carreras' => $carreras,
            'materias' => $materias
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ANIO' => 'required|integer',
            'SEMESTRE' => 'required|integer|in:1,2',
            'NOTA_MINIMA' => 'required|numeric',
            'FECHA_INICIO' => 'required|date',
            'FECHA_FIN' => 'required|date|after_or_equal:FECHA_INICIO',
            'USUARIO_ID' => 'required|integer|exists:USUARIO,ID',
            'ESTADO' => 'required|string|in:Inscripciones,En curso,Concluido',
            'carreras' => 'required|array|min:1',
            'carreras.*.ID_CARRERA' => 'required|integer|exists:CARRERA,ID_CARRERA',
            'carreras.*.CUPOS' => 'required|integer|min:1',
            'materias' => 'required|array|min:1|max:4',
            'materias.*' => 'required|integer|exists:MATERIA,ID_MATERIA',
        ]);

        // Solo puede existir un CUP no concluido a la vez
        if ($validated['ESTADO'] !== 'Concluido') {
            $activoExistente = Cup::where('ESTADO', '!=', 'Concluido')->exists();
            if ($activoExistente) {
                return back()->withErrors([
                    'ESTADO' => 'Ya existe un CUP activo (no concluido) en el sistema. Debe concluir el CUP actual antes de crear uno nuevo.'
                ])->withInput();
            }
        }

        try {
            DB::beginTransaction();

            // Calculate total cupos as sum of all career cupos
            $totalCupos = collect($validated['carreras'])->sum('CUPOS');

            $cup = Cup::create([
                'ANIO' => $validated['ANIO'],
                'SEMESTRE' => $validated['SEMESTRE'],
                'NOTA_MINIMA' => $validated['NOTA_MINIMA'],
                'CUPOS' => $totalCupos,
                'FECHA_INICIO' => $validated['FECHA_INICIO'],
                'FECHA_FIN' => $validated['FECHA_FIN'],
                'USUARIO_ID' => $validated['USUARIO_ID'],
                'ESTADO' => $validated['ESTADO'],
            ]);

            // Save CarreraCup associations
            foreach ($validated['carreras'] as $carreraData) {
                CarreraCup::create([
                    'ID_CUP' => $cup->ID_CUP,
                    'ID_CARRERA' => $carreraData['ID_CARRERA'],
                    'CUPOS' => $carreraData['CUPOS']
                ]);
            }

            // Save MateriaCup associations
            foreach ($validated['materias'] as $materiaId) {
                MateriaCup::create([
                    'ID_CUP' => $cup->ID_CUP,
                    'ID_MATERIA' => $materiaId
                ]);
            }

            DB::commit();

            return redirect('/cup')->with('success', 'CUP creado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al guardar el CUP: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $cup = Cup::with([
            'usuario',
            'carreraCups.carrera',
            'materias',
            'docenteCups.docente.usuario',
            'docenteCups.clases.materia',
            'docenteCups.clases.grupo',
            'docenteCups.clases.bloqueHorario.horariosEnBloque.horario',
            'docenteCups.clases.aula',
            'docenteCups.docenteCupMats.materia',
        ])
        ->withCount('estudianteCups')
        ->findOrFail($id);

        // All active docentes (even those already assigned)
        $docentesActivos = Docente::with('usuario')
            ->whereHas('usuario', fn($q) => $q->where('ESTADO', 'ACTIVO'))
            ->get();

        $requerimientoDocentes = DB::select('SELECT * FROM public.f_control_requerimiento_docentes(?)', [$id]);

        return inertia('cup/informacion', [
            'cup'                   => $cup,
            'docentesActivos'       => $docentesActivos,
            'requerimientoDocentes' => $requerimientoDocentes,
        ]);
    }

    public function docentes(string $id)
    {
        $cup = Cup::with([
            'docenteCups.docente.usuario',
            'docenteCups.clases.materia',
            'docenteCups.clases.grupo',
            'docenteCups.clases.bloqueHorario.horariosEnBloque.horario',
            'docenteCups.clases.aula',
            'docenteCups.docenteCupMats.materia',
        ])->findOrFail($id);

        return inertia('cup/docentesCup', [
            'cup' => $cup,
        ]);
    }

    public function estudiantes(\Illuminate\Http\Request $request, string $id)
    {
        $cup = Cup::findOrFail($id);
        $search = $request->input('search');

        $query = \App\Models\EstudianteCup::query()
            ->join('ESTUDIANTE', 'ESTUDIANTE_CUP.ID_ESTUDIANTE', '=', 'ESTUDIANTE.ID_ESTUDIANTE')
            ->select('ESTUDIANTE_CUP.*')
            ->with('estudiante')
            ->where('ESTUDIANTE_CUP.ID_CUP', $id);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('ESTUDIANTE.CARNET', $search);
                } else {
                    $q->where('ESTUDIANTE.NOMBRE', 'ILIKE', '%' . $search . '%')
                      ->orWhere('ESTUDIANTE.APELLIDO', 'ILIKE', '%' . $search . '%');
                }
            });
        }

        // Orden alfabético por APELLIDO, NOMBRE
        $query->orderBy('ESTUDIANTE.APELLIDO', 'asc')
              ->orderBy('ESTUDIANTE.NOMBRE', 'asc');

        $estudianteCups = $query->paginate(15)->withQueryString();

        return inertia('cup/estudiantesCup', [
            'cup' => $cup,
            'estudianteCups' => $estudianteCups,
            'filters' => $request->only(['search']),
        ]);
    }

    public function cierreForm(string $id)
    {
        $cup = Cup::with([
            'carreraCups.carrera',
        ])->findOrFail($id);

        // Ocupación en tiempo real por carrera
        $ocupacion = [];
        foreach ($cup->carreraCups as $cc) {
            $carreraNombre = $cc->carrera->NOMBRE;
            // Contar estudiantes asignados a esta carrera en este CUP
            $ocupados = \App\Models\EstudianteCup::where('ID_CUP', $id)
                ->where('CARRERA', $carreraNombre)
                ->count();
            
            $ocupacion[] = [
                'carrera_cup_id' => $cc->ID,
                'nombre' => $carreraNombre,
                'cupos_totales' => $cc->CUPOS,
                'cupos_ocupados' => $ocupados,
                'porcentaje' => $cc->CUPOS > 0 ? round(($ocupados / $cc->CUPOS) * 100, 1) : 0,
            ];
        }

        // Obtener estudiantes aprobados para mostrar los resultados de la asignación
        // Los ordenamos por orden de mérito
        $query = \App\Models\EstudianteCup::query()
            ->join('ESTUDIANTE', 'ESTUDIANTE_CUP.ID_ESTUDIANTE', '=', 'ESTUDIANTE.ID_ESTUDIANTE')
            ->select('ESTUDIANTE_CUP.*')
            ->with(['estudiante', 'opcionesCarrera.carreraCup.carrera'])
            ->where('ESTUDIANTE_CUP.ID_CUP', $id)
            ->where('ESTUDIANTE_CUP.ESTADO', 'APROBADO');

        // Búsqueda opcional
        $search = request()->input('search');
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('ESTUDIANTE.CARNET', $search);
                } else {
                    $q->where('ESTUDIANTE.NOMBRE', 'ILIKE', '%' . $search . '%')
                      ->orWhere('ESTUDIANTE.APELLIDO', 'ILIKE', '%' . $search . '%');
                }
            });
        }

        // Orden de mérito para la lista visual: Nota final DESC, APELLIDO ASC, NOMBRE ASC
        $query->orderBy('ESTUDIANTE_CUP.NOTA_FINAL', 'desc')
              ->orderBy('ESTUDIANTE.APELLIDO', 'asc')
              ->orderBy('ESTUDIANTE.NOMBRE', 'asc');

        $estudianteCups = $query->paginate(15)->withQueryString();

        // Para cada estudiante en la página, calculamos de qué opción (1 o 2) fue asignado
        $estudianteCups->getCollection()->transform(function ($ec) {
            $ec->preferencia_asignada = null;
            if (!empty($ec->CARRERA)) {
                // Buscar cuál de sus opciones coincide con la carrera asignada
                foreach ($ec->opcionesCarrera as $opcion) {
                    if ($opcion->carreraCup?->carrera?->NOMBRE === $ec->CARRERA) {
                        $ec->preferencia_asignada = $opcion->OPCION;
                        break;
                    }
                }
            }
            return $ec;
        });

        return inertia('cup/cierreCup', [
            'cup' => $cup,
            'ocupacion' => $ocupacion,
            'estudianteCups' => $estudianteCups,
            'filters' => request()->only(['search']),
        ]);
    }

    public function ejecutarCierre(string $id)
    {
        $cup = Cup::findOrFail($id);

        \Illuminate\Support\Facades\DB::transaction(function () use ($cup) {
            // 1. Ejecutar el procedimiento de cierre
            \Illuminate\Support\Facades\DB::statement('CALL public.p_cerrar_gestion_cup(?)', [$cup->ID_CUP]);

            // 2. Cambiar el estado del CUP a Concluido
            $cup->update(['ESTADO' => 'Concluido']);

            // 3. Registrar en Bitácora
            \App\Models\Bitacora::create([
                'USUARIO_ID' => \Illuminate\Support\Facades\Auth::id(),
                'ACCION' => 'ACTUALIZAR',
                'TABLA' => 'CUP',
                'REGISTRO_ID' => $cup->ID_CUP,
                'DESCRIPCION' => "Se cerró la gestión para el CUP ID: {$cup->ID_CUP}. Se ejecutó el procedimiento p_cerrar_gestion_cup para la distribución meritocrática de cupos por carreras.",
                'IP_DIRECCION' => request()->ip(),
                'FECHA_REGISTRO' => now(),
            ]);
        });

        return redirect("/cup/{$cup->ID_CUP}/cierre")->with('success', 'El cierre de gestión del CUP y la asignación de plazas se ejecutó correctamente.');
    }

    public function clases(string $id)
    {
        $cup = Cup::with([
            'clases' => function ($query) {
                $query->with([
                    'materia',
                    'grupo',
                    'bloqueHorario.horariosEnBloque.horario',
                    'aula',
                    'docenteCup.docente.usuario',
                    'estudianteCups.estudiante'
                ])->withCount('estudianteCups');
            }
        ])->findOrFail($id);

        return inertia('cup/grupos', [
            'cup' => $cup,
        ]);
    }

    public function grupoDetalles(string $id, string $grupoId)
    {
        $cup = Cup::findOrFail($id);
        $grupo = Grupo::findOrFail($grupoId);

        $clases = Clase::where('ID_CUP', $id)
            ->where('ID_GRUPO', $grupoId)
            ->with([
                'materia',
                'bloqueHorario.horariosEnBloque.horario',
                'aula',
                'docenteCup.docente.usuario',
                'estudianteCups.estudiante'
            ])
            ->get();

        return inertia('cup/grupoDetalles', [
            'cup' => $cup,
            'grupo' => $grupo,
            'clases' => $clases
        ]);
    }

    /**
     * Assign multiple docentes (with materias) to a CUP. Supports syncing and removal.
     */
    public function asignarDocentes(Request $request, string $id)
    {
        $validated = $request->validate([
            'asignaciones'                  => 'present|array',
            'asignaciones.*.CODIGO_DOCENTE' => 'required|integer|exists:DOCENTE,CODIGO_DOCENTE',
            'asignaciones.*.materias'       => 'array',
            'asignaciones.*.materias.*'     => 'integer|exists:MATERIA,ID_MATERIA',
        ]);

        try {
            DB::beginTransaction();

            foreach ($validated['asignaciones'] as $asignacion) {
                $codigoDocente = $asignacion['CODIGO_DOCENTE'];
                $materias = $asignacion['materias'] ?? [];

                $docenteCup = DocenteCup::where('ID_CUP', $id)
                    ->where('CODIGO_DOCENTE', $codigoDocente)
                    ->first();

                if (empty($materias)) {
                    // Remove if 0 materias selected
                    if ($docenteCup) {
                        DocenteCupMat::where('DOCENTE_CUP_ID', $docenteCup->ID)->delete();
                        $docenteCup->delete();
                    }
                } else {
                    // Create if not exists
                    if (!$docenteCup) {
                        $docenteCup = DocenteCup::create([
                            'CODIGO_DOCENTE' => $codigoDocente,
                            'ID_CUP'         => $id,
                            'FECHA_CREACION' => now()->toDateString(),
                        ]);
                    }

                    // Sync materias (delete all and recreate)
                    DocenteCupMat::where('DOCENTE_CUP_ID', $docenteCup->ID)->delete();
                    foreach ($materias as $materiaId) {
                        DocenteCupMat::create([
                            'DOCENTE_CUP_ID' => $docenteCup->ID,
                            'MATERIA_ID'     => $materiaId,
                        ]);
                    }
                }
            }

            DB::commit();

            return redirect("/cup/{$id}")->with('success', 'Asignaciones actualizadas correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al actualizar asignaciones: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $cup = Cup::findOrFail($id);

        // Solo puede existir un CUP no concluido a la vez.
        // Si se intenta reactivar un CUP concluido (cambiar a Inscripciones/En curso),
        // verificar que no haya ya otro CUP activo.
        if ($cup->ESTADO === 'Concluido' && $request->input('ESTADO') !== 'Concluido') {
            $otroActivo = Cup::where('ID_CUP', '!=', $id)
                ->where('ESTADO', '!=', 'Concluido')
                ->exists();

            if ($otroActivo) {
                return back()->withErrors([
                    'ESTADO' => 'Ya existe un CUP activo en el sistema. Solo puede haber un CUP no concluido a la vez.'
                ]);
            }
        }

        if ($cup->ESTADO === 'Concluido' && $request->input('ESTADO') === 'Concluido') {
            // Compare fields to check if modifications were attempted
            $hasChanges = $request->input('ANIO') != $cup->ANIO ||
                          $request->input('SEMESTRE') != $cup->SEMESTRE ||
                          $request->input('NOTA_MINIMA') != $cup->NOTA_MINIMA ||
                          $request->input('FECHA_INICIO') != ($cup->FECHA_INICIO ? $cup->FECHA_INICIO->format('Y-m-d') : null) ||
                          $request->input('FECHA_FIN') != ($cup->FECHA_FIN ? $cup->FECHA_FIN->format('Y-m-d') : null) ||
                          $request->input('USUARIO_ID') != $cup->USUARIO_ID;

            if (!$hasChanges) {
                // Compare careers
                $existingCarreras = \App\Models\CarreraCup::where('ID_CUP', $cup->ID_CUP)
                    ->orderBy('ID_CARRERA')
                    ->get(['ID_CARRERA', 'CUPOS'])
                    ->toArray();

                $newCarreras = collect($request->input('carreras'))
                    ->map(fn($c) => ['ID_CARRERA' => (int)$c['ID_CARRERA'], 'CUPOS' => (int)$c['CUPOS']])
                    ->sortBy('ID_CARRERA')
                    ->values()
                    ->toArray();

                if ($existingCarreras != $newCarreras) {
                    $hasChanges = true;
                }
            }

            if (!$hasChanges) {
                // Compare subjects
                $existingMaterias = \App\Models\MateriaCup::where('ID_CUP', $cup->ID_CUP)
                    ->pluck('ID_MATERIA')
                    ->toArray();

                $newMaterias = array_map('intval', $request->input('materias') ?? []);

                if (array_diff($existingMaterias, $newMaterias) || array_diff($newMaterias, $existingMaterias)) {
                    $hasChanges = true;
                }
            }

            if ($hasChanges) {
                return back()->withErrors(['error' => 'Para modificar la información de un CUP concluido, primero debe cambiar su estado.']);
            }
        }

        $validated = $request->validate([
            'ANIO' => 'required|integer',
            'SEMESTRE' => 'required|integer|in:1,2',
            'NOTA_MINIMA' => 'required|numeric',
            'FECHA_INICIO' => 'required|date',
            'FECHA_FIN' => 'required|date|after_or_equal:FECHA_INICIO',
            'USUARIO_ID' => 'required|integer|exists:USUARIO,ID',
            'ESTADO' => 'required|string|in:Inscripciones,En curso,Concluido',
            'carreras' => 'required|array|min:1',
            'carreras.*.ID_CARRERA' => 'required|integer|exists:CARRERA,ID_CARRERA',
            'carreras.*.CUPOS' => 'required|integer|min:1',
            'materias' => 'required|array|min:1|max:4',
            'materias.*' => 'required|integer|exists:MATERIA,ID_MATERIA',
        ]);

        try {
            DB::beginTransaction();

            $totalCupos = collect($validated['carreras'])->sum('CUPOS');

            $cup->update([
                'ANIO' => $validated['ANIO'],
                'SEMESTRE' => $validated['SEMESTRE'],
                'NOTA_MINIMA' => $validated['NOTA_MINIMA'],
                'CUPOS' => $totalCupos,
                'FECHA_INICIO' => $validated['FECHA_INICIO'],
                'FECHA_FIN' => $validated['FECHA_FIN'],
                'USUARIO_ID' => $validated['USUARIO_ID'],
                'ESTADO' => $validated['ESTADO'],
            ]);

            // Recalculate student approval status in this CUP if the minimum grade changed
            $newNotaMinima = (float)$validated['NOTA_MINIMA'];
            $claseIds = Clase::where('ID_CUP', $cup->ID_CUP)->pluck('ID_CLASE');
            
            // 1. Recalculate ESTUDIANTES_CLASE grades status
            $estClases = \App\Models\EstudianteClase::whereIn('ID_CLASE', $claseIds)->get();
            foreach ($estClases as $ec) {
                if (!is_null($ec->NOTA_FINAL)) {
                    $nuevoEstado = (float)$ec->NOTA_FINAL >= $newNotaMinima ? 'APROBADO' : 'REPROBADO';
                    if ($ec->ESTADO !== $nuevoEstado) {
                        $ec->update(['ESTADO' => $nuevoEstado]);
                    }
                }
            }
            
            // 2. Recalculate ESTUDIANTE_CUP overall status
            $estudianteCups = \App\Models\EstudianteCup::where('ID_CUP', $cup->ID_CUP)->get();
            foreach ($estudianteCups as $eCup) {
                $estClasesStudent = \App\Models\EstudianteClase::where('ESTUDIANTE_CUP_ID', $eCup->ID)->get();
                
                if ($estClasesStudent->isEmpty()) {
                    if (!is_null($eCup->NOTA_FINAL)) {
                        $nuevoEstadoCup = (float)$eCup->NOTA_FINAL >= $newNotaMinima ? 'APROBADO' : 'REPROBADO';
                        if ($eCup->ESTADO !== $nuevoEstadoCup) {
                            $eCup->update(['ESTADO' => $nuevoEstadoCup]);
                        }
                    }
                    continue;
                }
                
                $hasFailed = $estClasesStudent->contains('ESTADO', 'REPROBADO');
                $hasPending = $estClasesStudent->contains(fn($c) => is_null($c->NOTA_FINAL));
                
                if ($hasFailed) {
                    $nuevoEstadoCup = 'REPROBADO';
                } elseif ($hasPending) {
                    $nuevoEstadoCup = 'INSCRITO';
                } else {
                    $nuevoEstadoCup = 'APROBADO';
                }
                
                if ($eCup->ESTADO !== $nuevoEstadoCup) {
                    $eCup->update(['ESTADO' => $nuevoEstadoCup]);
                }
            }

            // Sync CarreraCup keeping existing IDs to prevent deleting student options due to cascade deletes
            $existingCarreras = CarreraCup::where('ID_CUP', $cup->ID_CUP)->get()->keyBy('ID_CARRERA');
            $newCarrerasInput = collect($validated['carreras'])->keyBy('ID_CARRERA');

            // 1. Delete careers that are no longer offered
            foreach ($existingCarreras as $idCarrera => $cc) {
                if (!$newCarrerasInput->has($idCarrera)) {
                    $cc->delete();
                }
            }

            // 2. Update or Create careers
            foreach ($newCarrerasInput as $idCarrera => $carreraData) {
                if ($existingCarreras->has($idCarrera)) {
                    $existingCarreras[$idCarrera]->update([
                        'CUPOS' => $carreraData['CUPOS']
                    ]);
                } else {
                    CarreraCup::create([
                        'ID_CUP' => $cup->ID_CUP,
                        'ID_CARRERA' => $idCarrera,
                        'CUPOS' => $carreraData['CUPOS']
                    ]);
                }
            }

            // Sync MateriaCup keeping existing IDs
            $existingMaterias = MateriaCup::where('ID_CUP', $cup->ID_CUP)->get()->keyBy('ID_MATERIA');
            $newMateriasInput = collect($validated['materias']);

            foreach ($existingMaterias as $idMateria => $mc) {
                if (!$newMateriasInput->contains($idMateria)) {
                    $mc->delete();
                }
            }

            foreach ($newMateriasInput as $materiaId) {
                if (!$existingMaterias->has($materiaId)) {
                    MateriaCup::create([
                        'ID_CUP' => $cup->ID_CUP,
                        'ID_MATERIA' => $materiaId
                    ]);
                }
            }

            DB::commit();

            return redirect('/cup')->with('success', 'CUP actualizado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al actualizar el CUP: ' . $e->getMessage()]);
        }
    }

    /**
     * Renderiza el formulario para crear un paquete de clases.
     */
    public function crearClasesForm(string $idCup)
    {
        $cup = Cup::findOrFail($idCup);
        $inscritos = \App\Models\EstudianteCup::where('ID_CUP', $idCup)->count();

        // Estudiantes ya asignados a alguna clase/grupo
        $conGrupo = \App\Models\EstudianteCup::where('ID_CUP', $idCup)
            ->whereHas('clases')
            ->count();

        // Estudiantes sin grupo (los que procesará el algoritmo)
        $sinGrupo = \App\Models\EstudianteCup::where('ID_CUP', $idCup)
            ->where('ESTADO', 'INSCRITO')
            ->whereDoesntHave('clases')
            ->count();
        
        // Cargar todos los turnos y sus horarios para la visualización en UI
        $turnosData = BloqueHorario::with('horariosEnBloque.horario')
            ->get()
            ->groupBy('TURNO');
            
        $turnos = [];
        foreach ($turnosData as $turnoNombre => $bloques) {
            $horariosTurno = [];
            foreach ($bloques as $bloque) {
                foreach ($bloque->horariosEnBloque as $heb) {
                    if ($heb->horario) {
                        $dia = $heb->horario->DIA;
                        $ini = substr($heb->horario->HORA_INI, 0, 5);
                        $fin = substr($heb->horario->HORA_FIN, 0, 5);
                        $horariosTurno[] = "$dia $ini - $fin";
                    }
                }
            }
            $turnos[] = [
                'nombre' => $turnoNombre,
                'horarios' => array_values(array_unique($horariosTurno))
            ];
        }

        return inertia('cup/crearGrupos', [
            'cup'       => $cup,
            'inscritos' => $inscritos,
            'conGrupo'  => $conGrupo,
            'sinGrupo'  => $sinGrupo,
            'turnos'    => $turnos,
        ]);
    }

    /**
     * Crea un paquete de clases llamando al procedimiento almacenado p_crear_paquete_clases.
     */
    public function crearPaqueteClases(Request $request, string $idCup)
    {
        $validated = $request->validate([
            'EST_MIN'  => 'required|integer|min:1',
            'EST_MAX'  => 'required|integer|gte:EST_MIN',
            'turnos'   => 'required|array|min:1',
            'turnos.*' => 'required|string',
        ]);

        try {
            // Formatear el array de turnos como texto[] de PostgreSQL: {"Mañana","Tarde"}
            $turnosStr = '{' . implode(',', array_map(
                fn($t) => '"' . str_replace('"', '\\"', $t) . '"',
                $validated['turnos']
            )) . '}';

            $pdo  = DB::getPdo();
            $stmt = $pdo->prepare('CALL public.p_crear_paquete_clases(?, ?, ?, ?, NULL)');
            $stmt->execute([
                (int) $idCup,
                (int) $validated['EST_MIN'],
                (int) $validated['EST_MAX'],
                $turnosStr,
            ]);

            $result       = $stmt->fetch(\PDO::FETCH_ASSOC);
            $gruposCreados = $result['p_grupos_creados'] ?? '?';

            return redirect("/cup/{$idCup}")->with(
                'success',
                "Algoritmo completado: Se generaron {$gruposCreados} grupo(s) distribuidos en los turnos seleccionados."
            );
        } catch (\PDOException $e) {
            $mensaje = $e->getMessage();
            // Extraer el mensaje limpio del RAISE EXCEPTION de PostgreSQL
            if (preg_match('/ERROR:\s*(.+?)(?:\n|CONTEXT|$)/i', $mensaje, $m)) {
                $mensaje = trim($m[1]);
            }
            \Log::error('Error en p_crear_paquete_clases: ' . $e->getMessage());
            throw ValidationException::withMessages(['error' => $mensaje]);
        } catch (\Exception $e) {
            \Log::error('Error inesperado en crearPaqueteClases: ' . $e->getMessage());
            throw ValidationException::withMessages(['error' => 'Error inesperado: ' . $e->getMessage()]);
        }
    }


    /**
     * Llama al procedimiento de asignación automática de docentes para el CUP.
     */
    public function asignacionAutomatica(string $idCup)
    {
        try {
            DB::statement('CALL public.p_asignacion_automatica_docentes_cup(?)', [(int)$idCup]);

            Bitacora::create([
                'USUARIO_ID'     => \Auth::id(),
                'SESSION_ID'     => request()->session()->getId(),
                'ACCION'         => 'ASIGNAR',
                'TABLA'          => 'CLASE',
                'REGISTRO_ID'    => (int)$idCup,
                'DESCRIPCION'    => "Asignación automática de docentes ejecutada para el CUP ID {$idCup}.",
                'IP_DIRECCION'   => request()->ip(),
                'FECHA_REGISTRO' => now(),
            ]);

            return redirect("/cup/{$idCup}/clases")->with('success', 'Asignación automática de docentes completada correctamente.');
        } catch (\Exception $e) {
            \Log::error('Error en asignacion automatica de docentes: ' . $e->getMessage());
            return redirect("/cup/{$idCup}/clases")->withErrors(['error' => 'Error al ejecutar la asignación automática: ' . $e->getMessage()]);
        }
    }

    /**
     * Remueve todos los docentes asignados a las clases de un CUP.
     */
    public function removerDocentes(string $idCup)
    {
        try {
            $affected = DB::table('CLASE')
                ->where('ID_CUP', (int)$idCup)
                ->whereNotNull('DOCENTE_CUP_ID')
                ->update(['DOCENTE_CUP_ID' => null]);

            Bitacora::create([
                'USUARIO_ID'     => \Auth::id(),
                'SESSION_ID'     => request()->session()->getId(),
                'ACCION'         => 'ELIMINAR',
                'TABLA'          => 'CLASE',
                'REGISTRO_ID'    => (int)$idCup,
                'DESCRIPCION'    => "Se removieron los docentes de {$affected} clase(s) del CUP ID {$idCup}.",
                'IP_DIRECCION'   => request()->ip(),
                'FECHA_REGISTRO' => now(),
            ]);

            return redirect("/cup/{$idCup}/clases")->with('success', "Se removieron los docentes de {$affected} clase(s) correctamente.");
        } catch (\Exception $e) {
            \Log::error('Error al remover docentes: ' . $e->getMessage());
            return redirect("/cup/{$idCup}/clases")->withErrors(['error' => 'Error al remover los docentes: ' . $e->getMessage()]);
        }
    }
}
