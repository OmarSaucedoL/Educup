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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
}
