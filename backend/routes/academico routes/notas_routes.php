<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotasController;

Route::get('/notas/clases', [NotasController::class, 'clases'])->middleware('permiso:VER_CALIFICACIONES');
Route::get('/notas/clases/{id_clase}', [NotasController::class, 'gestionar'])->middleware('permiso:VER_CALIFICACIONES');
Route::post('/notas/clases/{id_clase}', [NotasController::class, 'guardarNotas'])->middleware('permiso:REGISTRAR_NOTAS');
