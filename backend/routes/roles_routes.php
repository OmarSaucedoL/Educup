<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RolController;

Route::get('/roles', [RolController::class, 'index'])->name('roles.index')->middleware('permiso:VER_ROLES_PERMISOS');
Route::post('/roles', [RolController::class, 'store'])->name('roles.store')->middleware('permiso:CREAR_ROLES');
Route::put('/roles/{id}', [RolController::class, 'update'])->name('roles.update')->middleware('permiso:EDITAR_ROLES');
