<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;

// Obtener todos los usuarios
Route::get('/usuarios', [UsuarioController::class, 'index']);

// Mostrar formulario para crear un usuario (Inertia)
Route::get('/usuarios/crearUsuario', [UsuarioController::class, 'create']);

// Obtener un usuario específico
Route::get('/usuarios/{id}', [UsuarioController::class, 'show']);

// Crear un nuevo usuario
Route::post('/usuarios', [UsuarioController::class, 'store']);

// Modificar un usuario existente
Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);
