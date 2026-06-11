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
                'FECHA_INICIO' => $cup->FECHA_INICIO ? \Carbon\Carbon::parse($cup->FECHA_INICIO)->format('Y-m-d') : null,
                'FECHA_FIN' => $cup->FECHA_FIN ? \Carbon\Carbon::parse($cup->FECHA_FIN)->format('Y-m-d') : null,
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
     * Llama al procedimiento de asignación automática de aulas para el CUP.
     */
    public function asignarAulasAuto(string $idCup)
    {
        if (Cup::findOrFail($idCup)->ESTADO !== 'Inscripciones') {
            return back()->withErrors(['error' => 'Acción no permitida: La asignación de aulas solo se puede realizar en estado Inscripciones.']);
        }

        try {
            DB::statement('CALL public.p_asignacion_automatica_aulas(?)', [(int)$idCup]);

            Bitacora::create([
                'USUARIO_ID'     => \Auth::id(),
                'SESSION_ID'     => request()->session()->getId(),
                'ACCION'         => 'ASIGNAR',
                'TABLA'          => 'CLASE',
                'REGISTRO_ID'    => (int)$idCup,
                'DESCRIPCION'    => "Asignación automática de aulas ejecutada para el CUP ID {$idCup}.",
                'IP_DIRECCION'   => request()->ip(),
                'FECHA_REGISTRO' => now(),
            ]);

            return redirect("/cup/{$idCup}/clases")->with('success', 'Asignación automática de aulas completada correctamente.');
        } catch (\Exception $e) {
            \Log::error('Error en asignacion automatica de aulas: ' . $e->getMessage());
            return redirect("/cup/{$idCup}/clases")->withErrors(['error' => 'Error al ejecutar la asignación automática: ' . $e->getMessage()]);
        }
    }

    /**
     * Remueve todas las aulas asignadas a las clases de un CUP.
     */
    public function removerAulas(string $idCup)
    {
        if (Cup::findOrFail($idCup)->ESTADO !== 'Inscripciones') {
            return back()->withErrors(['error' => 'Acción no permitida: La remoción de aulas solo se puede realizar en estado Inscripciones.']);
        }

        try {
            $affected = DB::table('CLASE')
                ->where('ID_CUP', (int)$idCup)
                ->whereNotNull('ID_AULA')
                ->update(['ID_AULA' => null]);

            Bitacora::create([
                'USUARIO_ID'     => \Auth::id(),
                'SESSION_ID'     => request()->session()->getId(),
                'ACCION'         => 'ELIMINAR',
                'TABLA'          => 'CLASE',
                'REGISTRO_ID'    => (int)$idCup,
                'DESCRIPCION'    => "Se removieron las aulas de {$affected} clase(s) del CUP ID {$idCup}.",
                'IP_DIRECCION'   => request()->ip(),
                'FECHA_REGISTRO' => now(),
            ]);

            return redirect("/cup/{$idCup}/clases")->with('success', "Se removieron las aulas de {$affected} clase(s) correctamente.");
        } catch (\Exception $e) {
            \Log::error('Error al remover aulas: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al remover aulas: ' . $e->getMessage()]);
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

    public function estudiantes(Request $request, string $id)
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
        $isRecalculation = $cup->ESTADO === 'Concluido';
        $previousState = $cup->ESTADO;

        try {
            DB::transaction(function () use ($cup, $isRecalculation, $previousState) {
                // If it's a recalculation, we need to:
                // 1. Reset the previous assignments
                // 2. Temporarily change the status to allow the procedure to execute
                if ($isRecalculation) {
                    // Clear previous assignments
                    \App\Models\EstudianteCup::where('ID_CUP', $cup->ID_CUP)
                        ->update(['CARRERA' => null]);
                    
                    // Temporarily set status to allow procedure execution
                    $cup->update(['ESTADO' => 'En curso']);
                }

                try {
                    // Execute the stored procedure
                    DB::statement('CALL public.p_cerrar_gestion_cup(?)', [$cup->ID_CUP]);
                } catch (\Exception $e) {
                    // If procedure fails due to CUP state, try alternative approach
                    if ($isRecalculation && (strpos($e->getMessage(), 'Concluido') !== false || 
                        strpos($e->getMessage(), 'Operación denegada') !== false)) {
                        throw new \Exception('El procedimiento de cierre detectó que el CUP ya está en estado final. Verifique que haya estudiantes elegibles para la asignación.');
                    }
                    throw $e;
                }

                // Ensure the status is set to Concluido after successful procedure execution
                if ($cup->ESTADO !== 'Concluido') {
                    $cup->update(['ESTADO' => 'Concluido']);
                }

                // Register in Bitácora
                $accion = $isRecalculation ? 'MODIFICACION' : 'EJECUTAR';
                $descripcion = $isRecalculation
                    ? "Se modificó el cierre de gestión para el CUP ID: {$cup->ID_CUP}. Se ejecutó nuevamente el procedimiento p_cerrar_gestion_cup para la redistribución meritocrática de cupos."
                    : "Se cerró la gestión para el CUP ID: {$cup->ID_CUP}. Se ejecutó el procedimiento p_cerrar_gestion_cup para la distribución meritocrática de cupos por carreras.";
                
                Bitacora::create([
                    'USUARIO_ID' => auth()->id(),
                    'ACCION' => $accion,
                    'TABLA' => 'CUP',
                    'REGISTRO_ID' => $cup->ID_CUP,
                    'DESCRIPCION' => $descripcion,
                    'IP_DIRECCION' => request()->ip(),
                    'FECHA_REGISTRO' => now(),
                ]);
            });

            $successMessage = $isRecalculation
                ? 'El cierre de gestión del CUP se re-calculó exitosamente. Las plazas fueron redistribuidas por orden de mérito.'
                : 'El cierre de gestión del CUP y la asignación de plazas se ejecutó correctamente.';

            return redirect("/cup/{$cup->ID_CUP}/cierre")->with('success', $successMessage);
        } catch (\Exception $e) {
            // Restore previous state on error if it was a recalculation
            if ($isRecalculation) {
                try {
                    $cup->update(['ESTADO' => $previousState]);
                } catch (\Exception $restoreError) {
                    // Log error but continue with response
                }
            }
            
            // Determine error message
            $errorMessage = 'Error al ejecutar el cierre de gestión.';
            
            if (strpos($e->getMessage(), 'El procedimiento de cierre detectó') !== false) {
                $errorMessage = $e->getMessage();
            } elseif (strpos($e->getMessage(), 'Operación denegada') !== false || 
                     strpos($e->getMessage(), 'El CUP ya se encuentra concluido') !== false) {
                $errorMessage = 'No se puede ejecutar el cierre: Verifique que el CUP tenga estudiantes elegibles para la asignación de plazas.';
            } elseif (strpos($e->getMessage(), 'SQLSTATE') !== false) {
                // Extract database error message if available
                if (preg_match('/ERROR:\s*(.+?)(?:\n|$)/i', $e->getMessage(), $matches)) {
                    $errorMessage = 'Error de base de datos: ' . $matches[1];
                }
            }
            
            return back()->with('error', $errorMessage)->withInput();
        }
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

        $cupsList = Cup::select('ID_CUP', 'ANIO', 'SEMESTRE', 'ESTADO')
            ->orderBy('ID_CUP', 'desc')
            ->get();

        return inertia('cup/grupos', [
            'cup' => $cup,
            'cupsList' => $cupsList,
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

        // Obtener estudiantes inscritos en el CUP que no tienen ningún grupo asignado
        $estudiantesSinGrupo = \App\Models\EstudianteCup::where('ID_CUP', $id)
            ->where('ESTADO', 'INSCRITO')
            ->whereDoesntHave('clases')
            ->with('estudiante')
            ->get();

        // Obtener docentes disponibles (solo los que pertenecen a este CUP y tienen materias autorizadas)
        $docentesAutorizados = DocenteCupMat::whereHas('docenteCup', function($q) use ($id) {
            $q->where('ID_CUP', $id);
        })
        ->with('docenteCup.docente.usuario')
        ->get();

        $docentesPorMateria = $docentesAutorizados->groupBy('MATERIA_ID')->map(function ($items) {
            return $items->map(function ($item) {
                return $item->docenteCup;
            });
        });

        return inertia('cup/grupoDetalles', [
            'cup' => $cup,
            'grupo' => $grupo,
            'clases' => $clases,
            'estudiantesSinGrupo' => $estudiantesSinGrupo,
            'docentesPorMateria' => $docentesPorMateria
        ]);
    }

    public function asignarDocenteClase(Request $request, string $id, string $claseId)
    {
        if (Cup::findOrFail($id)->ESTADO === 'Concluido') {
            return back()->withErrors(['error' => 'Acción no permitida: El CUP ya se encuentra concluido.']);
        }

        $validated = $request->validate([
            'docente_cup_id' => 'required|integer|exists:DOCENTE_CUP,ID'
        ]);

        try {
            DB::statement('CALL public.p_asignar_docente_clase(?, ?, ?)', [
                (int)$id,
                (int)$claseId,
                (int)$validated['docente_cup_id']
            ]);
            return back()->with('success', 'Docente asignado correctamente a la clase.');
        } catch (\Exception $e) {
            // Formatear mensaje de error omitiendo los códigos internos de SQL
            $mensaje = preg_replace('/SQLSTATE\[\w+\]: [^:]+: \d+ ERROR:  /', '', $e->getMessage());
            $mensaje = explode("\n", $mensaje)[0]; // Obtener solo la primera línea del error
            return back()->withErrors(['error' => $mensaje]);
        }
    }

    public function removerDocenteClase(string $id, string $claseId)
    {
        if (Cup::findOrFail($id)->ESTADO === 'Concluido') {
            return back()->withErrors(['error' => 'Acción no permitida: El CUP ya se encuentra concluido.']);
        }

        $clase = Clase::where('ID_CUP', $id)->findOrFail($claseId);
        $clase->update(['DOCENTE_CUP_ID' => null]);
        
        return back()->with('success', 'Docente removido de la clase correctamente.');
    }

    public function agregarEstudianteGrupo(Request $request, string $id, string $grupoId)
    {
        if (Cup::findOrFail($id)->ESTADO === 'Concluido') {
            return back()->withErrors(['error' => 'Acción no permitida: El CUP ya se encuentra concluido.']);
        }

        $validated = $request->validate([
            'estudiante_cup_id' => 'required|integer|exists:ESTUDIANTE_CUP,ID'
        ]);

        try {
            DB::beginTransaction();

            $clasesIds = Clase::where('ID_CUP', $id)->where('ID_GRUPO', $grupoId)->pluck('ID_CLASE');
            if ($clasesIds->isEmpty()) {
                throw new \Exception("El grupo no tiene clases asignadas.");
            }

            $estudianteCupId = $validated['estudiante_cup_id'];

            // Insertar estudiante en todas las clases del grupo
            foreach ($clasesIds as $claseId) {
                \App\Models\EstudianteClase::firstOrCreate([
                    'ESTUDIANTE_CUP_ID' => $estudianteCupId,
                    'ID_CLASE' => $claseId,
                ], [
                    'ESTADO' => 'CURSANDO',
                    'FECHA_CREACION' => now()
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Estudiante añadido al grupo correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error añadiendo estudiante al grupo: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Error al añadir el estudiante: ' . $e->getMessage()]);
        }
    }

    public function removerEstudianteGrupo(string $id, string $grupoId, string $estudianteId)
    {
        if (Cup::findOrFail($id)->ESTADO === 'Concluido') {
            return back()->withErrors(['error' => 'Acción no permitida: El CUP ya se encuentra concluido.']);
        }

        try {
            DB::beginTransaction();

            $clasesIds = Clase::where('ID_CUP', $id)->where('ID_GRUPO', $grupoId)->pluck('ID_CLASE');
            
            if ($clasesIds->isNotEmpty()) {
                \App\Models\EstudianteClase::whereIn('ID_CLASE', $clasesIds)
                    ->where('ESTUDIANTE_CUP_ID', $estudianteId)
                    ->delete();
            }

            DB::commit();
            return redirect()->back()->with('success', 'Estudiante removido del grupo correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error removiendo estudiante del grupo: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Error al remover el estudiante: ' . $e->getMessage()]);
        }
    }

    /**
     * Assign multiple docentes (with materias) to a CUP. Supports syncing and removal.
     */
    public function asignarDocentes(Request $request, string $id)
    {
        if (Cup::findOrFail($id)->ESTADO === 'Concluido') {
            return back()->withErrors(['error' => 'Acción no permitida: El CUP ya se encuentra concluido.']);
        }

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
    private function verificarCambiosCupConcluido(Cup $cup, Request $request): void
    {
        if ($cup->ESTADO !== 'Concluido' || $request->input('ESTADO') !== 'Concluido') {
            return;
        }

        // Compare simple fields
        $hasChanges = $request->input('ANIO') != $cup->ANIO ||
                      $request->input('SEMESTRE') != $cup->SEMESTRE ||
                      $request->input('NOTA_MINIMA') != $cup->NOTA_MINIMA ||
                      $request->input('FECHA_INICIO') != ($cup->FECHA_INICIO ? \Carbon\Carbon::parse($cup->FECHA_INICIO)->format('Y-m-d') : null) ||
                      $request->input('FECHA_FIN') != ($cup->FECHA_FIN ? \Carbon\Carbon::parse($cup->FECHA_FIN)->format('Y-m-d') : null) ||
                      $request->input('USUARIO_ID') != $cup->USUARIO_ID;

        if (!$hasChanges) {
            // Compare careers
            $existingCarreras = CarreraCup::where('ID_CUP', $cup->ID_CUP)
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
            $existingMaterias = MateriaCup::where('ID_CUP', $cup->ID_CUP)
                ->pluck('ID_MATERIA')
                ->toArray();

            $newMaterias = array_map('intval', $request->input('materias') ?? []);

            if (array_diff($existingMaterias, $newMaterias) || array_diff($newMaterias, $existingMaterias)) {
                $hasChanges = true;
            }
        }

        if ($hasChanges) {
            throw ValidationException::withMessages([
                'error' => 'Para modificar la información de un CUP concluido, primero debe cambiar su estado.'
            ]);
        }
    }

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
                throw ValidationException::withMessages([
                    'ESTADO' => 'Ya existe un CUP activo en el sistema. Solo puede haber un CUP no concluido a la vez.'
                ]);
            }
        }

        $this->verificarCambiosCupConcluido($cup, $request);

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
            $carrerasIds = '{' . implode(',', collect($validated['carreras'])->pluck('ID_CARRERA')->toArray()) . '}';
            $carrerasCupos = '{' . implode(',', collect($validated['carreras'])->pluck('CUPOS')->toArray()) . '}';
            $materiasIds = '{' . implode(',', $validated['materias']) . '}';

            $totalCupos = collect($validated['carreras'])->sum('CUPOS');

            DB::statement('CALL public.p_actualizar_cup(?, ?, ?, ?, ?, ?, ?, ?, ?, ?::bigint[], ?::integer[], ?::bigint[])', [
                (int)$cup->ID_CUP,
                (int)$validated['ANIO'],
                (int)$validated['SEMESTRE'],
                (float)$validated['NOTA_MINIMA'],
                (int)$totalCupos,
                $validated['FECHA_INICIO'],
                $validated['FECHA_FIN'],
                (int)$validated['USUARIO_ID'],
                $validated['ESTADO'],
                $carrerasIds,
                $carrerasCupos,
                $materiasIds
            ]);

            return redirect('/cup')->with('success', 'CUP actualizado correctamente.');
        } catch (\Exception $e) {
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

        // Obtener capacidad de los grupos si ya existen
        $primerClase = Clase::where('ID_CUP', $idCup)->whereNotNull('ID_GRUPO')->first();
        $estMinExistente = 20;
        $estMaxExistente = 40;
        if ($primerClase) {
            $grupo = Grupo::find($primerClase->ID_GRUPO);
            if ($grupo) {
                $estMinExistente = $grupo->EST_MIN;
                $estMaxExistente = $grupo->EST_MAX;
            }
        }

        return inertia('cup/crearGrupos', [
            'cup'       => $cup,
            'inscritos' => $inscritos,
            'conGrupo'  => $conGrupo,
            'sinGrupo'  => $sinGrupo,
            'turnos'    => $turnos,
            'estMinExistente' => $estMinExistente,
            'estMaxExistente' => $estMaxExistente,
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

    public function asignarRezagados(string $idCup)
    {
        try {
            $pdo  = DB::getPdo();
            $stmt = $pdo->prepare('CALL public.p_asignar_rezagados(?, NULL, NULL)');
            $stmt->execute([(int) $idCup]);

            $result    = $stmt->fetch(\PDO::FETCH_ASSOC);
            $asignados = $result['p_asignados'] ?? 0;
            $sinCupo   = $result['p_sin_cupo'] ?? 0;

            if ($asignados === 0 && $sinCupo === 0) {
                return back()->with('success', 'No hay estudiantes rezagados para asignar.');
            }

            $mensaje = "Se asignaron {$asignados} estudiantes rezagados a grupos existentes.";
            if ($sinCupo > 0) {
                $mensaje .= " Sin embargo, {$sinCupo} estudiantes no pudieron ser asignados porque los grupos están llenos. Deberá crear más grupos o aumentar el límite máximo.";
                return back()->with('success', $mensaje)->with('warning', true);
            }

            return back()->with('success', $mensaje);
        } catch (\PDOException $e) {
            $mensaje = $e->getMessage();
            if (preg_match('/ERROR:\s*(.+?)(?:\n|CONTEXT|$)/i', $mensaje, $m)) {
                $mensaje = trim($m[1]);
            }
            \Log::error('Error en p_asignar_rezagados: ' . $e->getMessage());
            throw ValidationException::withMessages(['error' => $mensaje]);
        } catch (\Exception $e) {
            \Log::error('Error inesperado en asignarRezagados: ' . $e->getMessage());
            throw ValidationException::withMessages(['error' => 'Error inesperado: ' . $e->getMessage()]);
        }
    }

    public function resetearPaqueteClases(string $idCup)
    {
        try {
            DB::statement('CALL public.p_resetear_paquete_clases(?)', [(int)$idCup]);

            return back()->with(
                'success',
                'Todas las clases y grupos del CUP han sido reseteados correctamente.'
            );
        } catch (\PDOException $e) {
            $mensaje = $e->getMessage();
            if (preg_match('/ERROR:\s*(.+?)(?:\n|CONTEXT|$)/i', $mensaje, $m)) {
                $mensaje = trim($m[1]);
            }
            \Log::error('Error en p_resetear_paquete_clases: ' . $e->getMessage());
            throw ValidationException::withMessages(['error' => $mensaje]);
        } catch (\Exception $e) {
            \Log::error('Error inesperado en resetearPaqueteClases: ' . $e->getMessage());
            throw ValidationException::withMessages(['error' => 'Error inesperado: ' . $e->getMessage()]);
        }
    }

    public function modificarCapacidadGrupos(Request $request, string $idCup)
    {
        $validated = $request->validate([
            'est_min' => 'required|integer|min:1',
            'est_max' => 'required|integer|gte:est_min'
        ]);

        try {
            $grupoIds = Clase::where('ID_CUP', $idCup)->pluck('ID_GRUPO')->unique();
            
            if ($grupoIds->isEmpty()) {
                return back()->withErrors(['error' => 'No existen grupos creados para este CUP.']);
            }

            Grupo::whereIn('ID_GRUPO', $grupoIds)->update([
                'EST_MIN' => $validated['est_min'],
                'EST_MAX' => $validated['est_max']
            ]);

            return back()->with('success', 'Capacidad modificada exitosamente para todos los grupos de este CUP.');
        } catch (\Exception $e) {
            \Log::error('Error en modificarCapacidadGrupos: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error inesperado: ' . $e->getMessage()]);
        }
    }


    /**
     * Llama al procedimiento de asignación automática de docentes para el CUP.
     */
    public function asignacionAutomatica(string $idCup)
    {
        if (Cup::findOrFail($idCup)->ESTADO !== 'Inscripciones') {
            return back()->withErrors(['error' => 'Acción no permitida: La asignación de docentes solo se puede realizar en estado Inscripciones.']);
        }

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
        if (Cup::findOrFail($idCup)->ESTADO !== 'Inscripciones') {
            return back()->withErrors(['error' => 'Acción no permitida: La remoción de docentes solo se puede realizar en estado Inscripciones.']);
        }

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
