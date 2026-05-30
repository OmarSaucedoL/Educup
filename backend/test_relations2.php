<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$cup = App\Models\Cup::with(['clases.estudianteCups'])->find(3);
if ($cup && $cup->clases->count() > 0) {
    $clase = $cup->clases->first();
    echo "Estudiantes Clase Count: " . ($clase->estudianteCups ? $clase->estudianteCups->count() : 0) . "\n";
} else {
    echo "No classes found.\n";
}
