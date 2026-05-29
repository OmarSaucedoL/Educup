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
        $bloque = BloqueHorario::with('horariosEnBloque.horario')->findOrFail($id);
        
        $firstHb = $bloque->horariosEnBloque->first();
        
        $horaInicio = '';
        $cargaHoraria = 90;
        $dias = [];
        
        if ($firstHb) {
            $cargaHoraria = $firstHb->CARGA_HORARIA;
            if ($firstHb->horario) {
                $horaInicio = substr($firstHb->horario->HORA_INI, 0, 5);
            }
            
            $dias = $bloque->horariosEnBloque->map(function ($hb) {
                return $hb->horario ? $hb->horario->DIA : null;
            })->filter()->unique()->values()->toArray();
        }

        return Inertia::render('horarios/editarHorario', [
            'bloque' => [
                'ID_BLOQUE_HORARIO' => $bloque->ID_BLOQUE_HORARIO,
                'TURNO' => $bloque->TURNO,
                'HORA_INICIO' => $horaInicio,
                'DIAS' => $dias,
                'CARGA_HORARIA' => $cargaHoraria
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'TURNO' => 'required|string|max:30',
            'HORA_INICIO' => 'required|string',
            'DIAS' => 'required|array|min:1',
            'DIAS.*' => 'required|string|in:LUNES,MARTES,MIERCOLES,JUEVES,VIERNES,SABADO,DOMINGO',
            'CARGA_HORARIA' => 'required|integer|min:1',
        ]);

        $bloque = BloqueHorario::findOrFail($id);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            // 1. Hour validations
            $horaInicio = $validated['HORA_INICIO'];
            if ($horaInicio < '07:00:00' || $horaInicio > '20:00:00') {
                throw new \Exception("La hora de inicio ($horaInicio) debe estar entre las 07:00 y las 20:00.");
            }

            $totalMinutes = $validated['CARGA_HORARIA'] * 2;
            $horaFinClase = date('H:i:s', strtotime("+$totalMinutes minutes", strtotime($horaInicio)));
            
            if ($horaFinClase > '22:00:00' || $horaFinClase < '07:00:00') {
                throw new \Exception("El bloque terminaría a las $horaFinClase, excediendo el límite de las 22:00.");
            }

            // 2. Update header
            $bloque->update([
                'TURNO' => strtoupper($validated['TURNO'])
            ]);

            // 3. Clear old child rows in HORARIO_EN_BLOQUE
            \Illuminate\Support\Facades\DB::table('HORARIO_EN_BLOQUE')->where('ID_BLOQUE_HORARIO', $id)->delete();

            // 4. Distribute days and periods
            foreach ($validated['DIAS'] as $dia) {
                $horaActual = $horaInicio;
                for ($materiaContador = 1; $materiaContador <= 2; $materiaContador++) {
                    $carga = $validated['CARGA_HORARIA'];
                    $horaFinPeriodo = date('H:i:s', strtotime("+$carga minutes", strtotime($horaActual)));

                    // Check or insert Horario
                    $horario = \Illuminate\Support\Facades\DB::table('HORARIO')
                        ->where('DIA', strtoupper($dia))
                        ->where('HORA_INI', $horaActual)
                        ->where('HORA_FIN', $horaFinPeriodo)
                        ->first();

                    if (!$horario) {
                        $horarioId = \Illuminate\Support\Facades\DB::table('HORARIO')->insertGetId([
                            'DIA' => strtoupper($dia),
                            'HORA_INI' => $horaActual,
                            'HORA_FIN' => $horaFinPeriodo
                        ]);
                    } else {
                        $horarioId = $horario->ID;
                    }

                    // Insert new child link
                    \Illuminate\Support\Facades\DB::table('HORARIO_EN_BLOQUE')->insert([
                        'HORARIO_ID' => $horarioId,
                        'ID_BLOQUE_HORARIO' => $id,
                        'CARGA_HORARIA' => $carga
                    ]);

                    $horaActual = $horaFinPeriodo;
                }
            }

            \Illuminate\Support\Facades\DB::commit();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            throw ValidationException::withMessages([
                'HORA_INICIO' => $e->getMessage()
            ]);
        }

        return redirect('/horarios')->with('success', 'Bloque de horario actualizado correctamente.');
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
