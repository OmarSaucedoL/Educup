<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EstudianteController;

// Listar todos los estudiantes
Route::get('/estudiantes', [EstudianteController::class, 'index']);

// Mostrar formulario para crear un estudiante
Route::get('/estudiantes/crearEstudiante', [EstudianteController::class, 'create']);

// Crear un nuevo estudiante
Route::post('/estudiantes', [EstudianteController::class, 'store']);
