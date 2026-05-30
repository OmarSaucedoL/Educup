<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use App\Models\Usuario;
use Illuminate\Http\Request;

class DocenteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Load the docentes with their underlying user info
        $docentes = Docente::with([
            'usuario',
            'docenteCups.cup',
            'docenteCups.clases.materia',
            'docenteCups.clases.grupo',
            'docenteCups.clases.bloqueHorario.horariosEnBloque.horario',
            'docenteCups.clases.aula',
        ])->get();
        return inertia('docentes/index', [
            'docentes' => $docentes
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('docentes/crearDocente');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'CODIGO_DOCENTE' => 'required|integer|exists:USUARIO,ID|unique:DOCENTE,CODIGO_DOCENTE'
        ]);

        $docente = Docente::create($validated);

        return redirect('/docentes')->with('success', 'Docente creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $docente = Docente::with('usuario')->findOrFail($id);
        return response()->json($docente);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $docente = Docente::findOrFail($id);

        $validated = $request->validate([
            'CODIGO_DOCENTE' => 'sometimes|required|integer|exists:USUARIO,ID'
        ]);

        $docente->update($validated);

        return redirect('/docentes')->with('success', 'Docente actualizado correctamente.');
    }

    /**
     * Toggle the ESTADO of the associated usuario between ACTIVO and INACTIVO.
     */
    public function toggleEstado(string $id)
    {
        $docente = Docente::with('usuario')->findOrFail($id);

        if (!$docente->usuario) {
            return back()->withErrors(['error' => 'Docente no tiene usuario asociado.']);
        }

        $docente->usuario->ESTADO = $docente->usuario->ESTADO === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        $docente->usuario->save();

        return redirect('/docentes')->with('success', 'Estado del docente actualizado.');
    }
}
