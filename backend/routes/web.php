<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/usuarios_routes.php';
require __DIR__.'/academico routes/cup_routes.php';
require __DIR__.'/academico routes/docentes_routes.php';
require __DIR__.'/academico routes/estudiantes_routes.php';
require __DIR__.'/academico routes/materias_routes.php';
require __DIR__.'/academico routes/horarios_routes.php';
require __DIR__.'/academico routes/aulas_routes.php';
