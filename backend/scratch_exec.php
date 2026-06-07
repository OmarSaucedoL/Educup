<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $sql = file_get_contents('C:\Users\Yo\.gemini\antigravity-ide\brain\1464138b-a0ad-469e-b74a-5bd0ca3db72b\scratch\update_procs.sql');
    DB::unprepared($sql);
    echo "Procedures updated successfully.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
