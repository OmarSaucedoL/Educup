<?php

namespace App\Http\Controllers;

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
        return inertia('cup/index', [
            'cups' => $cups
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
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
            'SEMESTRE' => 'required|string|max:20',
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
            'estudianteCups.estudiante',
        ])->findOrFail($id);

        // All active docentes (even those already assigned)
        $docentesActivos = Docente::with('usuario')
            ->whereHas('usuario', fn($q) => $q->where('ESTADO', 'ACTIVO'))
            ->get();

        return inertia('cup/informacion', [
            'cup'             => $cup,
            'docentesActivos' => $docentesActivos,
        ]);
    }

    public function clases(string $id)
    {
        $cup = Cup::with([
            'clases.materia',
            'clases.grupo',
            'clases.bloqueHorario.horariosEnBloque.horario',
            'clases.aula',
            'clases.docenteCup.docente.usuario',
        ])->findOrFail($id);

        return inertia('cup/clases', [
            'cup' => $cup,
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
            'SEMESTRE' => 'required|string|max:20',
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

            // Sync CarreraCup
            CarreraCup::where('ID_CUP', $cup->ID_CUP)->delete();
            foreach ($validated['carreras'] as $carreraData) {
                CarreraCup::create([
                    'ID_CUP' => $cup->ID_CUP,
                    'ID_CARRERA' => $carreraData['ID_CARRERA'],
                    'CUPOS' => $carreraData['CUPOS']
                ]);
            }

            // Sync MateriaCup
            MateriaCup::where('ID_CUP', $cup->ID_CUP)->delete();
            foreach ($validated['materias'] as $materiaId) {
                MateriaCup::create([
                    'ID_CUP' => $cup->ID_CUP,
                    'ID_MATERIA' => $materiaId
                ]);
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

        return inertia('cup/crearClases', [
            'cup' => $cup,
            'inscritos' => $inscritos,
            'turnos' => $turnos,
        ]);
    }

    /**
     * Crea un paquete de clases basado en grupos calculados dinámicamente.
     */
    public function crearPaqueteClases(Request $request, string $idCup)
    {
        $validated = $request->validate([
            'EST_MIN' => 'required|integer|min:1',
            'EST_MAX' => 'required|integer|gte:EST_MIN',
            'turnos' => 'required|array|min:1',
            'turnos.*' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $inscritos = \App\Models\EstudianteCup::where('ID_CUP', $idCup)->count();
            
            if ($inscritos === 0) {
                throw ValidationException::withMessages(['inscritos' => 'No hay estudiantes inscritos. No se puede calcular la cantidad de grupos.']);
            }

            $cup = Cup::with('materias')->findOrFail($idCup);
            $materias = $cup->materias;

            if ($materias->count() !== 4) {
                throw ValidationException::withMessages(['cup' => 'El CUP no tiene exactamente 4 materias asignadas.']);
            }

            $estMax = $validated['EST_MAX'];
            $estMin = $validated['EST_MIN'];
            
            $numGruposCompletos = floor($inscritos / $estMax);
            $sobrantes = $inscritos % $estMax;
            
            $totalGrupos = $numGruposCompletos;
            if ($sobrantes >= $estMin) {
                $totalGrupos++;
            }
            if ($totalGrupos == 0) {
                $totalGrupos = 1; // Al menos un grupo si hay inscritos > 0 pero menos del mínimo
            }

            $turnosSeleccionados = $validated['turnos'];
            $numTurnos = count($turnosSeleccionados);

            // Repartir los grupos entre los turnos usando Round-Robin
            for ($i = 0; $i < $totalGrupos; $i++) {
                $turnoNombre = $turnosSeleccionados[$i % $numTurnos];
                
                // Generar nombre de grupo: años(2 dígitos) + semestre + número de grupo
                $anioCorto = substr((string)$cup->ANIO, -2);
                $nombreGrupo = $anioCorto . $cup->SEMESTRE . ($i + 1);

                // 1. Crear el Grupo en la BD
                $grupo = Grupo::create([
                    'NOMBRE' => $nombreGrupo,
                    'EST_MIN' => $estMin,
                    'EST_MAX' => $estMax
                ]);

                // 2. Obtener bloque horario para el turno
                $bloque = BloqueHorario::where('TURNO', $turnoNombre)->first();
                if (!$bloque) {
                    throw ValidationException::withMessages(['turnos' => "No se encontró el bloque horario para el turno: $turnoNombre."]);
                }

                // 3. Crear 4 clases para este grupo usando las materias obligatorias
                for ($j = 0; $j < 4; $j++) {
                    Clase::create([
                        'ID_CUP' => $idCup,
                        'ID_MATERIA' => $materias[$j]->ID_MATERIA,
                        'ID_BLOQUE_HORARIO' => $bloque->ID_BLOQUE_HORARIO,
                        'ID_GRUPO' => $grupo->ID_GRUPO,
                        'DOCENTE_CUP_ID' => null,
                        'ID_AULA' => null,
                    ]);
                }
            }

            DB::commit();

            return redirect("/cup/{$idCup}")->with('success', "Algoritmo completado: Se generaron {$totalGrupos} grupo(s) distribuidos en los turnos seleccionados.");
        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages(['error' => 'Error en base de datos: ' . $e->getMessage()]);
        }
    }
}
