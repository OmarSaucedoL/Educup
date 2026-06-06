<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HorarioController;

Route::get('/horarios', [HorarioController::class, 'index'])->middleware('permiso:VER_HORARIOS');
Route::get('/horarios/crearHorario', [HorarioController::class, 'create'])->middleware('permiso:VER_HORARIOS');
Route::get('/horarios/{id}', [HorarioController::class, 'show'])->middleware('permiso:VER_HORARIOS');
Route::post('/horarios', [HorarioController::class, 'store'])->middleware('permiso:CREAR_HORARIOS');
Route::put('/horarios/{id}', [HorarioController::class, 'update'])->middleware('permiso:EDITAR_HORARIOS');
Route::get('/horarios/{id}/editar', [HorarioController::class, 'edit'])->middleware('permiso:VER_HORARIOS');
Route::delete('/horarios/{id}', [HorarioController::class, 'destroy'])->middleware('permiso:ELIMINAR_HORARIOS');