<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user()->load('rol');
        $rolNombre = strtoupper($user->rol?->NOMBRE ?? '');

        if (str_contains($rolNombre, 'DOCENTE')) {
            $cup = \App\Models\Cup::where('ESTADO', 'En curso')->orderBy('ID_CUP', 'desc')->first()
                ?? \App\Models\Cup::orderBy('ID_CUP', 'desc')->first();

            $clases = [];
            if ($cup) {
                $clases = \App\Models\Clase::where('ID_CUP', $cup->ID_CUP)
                    ->whereHas('docenteCup', function ($query) use ($user) {
                        $query->where('CODIGO_DOCENTE', $user->ID);
                    })
                    ->with(['materia', 'grupo', 'bloqueHorario.horariosEnBloque.horario', 'aula'])
                    ->withCount('estudianteCups')
                    ->get();
            }

            return Inertia::render('dashboard-docente', [
                'cup' => $cup,
                'clases' => $clases
            ]);
        }

        return Inertia::render('dashboard');
    })->name('dashboard');

    require __DIR__.'/usuarios_routes.php';
    require __DIR__.'/academico routes/cup_routes.php';
    require __DIR__.'/academico routes/docentes_routes.php';
    require __DIR__.'/academico routes/estudiantes_routes.php';
    require __DIR__.'/academico routes/materias_routes.php';
    require __DIR__.'/academico routes/horarios_routes.php';
    require __DIR__.'/academico routes/aulas_routes.php';
    require __DIR__.'/bitacora_routes.php';
    require __DIR__.'/roles_routes.php';
    require __DIR__.'/academico routes/notas_routes.php';
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
