<?php

namespace App\Http\Controllers;

use App\Models\Cup;
use Illuminate\Http\Request;

class CUPController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Load the CUPs with the associated user (administrator)
        $cups = Cup::with('usuario')->get();
        return inertia('cup/index', [
            'cups' => $cups
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('cup/crearCUP');
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
            'CUPOS' => 'required|integer',
            'FECHA_INICIO' => 'required|date',
            'FECHA_FIN' => 'required|date|after_or_equal:FECHA_INICIO',
            'USUARIO_ID' => 'required|integer|exists:USUARIO,ID'
        ]);

        $cup = Cup::create($validated);

        return redirect('/cup')->with('success', 'CUP creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $cup = Cup::findOrFail($id);
        return response()->json($cup);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $cup = Cup::findOrFail($id);

        $validated = $request->validate([
            'ANIO' => 'sometimes|required|integer',
            'SEMESTRE' => 'sometimes|required|string|max:20',
            'NOTA_MINIMA' => 'sometimes|required|numeric',
            'CUPOS' => 'sometimes|required|integer',
            'FECHA_INICIO' => 'sometimes|required|date',
            'FECHA_FIN' => 'sometimes|required|date|after_or_equal:FECHA_INICIO',
            'USUARIO_ID' => 'sometimes|required|integer|exists:USUARIO,ID'
        ]);

        $cup->update($validated);

        return redirect('/cup')->with('success', 'CUP actualizado correctamente.');
    }
}
