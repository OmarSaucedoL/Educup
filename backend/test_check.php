<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$bloques = App\Models\BloqueHorario::all();
echo "Total bloques: " . $bloques->count() . "\n";
foreach($bloques as $b) {
    echo "ID: " . $b->ID . "\n";
}
