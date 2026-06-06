<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AulaController;

Route::get('/aulas', [AulaController::class, 'index'])->middleware('permiso:VER_AULAS');
Route::get('/aulas/crearAula', [AulaController::class, 'create'])->middleware('permiso:VER_AULAS');
Route::post('/aulas', [AulaController::class, 'store'])->middleware('permiso:CREAR_AULAS');
Route::delete('/aulas/{id}', [AulaController::class, 'destroy'])->middleware('permiso:ELIMINAR_AULAS');
Route::patch('/aulas/{id}/toggle-status', [AulaController::class, 'toggleStatus'])->middleware('permiso:EDITAR_AULAS');
Route::get('/aulas/{id}/editar', [AulaController::class, 'edit'])->middleware('permiso:VER_AULAS');
Route::put('/aulas/{id}', [AulaController::class, 'update'])->middleware('permiso:EDITAR_AULAS');
