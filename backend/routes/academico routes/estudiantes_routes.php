<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EstudianteController;

// Listar todos los estudiantes
Route::get('/estudiantes', [EstudianteController::class, 'index']);

// Mostrar formulario para crear un estudiante
Route::get('/estudiantes/crearEstudiante', [EstudianteController::class, 'create']);

// Vista de importación masiva
Route::get('/estudiantes/importar', function () {
    $periodos = \App\Models\Cup::orderBy('FECHA_INICIO', 'desc')->get(['ID', 'ANIO', 'SEMESTRE']);
    return inertia('estudiantes/ImportarEstudiantes', [
        'periodos' => $periodos
    ]);
});

// Importar estudiantes masivamente
Route::post('/estudiantes/importar', [EstudianteController::class, 'importExcel']);

// Crear un nuevo estudiante
Route::post('/estudiantes', [EstudianteController::class, 'store']);
