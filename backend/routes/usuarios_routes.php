<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;

// Obtener todos los usuarios
Route::get('/usuarios', [UsuarioController::class, 'index']);

// Mostrar formulario para crear un usuario (Inertia)
Route::get('/usuarios/crearUsuario', [UsuarioController::class, 'create']);

// Vista de importación masiva de usuarios
Route::get('/usuarios/importar', function () {
    return inertia('usuarios/ImportarUsuarios');
});

// Importar usuarios masivamente
Route::post('/usuarios/importar', [UsuarioController::class, 'importExcel']);

// Obtener un usuario específico
Route::get('/usuarios/{id}', [UsuarioController::class, 'show']);

// Crear un nuevo usuario
Route::post('/usuarios', [UsuarioController::class, 'store']);

// Mostrar formulario para editar usuario
Route::get('/usuarios/{id}/editar', [UsuarioController::class, 'edit']);

// Modificar un usuario existente
Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);
