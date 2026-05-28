<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AulaController;

// Obtener todas las aulas
Route::get('/aulas', [AulaController::class, 'index']);

// Mostrar formulario para crear una aula (Inertia)
Route::get('/aulas/crearAula', [AulaController::class, 'create']);

// Crear una nueva aula
Route::post('/aulas', [AulaController::class, 'store']);

// Eliminar una aula
Route::delete('/aulas/{id}', [AulaController::class, 'destroy']);

// Alternar estado de una aula
Route::patch('/aulas/{id}/toggle-status', [AulaController::class, 'toggleStatus']);
