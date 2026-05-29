<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MateriaController;

// Obtener todas las materias
Route::get('/materias', [MateriaController::class, 'index']);

// Mostrar formulario para crear una materia (Inertia)
Route::get('/materias/crearMateria', [MateriaController::class, 'create']);

// Obtener una materia específica
Route::get('/materias/{id}', [MateriaController::class, 'show']);

// Crear una nueva materia
Route::post('/materias', [MateriaController::class, 'store']);

// Modificar una materia existente
Route::put('/materias/{id}', [MateriaController::class, 'update']);

// Mostrar formulario para editar una materia (Inertia)
Route::get('/materias/{id}/editar', [MateriaController::class, 'edit']);

// Eliminar una materia existente
Route::delete('/materias/{id}', [MateriaController::class, 'destroy']);
