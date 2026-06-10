<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\InscripcionPublicaController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => \Illuminate\Foundation\Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::get('/inscripcion-cup', [InscripcionPublicaController::class, 'create'])->name('inscripcion-cup.create');
Route::post('/inscripcion-cup', [InscripcionPublicaController::class, 'store'])->name('inscripcion-cup.store');

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

        // Dashboard del administrador — indicadores estadísticos
        $cup = \App\Models\Cup::where('ESTADO', '!=', 'Concluido')
            ->orderBy('ID_CUP', 'desc')
            ->first()
            ?? \App\Models\Cup::orderBy('ID_CUP', 'desc')->first();

        $stats = [
            'totalInscritos'  => 0,
            'totalAprobados'  => 0,
            'totalReprobados' => 0,
            'totalGrupos'     => 0,
        ];

        if ($cup) {
            $stats['totalInscritos']  = \App\Models\EstudianteCup::where('ID_CUP', $cup->ID_CUP)->count();
            $stats['totalAprobados']  = \App\Models\EstudianteCup::where('ID_CUP', $cup->ID_CUP)->where('ESTADO', 'Aprobado')->count();
            $stats['totalReprobados'] = \App\Models\EstudianteCup::where('ID_CUP', $cup->ID_CUP)->where('ESTADO', 'Reprobado')->count();
            $stats['totalGrupos']     = \App\Models\Clase::where('ID_CUP', $cup->ID_CUP)->distinct('ID_GRUPO')->count('ID_GRUPO');
        }

        if (str_contains($rolNombre, 'ESTUDIANTE')) {
            $estudiante = \App\Models\Estudiante::where('USUARIO_ID', $user->ID)->first();
            $cupsDisponibles = [];
            $cup = null;
            $clases = [];
            $grupo = null;

            if ($estudiante) {
                // Obtener todos los CUPs en los que el estudiante se ha inscrito
                $cupsDisponibles = \App\Models\Cup::whereHas('estudianteCups', function($q) use ($estudiante) {
                    $q->where('ID_ESTUDIANTE', $estudiante->ID_ESTUDIANTE);
                })->orderBy('ID_CUP', 'desc')->get();

                if ($cupsDisponibles->count() > 0) {
                    $selectedCupId = request('cup_id');
                    if ($selectedCupId) {
                        $cup = $cupsDisponibles->firstWhere('ID_CUP', $selectedCupId);
                    }
                    
                    if (!$cup) {
                        $cup = $cupsDisponibles->first();
                    }

                    // Buscar la inscripción en el CUP actual
                    $estudianteCup = \App\Models\EstudianteCup::where('ID_CUP', $cup->ID_CUP)
                        ->where('ID_ESTUDIANTE', $estudiante->ID_ESTUDIANTE)
                        ->first();
                    
                    if ($estudianteCup) {
                        $clases = \App\Models\EstudianteClase::where('ESTUDIANTE_CUP_ID', $estudianteCup->ID)
                            ->with([
                                'clase.materia', 
                                'clase.grupo', 
                                'clase.docenteCup.docente.usuario', 
                                'clase.bloqueHorario.horariosEnBloque.horario', 
                                'clase.aula', 
                                'calificaciones'
                            ])
                            ->get();

                        if ($clases->count() > 0) {
                            $grupo = $clases->first()->clase->grupo;
                        }
                    }
                }
            }

            return Inertia::render('dashboard-estudiante', [
                'cup' => $cup,
                'cups_disponibles' => $cupsDisponibles,
                'clases' => $clases,
                'grupo' => $grupo
            ]);
        }

        return Inertia::render('dashboard', [
            'cup'   => $cup,
            'stats' => $stats,
        ]);
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
