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
        $docentes = Docente::with('usuario')->get();
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
            'CODIGO' => 'required|integer|exists:USUARIO,ID|unique:DOCENTE,CODIGO'
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
            'CODIGO' => 'sometimes|required|integer|exists:USUARIO,ID'
        ]);

        $docente->update($validated);

        return redirect('/docentes')->with('success', 'Docente actualizado correctamente.');
    }
}
