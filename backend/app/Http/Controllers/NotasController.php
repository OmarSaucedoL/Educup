<?php

namespace App\Http\Controllers;

use App\Models\Cup;
use Illuminate\Support\Facades\DB;

class NotasController extends Controller
{
    /**
     * Muestra el listado de clases del CUP activo para el módulo de notas.
     */
    public function clases(\Illuminate\Http\Request $request)
    {
        $cups = Cup::orderBy('ANIO', 'desc')->orderBy('SEMESTRE', 'desc')->get(['ID_CUP', 'ANIO', 'SEMESTRE', 'ESTADO']);

        // Si viene cup_id en la query, usamos ese; si no, el CUP activo o el más reciente
        if ($request->filled('cup_id')) {
            $cup = Cup::find((int)$request->cup_id);
        } else {
            $cup = Cup::where('ESTADO', 'En curso')->orderBy('ID_CUP', 'desc')->first()
                ?? Cup::orderBy('ID_CUP', 'desc')->first();
        }

        $clases = [];
        if ($cup) {
            $clases = \App\Models\Clase::where('ID_CUP', $cup->ID_CUP)
                ->with([
                    'materia',
                    'grupo',
                    'bloqueHorario',
                    'docenteCup.docente.usuario',
                ])
                ->withCount('estudianteCups')
                ->get();
        }

        return inertia('notas/clases', [
            'cup'    => $cup,
            'cups'   => $cups,
            'clases' => $clases,
        ]);
    }
}
