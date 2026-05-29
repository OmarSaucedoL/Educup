<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HorarioController;

Route::get('/horarios', [HorarioController::class, 'index']);

Route::get('/horarios/crearHorario', [HorarioController::class, 'create']);

Route::get('/horarios/{id}', [HorarioController::class, 'show']);

Route::post('/horarios', [HorarioController::class, 'store']);

Route::put('/horarios/{id}', [HorarioController::class, 'update']);

Route::get('/horarios/{id}/editar', [HorarioController::class, 'edit']);

Route::delete('/horarios/{id}', [HorarioController::class, 'destroy']);