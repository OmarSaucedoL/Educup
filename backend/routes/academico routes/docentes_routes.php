<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DocenteController;

Route::get('/docentes', [DocenteController::class, 'index'])->middleware('permiso:VER_DOCENTES');
Route::get('/docentes/crearDocente', [DocenteController::class, 'create'])->middleware('permiso:VER_DOCENTES');
Route::get('/docentes/{id}', [DocenteController::class, 'show'])->middleware('permiso:VER_DOCENTES');
Route::post('/docentes', [DocenteController::class, 'store'])->middleware('permiso:CREAR_DOCENTES');
Route::put('/docentes/{id}', [DocenteController::class, 'update'])->middleware('permiso:EDITAR_DOCENTES');
Route::patch('/docentes/{id}/toggle-estado', [DocenteController::class, 'toggleEstado'])->middleware('permiso:EDITAR_DOCENTES');