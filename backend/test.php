<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/api/test', 'POST', [
    'EST_MIN' => 20,
    'EST_MAX' => 40,
    'turnos' => ['MAÑANA']
]);

try {
    $response = app()->make(App\Http\Controllers\CUPController::class)->crearPaqueteClases($request, 3);
    echo "SUCCESS\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
