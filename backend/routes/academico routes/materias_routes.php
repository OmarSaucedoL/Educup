<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MateriaController;

Route::get('/materias', [MateriaController::class, 'index'])->middleware('permiso:VER_MATERIAS');
Route::get('/materias/crearMateria', [MateriaController::class, 'create'])->middleware('permiso:VER_MATERIAS');
Route::get('/materias/{id}', [MateriaController::class, 'show'])->middleware('permiso:VER_MATERIAS');
Route::post('/materias', [MateriaController::class, 'store'])->middleware('permiso:GESTIONAR_MATERIAS');
Route::put('/materias/{id}', [MateriaController::class, 'update'])->middleware('permiso:GESTIONAR_MATERIAS');
Route::get('/materias/{id}/editar', [MateriaController::class, 'edit'])->middleware('permiso:VER_MATERIAS');
Route::delete('/materias/{id}', [MateriaController::class, 'destroy'])->middleware('permiso:GESTIONAR_MATERIAS');
