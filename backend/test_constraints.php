<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$id = 7;
$clases = \DB::table('CLASE')->where('BLOQUE_HORARIO_ID', $id)->count();
echo "Clases with this bloque: " . $clases . "\n";
