<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CUPController;

// Obtener todos los CUPs
Route::get('/cup', [CUPController::class, 'index']);

// Mostrar formulario para crear un CUP (Inertia)
Route::get('/cup/crearCUP', [CUPController::class, 'create']);

// Obtener un CUP específico
Route::get('/cup/{id}', [CUPController::class, 'show']);
Route::get('/cup/{id}/clases', [CUPController::class, 'clases']);

// Crear un nuevo CUP
Route::post('/cup', [CUPController::class, 'store']);

// Modificar un CUP existente
Route::get('/cup/{id}/editar', [CUPController::class, 'edit']);
Route::put('/cup/{id}', [CUPController::class, 'update']);

// Asignar docentes (con materias) a un CUP
Route::post('/cup/{id}/docentes', [CUPController::class, 'asignarDocentes']);

// Crear paquete de clases
Route::get('/cup/{id}/clases/crear', [CUPController::class, 'crearClasesForm']);
Route::post('/cup/{id}/clases', [CUPController::class, 'crearPaqueteClases']);