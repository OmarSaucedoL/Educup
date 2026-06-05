<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotasController;

// Listado de clases para el módulo de notas
Route::get('/notas/clases', [NotasController::class, 'clases']);
