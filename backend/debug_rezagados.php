<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$cup = DB::table('CUP')->orderBy('ID_CUP', 'desc')->first();
if (!$cup) {
    die("No CUP found.\n");
}
$idCup = $cup->ID_CUP;

echo "CUP ID: $idCup\n";

$rezagados = DB::select("
    SELECT ec.\"ID\" AS estudiante_cup_id
    FROM public.\"ESTUDIANTE_CUP\" ec
    WHERE ec.\"ID_CUP\" = ?
      AND ec.\"ESTADO\" = 'INSCRITO'
      AND NOT EXISTS (
          SELECT 1 FROM public.\"ESTUDIANTES_CLASE\" ecl
          WHERE ecl.\"ESTUDIANTE_CUP_ID\" = ec.\"ID\"
      )
", [$idCup]);

echo "Rezagados found: " . count($rezagados) . "\n";
foreach ($rezagados as $r) {
    echo "- ID: {$r->estudiante_cup_id}\n";
}

$grupos = DB::select("
    SELECT 
        g.\"ID_GRUPO\",
        g.\"EST_MAX\",
        (
            SELECT COUNT(DISTINCT ecl.\"ESTUDIANTE_CUP_ID\")
            FROM public.\"CLASE\" c
            JOIN public.\"ESTUDIANTES_CLASE\" ecl ON c.\"ID_CLASE\" = ecl.\"ID_CLASE\"
            WHERE c.\"ID_GRUPO\" = g.\"ID_GRUPO\"
              AND c.\"ID_CUP\" = ?
        ) AS alumnos_actuales
    FROM public.\"GRUPO\" g
    WHERE EXISTS (
        SELECT 1 FROM public.\"CLASE\" cl 
        WHERE cl.\"ID_GRUPO\" = g.\"ID_GRUPO\" AND cl.\"ID_CUP\" = ?
    )
", [$idCup, $idCup]);

echo "Grupos info:\n";
foreach ($grupos as $g) {
    $disp = $g->EST_MAX - $g->alumnos_actuales;
    echo "- Grupo {$g->ID_GRUPO}: EST_MAX={$g->EST_MAX}, Actuales={$g->alumnos_actuales}, Disp={$disp}\n";
}
