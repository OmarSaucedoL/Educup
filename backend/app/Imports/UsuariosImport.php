<?php

namespace App\Imports;

use App\Models\Rol;
use App\Models\Usuario;
use App\Models\Docente;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UsuariosImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Saltar filas vacías
        if (empty(array_filter($row))) {
            return null;
        }

        // Fase 1: Validación del Rol
        $rolNombre = strtoupper(trim($row['rol'] ?? ''));

        $rol = Rol::where('NOMBRE', $rolNombre)->first();

        if (!$rol) {
            throw new \Exception("El rol '" . ($row['rol'] ?? '') . "' no es válido en el sistema. Proceso abortado.");
        }

        // Fase 2: Registro en la Tabla USUARIO
        $usuario = Usuario::create([
            'USERNAME'       => strtoupper(trim($row['username'] ?? '')),
            'CONTRASENIA'    => Hash::make($row['contrasenia'] ?? ''),
            'CARNET'         => strtoupper(trim($row['carnet'] ?? '')),
            'NOMBRE'         => strtoupper(trim($row['nombre'] ?? '')),
            'APELLIDO'       => strtoupper(trim($row['apellido'] ?? '')),
            'CORREO'         => strtolower(trim($row['correo'] ?? '')),
            'ESTADO'         => 1, // Por defecto ACTIVO (1)
            'FECHA_CREACION' => now(),
            'ROL_ID'         => $rol->ID,
        ]);

        // Fase 3: Lógica Condicional de Docentes
        if (str_contains($rolNombre, 'DOCENTE')) {
            Docente::create([
                'CODIGO_DOCENTE' => $usuario->ID
            ]);
        }

        // Fase 4: Inicialización de Permisos desde el Rol
        if ($usuario->ROL_ID) {
            $rolPermisosIds = \Illuminate\Support\Facades\DB::table('PERMISO_ROL')
                ->where('ROL_ID', $usuario->ROL_ID)
                ->where('ESTADO', 'ACTIVO')
                ->pluck('PERMISOS_ID');
            
            foreach ($rolPermisosIds as $permId) {
                \Illuminate\Support\Facades\DB::table('PERMISOS_USUARIO')->insert([
                    'USUARIO_ID' => $usuario->ID,
                    'PERMISOS_ID' => $permId,
                    'ESTADO' => 'ACTIVO',
                    'FECHA_MOD' => now()
                ]);
            }
        }

        return $usuario;
    }
}
