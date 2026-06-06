<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;

Route::get('/usuarios', [UsuarioController::class, 'index'])->middleware('permiso:VER_USUARIOS');
Route::get('/usuarios/crearUsuario', [UsuarioController::class, 'create'])->middleware('permiso:CREAR_USUARIOS');
Route::get('/usuarios/importar', function () {
    return inertia('usuarios/ImportarUsuarios');
})->middleware('permiso:CREAR_USUARIOS');
Route::post('/usuarios/importar', [UsuarioController::class, 'importExcel'])->middleware('permiso:CREAR_USUARIOS');
Route::get('/usuarios/{id}', [UsuarioController::class, 'show'])->middleware('permiso:VER_USUARIOS');
Route::post('/usuarios', [UsuarioController::class, 'store'])->middleware('permiso:CREAR_USUARIOS');
Route::get('/usuarios/{id}/editar', [UsuarioController::class, 'edit'])->middleware('permiso:VER_USUARIOS');
Route::put('/usuarios/{id}', [UsuarioController::class, 'update'])->middleware('permiso:EDITAR_USUARIOS');
Route::put('/usuarios/{id}/permisos', [UsuarioController::class, 'updatePermisos'])->middleware('permiso:ASIGNAR_PERMISOS');
