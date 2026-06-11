<?php
$latest = \App\Models\EstudianteCup::orderBy('ID', 'desc')->first();
echo "Último EstudianteCup insertado:\n";
echo "ID_ESTUDIANTE: " . $latest->ID_ESTUDIANTE . "\n";
echo "ID_CUP: " . $latest->ID_CUP . "\n";
echo "ESTADO: " . $latest->ESTADO . "\n";

$estudiante = \App\Models\Estudiante::find($latest->ID_ESTUDIANTE);
echo "Estado de este estudiante en tabla ESTUDIANTE: " . $estudiante->ESTADO . "\n";
echo "Nombre: " . $estudiante->NOMBRE . " " . $estudiante->APELLIDO . "\n";
