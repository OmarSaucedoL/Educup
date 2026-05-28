<?php

namespace App\Http\Controllers;

use App\Models\Aula;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AulaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $aulas = Aula::all();
        
        return Inertia::render('aulas/index', [
            'aulas' => $aulas
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('aulas/crearAula');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'NOMBRE' => 'required|string|max:255',
            'DESCRIPCION' => 'nullable|string|max:1000',
            'ESTADO' => 'required|string|in:ACTIVO,INACTIVO',
        ]);

        Aula::create($validated);

        return redirect('/aulas')->with('success', 'Aula creada correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $aula = Aula::findOrFail($id);
            $aula->delete();
            return redirect('/aulas')->with('success', 'Aula eliminada correctamente.');
        } catch (\Illuminate\Database\QueryException $e) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'id' => 'No se puede eliminar esta aula porque está asignada a una clase o tiene registros relacionados.'
            ]);
        }
    }

    /**
     * Toggle classroom status.
     */
    public function toggleStatus($id)
    {
        $aula = Aula::findOrFail($id);
        $aula->ESTADO = $aula->ESTADO === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        $aula->save();

        return redirect('/aulas')->with('success', 'Estado de aula actualizado.');
    }
}
