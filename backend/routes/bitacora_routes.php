<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BitacoraController;

Route::get('/bitacora', [BitacoraController::class, 'index'])->name('bitacora.index')->middleware('permiso:VER_BITACORA');
