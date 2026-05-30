<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$clases = \Illuminate\Support\Facades\DB::select('SELECT c."ID_CLASE", cup."ANIO", cup."SEMESTRE", g."NOMBRE" AS "GRUPO", m."NOMBRE" AS "MATERIA", bh."TURNO", (SELECT STRING_AGG(h."DIA" || \' (\' || h."HORA_INI"::time || \' a \' || h."HORA_FIN"::time || \')\', \', \') FROM "HORARIO_EN_BLOQUE" heb JOIN "HORARIO" h ON heb."HORARIO_ID" = h."ID" WHERE heb."ID_BLOQUE_HORARIO" = c."ID_BLOQUE_HORARIO") AS "HORARIOS" FROM "CLASE" c LEFT JOIN "CUP" cup ON c."ID_CUP" = cup."ID_CUP" LEFT JOIN "GRUPO" g ON c."ID_GRUPO" = g."ID_GRUPO" LEFT JOIN "MATERIA" m ON c."ID_MATERIA" = m."ID_MATERIA" LEFT JOIN "BLOQUE_HORARIO" bh ON c."ID_BLOQUE_HORARIO" = bh."ID_BLOQUE_HORARIO" ORDER BY cup."ANIO" DESC, cup."SEMESTRE" DESC, g."NOMBRE", m."NOMBRE" LIMIT 4;');
print_r($clases);
