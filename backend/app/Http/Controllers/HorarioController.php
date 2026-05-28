<?php

namespace App\Http\Controllers;

use App\Models\BloqueHorario;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HorarioController extends Controller
{
    public function index()
    {
        $bloques = BloqueHorario::with('horariosEnBloque.horario')->get();
        
        return Inertia::render('horarios/index', [
            'bloques' => $bloques
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

    public function show($id)
    {
        //
    }

    public function edit($id)
    {
        //
    }

    public function update(Request $request, $id)
    {
        //
    }

    public function destroy($id)
    {
        //
    }
}
