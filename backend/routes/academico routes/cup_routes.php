<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CUPController;

Route::get('/cup', [CUPController::class, 'index'])->middleware('permiso:VER_CUP');
Route::get('/cup/crearCUP', [CUPController::class, 'create'])->middleware('permiso:VER_CUP');
Route::get('/cup/{id}', [CUPController::class, 'show'])->middleware('permiso:VER_CUP');
Route::get('/cup/{id}/clases', [CUPController::class, 'clases'])->middleware('permiso:VER_CUP');
Route::get('/cup/{id}/grupos/{grupoId}', [CUPController::class, 'grupoDetalles'])->middleware('permiso:VER_CUP');
Route::post('/cup/{id}/grupos/{grupoId}/estudiantes', [CUPController::class, 'agregarEstudianteGrupo'])->middleware('permiso:GESTIONAR_GRUPOS_CLASES');
Route::delete('/cup/{id}/grupos/{grupoId}/estudiantes/{estudianteId}', [CUPController::class, 'removerEstudianteGrupo'])->middleware('permiso:GESTIONAR_GRUPOS_CLASES');
Route::put('/cup/{id}/clases/{claseId}/docente', [CUPController::class, 'asignarDocenteClase'])->middleware('permiso:ASIGNAR_DOCENTES_CUP');
Route::delete('/cup/{id}/clases/{claseId}/docente', [CUPController::class, 'removerDocenteClase'])->middleware('permiso:ASIGNAR_DOCENTES_CUP');
Route::post('/cup', [CUPController::class, 'store'])->middleware('permiso:GESTIONAR_CUP');
Route::get('/cup/{id}/editar', [CUPController::class, 'edit'])->middleware('permiso:VER_CUP');
Route::put('/cup/{id}', [CUPController::class, 'update'])->middleware('permiso:GESTIONAR_CUP');
Route::get('/cup/{id}/docentes', [CUPController::class, 'docentes'])->middleware('permiso:VER_CUP');
Route::get('/cup/{id}/estudiantes', [CUPController::class, 'estudiantes'])->middleware('permiso:VER_ESTUDIANTES');
Route::get('/cup/{id}/cierre', [CUPController::class, 'cierreForm'])->middleware('permiso:CERRAR_GESTION_CUP');
Route::post('/cup/{id}/cierre', [CUPController::class, 'ejecutarCierre'])->middleware('permiso:CERRAR_GESTION_CUP');
Route::post('/cup/{id}/docentes', [CUPController::class, 'asignarDocentes'])->middleware('permiso:ASIGNAR_DOCENTES_CUP');
Route::post('/cup/{id}/asignar-docentes-auto', [CUPController::class, 'asignacionAutomatica'])->middleware('permiso:ASIGNAR_DOCENTES_CUP');
Route::delete('/cup/{id}/remover-docentes', [CUPController::class, 'removerDocentes'])->middleware('permiso:ASIGNAR_DOCENTES_CUP');
Route::post('/cup/{id}/asignar-aulas-auto', [CUPController::class, 'asignarAulasAuto'])->middleware('permiso:ASIGNAR_AULAS_CUP');
Route::delete('/cup/{id}/remover-aulas', [CUPController::class, 'removerAulas'])->middleware('permiso:ASIGNAR_AULAS_CUP');
Route::get('/cup/{id}/clases/crear', [CUPController::class, 'crearClasesForm'])->middleware('permiso:GESTIONAR_GRUPOS_CLASES');
Route::post('/cup/{id}/clases', [CUPController::class, 'crearPaqueteClases'])->middleware('permiso:GESTIONAR_GRUPOS_CLASES');
Route::post('/cup/{id}/clases/rezagados', [CUPController::class, 'asignarRezagados'])->middleware('permiso:GESTIONAR_GRUPOS_CLASES');
Route::delete('/cup/{id}/clases', [CUPController::class, 'resetearPaqueteClases'])->middleware('permiso:GESTIONAR_GRUPOS_CLASES');
Route::put('/cup/{id}/grupos/capacidad', [CUPController::class, 'modificarCapacidadGrupos'])->middleware('permiso:GESTIONAR_GRUPOS_CLASES');


Route::get('/clases', function() {
    $cup = \App\Models\Cup::where('ESTADO', 'En curso')->orderBy('ID_CUP', 'desc')->first();
    if (!$cup) {
        $cup = \App\Models\Cup::orderBy('ID_CUP', 'desc')->first();
    }
    if (!$cup) {
        return redirect('/cup')->withErrors(['error' => 'No hay ningún CUP registrado en el sistema para ver sus clases.']);
    }
    return redirect("/cup/{$cup->ID_CUP}/clases");
})->middleware('permiso:VER_CUP');

Route::get('/reportes-academicos', [\App\Http\Controllers\ReporteAcademicoController::class, 'index'])->middleware('permiso:VER_CUP');