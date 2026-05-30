<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$cup = App\Models\Cup::with(['clases.grupo.estudiantesCup', 'clases.estudiantesClase'])->find(3);
if ($cup && $cup->clases->count() > 0) {
    $clase = $cup->clases->first();
    echo "Grupo EST_MIN: " . $clase->grupo->EST_MIN . "\n";
    echo "Grupo EST_MAX: " . $clase->grupo->EST_MAX . "\n";
    echo "Estudiantes Cup Count: " . ($clase->grupo->estudiantesCup ? $clase->grupo->estudiantesCup->count() : 0) . "\n";
    echo "Estudiantes Clase Count: " . ($clase->estudiantesClase ? $clase->estudiantesClase->count() : 0) . "\n";
} else {
    echo "No classes found.\n";
}
