<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CUPController;

// Obtener todos los CUPs
Route::get('/cup', [CUPController::class, 'index']);

// Mostrar formulario para crear un CUP (Inertia)
Route::get('/cup/crearCUP', [CUPController::class, 'create']);

// Obtener un CUP específico
Route::get('/cup/{id}', [CUPController::class, 'show']);
Route::get('/cup/{id}/clases', [CUPController::class, 'clases']);
Route::get('/cup/{id}/grupos/{grupoId}', [CUPController::class, 'grupoDetalles']);

// Crear un nuevo CUP
Route::post('/cup', [CUPController::class, 'store']);

// Modificar un CUP existente
Route::get('/cup/{id}/editar', [CUPController::class, 'edit']);
Route::put('/cup/{id}', [CUPController::class, 'update']);

// Ver docentes asignados a un CUP
Route::get('/cup/{id}/docentes', [CUPController::class, 'docentes']);

// Asignar docentes (con materias) a un CUP
Route::post('/cup/{id}/docentes', [CUPController::class, 'asignarDocentes']);

// Asignación automática de docentes
Route::post('/cup/{id}/asignar-docentes-auto', [CUPController::class, 'asignacionAutomatica']);

// Remover todos los docentes de las clases de un CUP
Route::delete('/cup/{id}/remover-docentes', [CUPController::class, 'removerDocentes']);

// Crear paquete de clases
Route::get('/cup/{id}/clases/crear', [CUPController::class, 'crearClasesForm']);
Route::post('/cup/{id}/clases', [CUPController::class, 'crearPaqueteClases']);

// Redirección genérica para ver las clases del CUP actual/último
Route::get('/clases', function() {
    $cup = \App\Models\Cup::where('ESTADO', 'En curso')->orderBy('ID_CUP', 'desc')->first();
    if (!$cup) {
        $cup = \App\Models\Cup::orderBy('ID_CUP', 'desc')->first();
    }
    if (!$cup) {
        return redirect('/cup')->withErrors(['error' => 'No hay ningún CUP registrado en el sistema para ver sus clases.']);
    }
    return redirect("/cup/{$cup->ID_CUP}/clases");
});