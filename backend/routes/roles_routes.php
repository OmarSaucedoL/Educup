<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RolController;

Route::get('/roles', [RolController::class, 'index'])->name('roles.index');
Route::post('/roles', [RolController::class, 'store'])->name('roles.store');
Route::put('/roles/{id}', [RolController::class, 'update'])->name('roles.update');
