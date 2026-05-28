<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $b = App\Models\BloqueHorario::first();
    if ($b) {
        echo 'Found: ' . $b->ID . PHP_EOL;
        $b->delete();
        echo 'Deleted successfully' . PHP_EOL;
    } else {
        echo 'No bloques found' . PHP_EOL;
    }
} catch (\Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
