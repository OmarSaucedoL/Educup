<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BitacoraController;

Route::middleware(['auth'])->group(function () {
    Route::get('/bitacora', [BitacoraController::class, 'index'])->name('bitacora.index');
});
