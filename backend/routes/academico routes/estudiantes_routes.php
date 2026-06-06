<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EstudianteController;

Route::get('/estudiantes', [EstudianteController::class, 'index'])->middleware('permiso:VER_ESTUDIANTES');
Route::get('/estudiantes/crearEstudiante', [EstudianteController::class, 'create'])->middleware('permiso:VER_ESTUDIANTES');
Route::get('/estudiantes/importar', function () {
    $periodos = \App\Models\Cup::orderBy('FECHA_INICIO', 'desc')->get(['ID_CUP', 'ANIO', 'SEMESTRE']);
    return inertia('estudiantes/ImportarEstudiantes', ['periodos' => $periodos]);
})->middleware('permiso:CREAR_ESTUDIANTES');
Route::post('/estudiantes/importar', [EstudianteController::class, 'importExcel'])->middleware('permiso:CREAR_ESTUDIANTES');
Route::post('/estudiantes', [EstudianteController::class, 'store'])->middleware('permiso:CREAR_ESTUDIANTES');
Route::get('/estudiantes/{id}/editar', [EstudianteController::class, 'edit'])->middleware('permiso:VER_ESTUDIANTES');
Route::put('/estudiantes/{id}', [EstudianteController::class, 'update'])->middleware('permiso:EDITAR_ESTUDIANTES');
Route::delete('/estudiantes/{id}', [EstudianteController::class, 'destroy'])->middleware('permiso:ELIMINAR_ESTUDIANTES');
