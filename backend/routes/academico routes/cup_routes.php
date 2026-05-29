<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CUPController;

// Obtener todos los CUPs
Route::get('/cup', [CUPController::class, 'index']);

// Mostrar formulario para crear un CUP (Inertia)
Route::get('/cup/crearCUP', [CUPController::class, 'create']);

// Obtener un CUP específico
Route::get('/cup/{id}', [CUPController::class, 'show']);

// Crear un nuevo CUP
Route::post('/cup', [CUPController::class, 'store']);

// Modificar un CUP existente
Route::get('/cup/{id}/editar', [CUPController::class, 'edit']);
Route::put('/cup/{id}', [CUPController::class, 'update']);