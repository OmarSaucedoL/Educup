<?php

namespace App\Http\Controllers;

use App\Models\BloqueHorario;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

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
        return Inertia::render('horarios/crearHorario');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'TURNO' => 'required|string|max:30',
            'HORA_INICIO' => 'required|string',
            'DIAS' => 'required|array|min:1',
            'DIAS.*' => 'required|string|in:LUNES,MARTES,MIERCOLES,JUEVES,VIERNES,SABADO,DOMINGO',
            'CARGA_HORARIA' => 'required|integer|min:1',
        ]);

        // Convert the array to PostgreSQL native 1D array string representation: e.g. {LUNES,MIERCOLES}
        $diasPgArray = '{' . implode(',', $validated['DIAS']) . '}';

        try {
            \Illuminate\Support\Facades\DB::statement('CALL f_crear_bloque_horario_completo(?, ?, ?, ?)', [
                $validated['TURNO'],
                $validated['HORA_INICIO'],
                $diasPgArray,
                $validated['CARGA_HORARIA']
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            $errorMsg = $e->getMessage();
            $mensajeLimpio = 'Error al registrar el bloque de horario.';
            
            // Extract the custom RAISE EXCEPTION message from Postgres
            if (preg_match('/ERROR:\s*(.+?)(?:\n|Contexto|$)/i', $errorMsg, $matches)) {
                $mensajeLimpio = trim($matches[1]);
            } else {
                $mensajeLimpio = $errorMsg;
            }
            
            throw ValidationException::withMessages([
                'HORA_INICIO' => $mensajeLimpio
            ]);
        }

        return redirect('/horarios')->with('success', 'Bloque de horario registrado correctamente.');
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
        \Log::info("HorarioController::destroy called for ID: " . $id);
        $bloque = BloqueHorario::findOrFail($id);
        $bloque->delete();
        \Log::info("BloqueHorario deleted successfully for ID: " . $id);

        return redirect('/horarios')->with('success', 'Bloque de horario eliminado correctamente.');
    }
}
