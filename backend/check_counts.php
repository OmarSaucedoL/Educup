<?php
$cup = \App\Models\Cup::orderBy('ID_CUP', 'desc')->first();
$count = \App\Models\EstudianteCup::where('ID_CUP', $cup->ID_CUP)->count();
echo "Estudiantes en CUP activo ($cup->ID_CUP): $count\n";

$estudiantesInactivos = \App\Models\Estudiante::where('ESTADO', 'INACTIVO')->count();
$estudiantesActivos = \App\Models\Estudiante::where('ESTADO', 'ACTIVO')->count();
echo "Estudiantes INACTIVOS en BD: $estudiantesInactivos\n";
echo "Estudiantes ACTIVOS en BD: $estudiantesActivos\n";
