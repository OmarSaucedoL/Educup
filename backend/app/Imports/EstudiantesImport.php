<?php

namespace App\Imports;

use App\Models\Ciudad;
use App\Models\Colegio;
use App\Models\Estudiante;
use App\Models\EstudianteCup;
use App\Models\CarreraCup;
use App\Models\OpcionCarrera;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Carbon\Carbon;

class EstudiantesImport implements ToModel, WithHeadingRow
{
    private $cupId;

    public function __construct($cupId)
    {
        $this->cupId = $cupId;
    }

    public function model(array $row)
    {
        // Skip empty rows
        if (empty(array_filter($row))) {
            return null;
        }

        // Fase 0: Normalización Automática de Catálogos (firstOrCreate)
        $ciudadNombre = strtoupper(trim($row['ciudad'] ?? ''));
        $colegioNombre = strtoupper(trim($row['colegio'] ?? ''));

        $departamento = strtoupper(trim($row['departamento'] ?? 'SANTA CRUZ'));

        // Buscar en la tabla CIUDAD por el campo NOMBRE. Si no existe, crear con el DEPARTAMENTO proporcionado
        $ciudad = Ciudad::firstOrCreate(
            ['NOMBRE' => $ciudadNombre],
            ['DEPARTAMENTO' => $departamento]
        );

        // Buscar en la tabla COLEGIO por el campo NOMBRE. Si no existe, crear el registro.
        $colegio = Colegio::firstOrCreate(
            ['NOMBRE' => $colegioNombre]
        );

        // Fase 1: Registro del Estudiante
        $estudiante = Estudiante::create([
            'CARNET'           => trim($row['carnet'] ?? ''),
            'NOMBRE'           => strtoupper(trim($row['nombre'] ?? '')),
            'APELLIDO'         => strtoupper(trim($row['apellido'] ?? '')),
            'FECHA_NAC'        => isset($row['fecha_nac']) ? Carbon::parse($row['fecha_nac'])->format('Y-m-d') : null,
            'SEXO'             => strtoupper(trim($row['sexo'] ?? '')),
            'DIRECCION'        => strtoupper(trim($row['direccion'] ?? '')),
            'TELEFONO'         => trim($row['telefono'] ?? ''),
            'CORREO'           => strtolower(trim($row['correo'] ?? '')),
            'TITULO_BACHILLER' => !empty(trim($row['titulo_bachiller'] ?? '')) ? strtoupper(trim($row['titulo_bachiller'])) : 'PENDIENTE_' . trim($row['carnet'] ?? uniqid()),
            'ESTADO'           => 'ACTIVO',
            'COLEGIO_ID'       => $colegio->ID,
            'CIUDAD_ID'        => $ciudad->ID,
        ]);

        // Fase 2: Preinscripción en la Gestión
        $estudianteCup = EstudianteCup::create([
            'ID_ESTUDIANTE' => $estudiante->ID_ESTUDIANTE,
            'ID_CUP'        => $this->cupId,
            'FECHA'         => now(),
            'ESTADO'        => 'INSCRITO',
            'NOTA_FINAL'    => 0.00,
            'CARRERA'       => null,
        ]);

        // Fase 3: Asignación de Opciones de Carrera (OPCION_CARRERA)
        $this->asignarOpcionCarrera($estudianteCup->ID, $row['opcion_1'] ?? '', 1);
        $this->asignarOpcionCarrera($estudianteCup->ID, $row['opcion_2'] ?? '', 2);

        return $estudiante;
    }

    private function asignarOpcionCarrera($estudianteCupId, $valor, $opcion)
    {
        $valor = trim($valor);

        if (empty($valor)) {
            return;
        }

        // Buscar la carrera en la gestión activa.
        // Si el valor es numérico, lo buscamos por ID_CARRERA, sino, por NOMBRE
        $carreraCup = CarreraCup::whereHas('carrera', function ($query) use ($valor) {
                if (is_numeric($valor)) {
                    $query->where('ID_CARRERA', $valor);
                } else {
                    $query->where('NOMBRE', 'ILIKE', '%' . $valor . '%');
                }
            })
            ->where('ID_CUP', $this->cupId)
            ->first();

        if (!$carreraCup) {
            throw new \Exception("La carrera '{$valor}' (Opción {$opcion}) no ofertó cupos en el periodo actual o no existe.");
        }

        OpcionCarrera::create([
            'ESTUDIANTE_CUP_ID' => $estudianteCupId,
            'CARRERA_CUP_ID'    => $carreraCup->ID,
            'OPCION'            => $opcion,
        ]);
    }
}
