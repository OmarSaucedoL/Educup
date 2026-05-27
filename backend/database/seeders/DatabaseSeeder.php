<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Insertar ROL (Perfiles obligatorios de seguridad)
        $roles = [
            ['NOMBRE' => 'ADMINISTRADOR'],
            ['NOMBRE' => 'AUTORIDADES'],
            ['NOMBRE' => 'COORDINADOR'],
            ['NOMBRE' => 'DOCENTE'],
        ];
        DB::table('ROL')->insert($roles);

        // Recuperar IDs de roles para las llaves foráneas de usuarios
        $idAdmin = DB::table('ROL')->where('NOMBRE', 'ADMINISTRADOR')->value('ID');
        $idDocente = DB::table('ROL')->where('NOMBRE', 'DOCENTE')->value('ID');

        // 2. Insertar PERMISOS (Para el control de acceso del sistema)
        $permisos = [
            ['NOMBRE' => 'CONFIGURAR_SISTEMA'],
            ['NOMBRE' => 'CARGAR_POSTULANTES'],
            ['NOMBRE' => 'ASIGNAR_GRUPOS'],
            ['NOMBRE' => 'REGISTRAR_NOTAS'],
            ['NOMBRE' => 'VER_REPORTES'],
        ];
        DB::table('PERMISOS')->insert($permisos);

        // 3. Insertar USUARIOS base (Contraseñas seguras con Hash)
        // Usuario 1: Administrador del sistema
        $adminId = DB::table('USUARIO')->insertGetId([
            'USERNAME' => 'admin.cup',
            'CONTRASENIA' => Hash::make('Admin123'), // Contraseña para tus pruebas
            'CARNET' => 1111111,
            'NOMBRE' => 'Omar Aly',
            'APELLIDO' => 'Saucedo Lino',
            'CORREO' => 'admin@cup.edu',
            'ESTADO' => 'ACTIVO',
            'FECHA_CREACION' => now(),
            'ROL_ID' => $idAdmin
        ], 'ID');

        // Usuario 2: Cuenta ligada al perfil de un profesor
        $userDocenteId = DB::table('USUARIO')->insertGetId([
            'USERNAME' => 'docente.garzon',
            'CONTRASENIA' => Hash::make('Docente123'),
            'CARNET' => 2222222,
            'NOMBRE' => 'Angélica',
            'APELLIDO' => 'Garzón',
            'CORREO' => 'docente@cup.edu',
            'ESTADO' => 'ACTIVO',
            'FECHA_CREACION' => now(),
            'ROL_ID' => $idDocente
        ], 'ID');

        // 4. Vincular la cuenta de usuario a la tabla específica DOCENTE (Herencia PK Manual)
        DB::table('DOCENTE')->insert([
            'CODIGO' => $userDocenteId // Hereda el ID autogenerado en la tabla USUARIO
        ]);

        // 5. Insertar datos del periodo de admisión (CUP) asignado al Administrador
        $cupId = DB::table('CUP')->insertGetId([
            'ANIO' => 2026,
            'SEMESTRE' => 'I-2026',
            'NOTA_MINIMA' => 60.00,
            'CUPOS' => 150,
            'FECHA_INICIO' => '2026-06-01',
            'FECHA_FIN' => '2026-07-15',
            'USUARIO_ID' => $adminId
        ], 'ID');

        // 6. Insertar las MATERIAS fijas y obligatorias estipuladas por el examen
        $materias = [
            ['NOMBRE' => 'COMPUTACIÓN'],
            ['NOMBRE' => 'MATEMÁTICAS'],
            ['NOMBRE' => 'INGLÉS'],
            ['NOMBRE' => 'FÍSICA'],
        ];
        DB::table('MATERIA')->insert($materias);

        // 7. Insertar AULAS e infraestructura física de la FICCT
        $aulas = [
            ['NOMBRE' => 'AULA 101 - EDIFICIO NUEVO'],
            ['NOMBRE' => 'AULA 102 - EDIFICIO NUEVO'],
            ['NOMBRE' => 'LABORATORIO 1 - CÓMPUTO'],
            ['NOMBRE' => 'LABORATORIO 2 - CÓMPUTO'],
        ];
        DB::table('AULA')->insert($aulas);

        // 8. Insertar CARRERAS (sin cupos estáticos)
        $carreras = [
            ['NOMBRE' => 'INGENIERÍA INFORMÁTICA'],
            ['NOMBRE' => 'INGENIERÍA EN SISTEMAS'],
            ['NOMBRE' => 'INGENIERÍA EN REDES Y TELECOMUNICACIONES'],
        ];
        DB::table('CARRERA')->insert($carreras);

        $idInformatica = DB::table('CARRERA')->where('NOMBRE', 'INGENIERÍA INFORMÁTICA')->value('ID');
        $idSistemas = DB::table('CARRERA')->where('NOMBRE', 'INGENIERÍA EN SISTEMAS')->value('ID');
        $idRedes = DB::table('CARRERA')->where('NOMBRE', 'INGENIERÍA EN REDES Y TELECOMUNICACIONES')->value('ID');

        // 8.1. Insertar vacantes dinámicas en CARRERA_CUP
        DB::table('CARRERA_CUP')->insert([
            ['CARRERA_ID' => $idInformatica, 'CUP_ID' => $cupId, 'CUPOS' => 5], // Cupos bajos a propósito
            ['CARRERA_ID' => $idSistemas, 'CUP_ID' => $cupId, 'CUPOS' => 60],
            ['CARRERA_ID' => $idRedes, 'CUP_ID' => $cupId, 'CUPOS' => 45],
        ]);

        // 9. Insertar datos geográficos y de procedencia base (CIUDAD y COLEGIO)
        DB::table('CIUDAD')->insert([
            ['NOMBRE' => 'SANTA CRUZ DE LA SIERRA', 'DEPARTAMENTO' => 'SANTA CRUZ'],
            ['NOMBRE' => 'MONTERO', 'DEPARTAMENTO' => 'SANTA CRUZ'],
        ]);

        DB::table('COLEGIO')->insert([
            ['NOMBRE' => 'COLEGIO NACIONAL GABRIEL RENÉ MORENO'],
            ['NOMBRE' => 'COLEGIO BAUTISTA BOLIVIANO'],
            ['NOMBRE' => 'COLEGIO MARISTA'],
        ]);

        $idCiudad = DB::table('CIUDAD')->first()->ID;
        $idColegio = DB::table('COLEGIO')->first()->ID;

        // 10. Insertar Estudiante de prueba en ESTUDIANTE y su histórico en ESTUDIANTE_CUP
        $estudianteId = DB::table('ESTUDIANTE')->insertGetId([
            'CARNET' => 9999999,
            'NOMBRE' => 'Juan',
            'APELLIDO' => 'Pérez',
            'FECHA_NAC' => '2005-01-01',
            'DIRECCION' => 'Av. Estudiantil 123',
            'TELEFONO' => '70012345',
            'CORREO' => 'juan.perez@test.edu',
            'TITULO_BACHILLER' => true,
            'SEXO' => 'M',
            'ESTADO' => 'ACTIVO',
            'COLEGIO_ID' => $idColegio,
            'CIUDAD_ID' => $idCiudad
        ], 'ID');

        DB::table('ESTUDIANTE_CUP')->insert([
            'ESTUDIANTE_ID' => $estudianteId,
            'CUP_ID' => $cupId,
            'FECHA' => now(),
            'ESTADO' => 'APROBADO',
            'NOTA_FINAL' => 85.50,
            'CARRERA' => 'INGENIERÍA EN SISTEMAS'
        ]);
    }
}