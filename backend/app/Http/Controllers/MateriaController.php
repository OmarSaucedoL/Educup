<?php

namespace App\Http\Controllers;

use App\Models\Materia;
use Illuminate\Http\Request;

class MateriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $materias = Materia::all();
        return inertia('materias/index', [
            'materias' => $materias
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('materias/crearMateria');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'NOMBRE' => 'required|string|max:255'
        ]);

        $materia = Materia::create($validated);

        return redirect('/materias')->with('success', 'Materia creada correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $materia = Materia::findOrFail($id);
        return response()->json($materia);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $materia = Materia::findOrFail($id);

        $validated = $request->validate([
            'NOMBRE' => 'sometimes|required|string|max:255'
        ]);

        $materia->update($validated);

        return redirect('/materias')->with('success', 'Materia actualizada correctamente.');
    }
}
