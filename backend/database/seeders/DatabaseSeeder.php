<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear un Rol Administrador por defecto
        $rolAdmin = Rol::firstOrCreate([
            'NOMBRE' => 'ADMINISTRADOR'
        ]);

        // Crear un Usuario Administrador de prueba
        Usuario::firstOrCreate(
            ['USERNAME' => 'admin_cup'],
            [
                'CONTRASENIA' => bcrypt('password123'),
                'CARNET' => 1234567,
                'NOMBRE' => 'Admin',
                'APELLIDO' => 'General',
                'CORREO' => 'admin@cup.edu',
                'ESTADO' => 'ACTIVO',
                'FECHA_CREACION' => now(),
                'ROL_ID' => $rolAdmin->ID
            ]
        );
    }
}

