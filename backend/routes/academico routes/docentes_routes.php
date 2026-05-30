<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DocenteController;

// Obtener todos los docentes
Route::get('/docentes', [DocenteController::class, 'index']);

// Mostrar formulario para crear un docente (Inertia)
Route::get('/docentes/crearDocente', [DocenteController::class, 'create']);

// Obtener un docente específico
Route::get('/docentes/{id}', [DocenteController::class, 'show']);

// Crear un nuevo docente
Route::post('/docentes', [DocenteController::class, 'store']);

// Modificar un docente existente
Route::put('/docentes/{id}', [DocenteController::class, 'update']);

// Alternar estado (ACTIVO / INACTIVO) del usuario asociado
Route::patch('/docentes/{id}/toggle-estado', [DocenteController::class, 'toggleEstado']);