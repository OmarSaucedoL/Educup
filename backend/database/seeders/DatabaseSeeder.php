<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Insertar ROL y PERMISOS (Seguridad)
        $roles = [
            ['NOMBRE' => 'ADMINISTRADOR'],
            ['NOMBRE' => 'AUTORIDADES'],
            ['NOMBRE' => 'COORDINADOR'],
            ['NOMBRE' => 'DOCENTE'],
        ];
        DB::table('ROL')->insert($roles);
        $idAdmin = DB::table('ROL')->where('NOMBRE', 'ADMINISTRADOR')->value('ID');
        $idDocente = DB::table('ROL')->where('NOMBRE', 'DOCENTE')->value('ID');

        $permisos = [
            ['NOMBRE' => 'CONFIGURAR_SISTEMA'],
            ['NOMBRE' => 'CARGAR_POSTULANTES'],
            ['NOMBRE' => 'ASIGNAR_GRUPOS'],
            ['NOMBRE' => 'REGISTRAR_NOTAS'],
            ['NOMBRE' => 'VER_REPORTES'],
        ];
        DB::table('PERMISOS')->insert($permisos);

        // 2. Insertar Catálogos: AULA, MATERIA, GRUPO, CARRERA, HORARIO
        DB::table('AULA')->insert([
            ['NOMBRE' => 'AULA 101'],
            ['NOMBRE' => 'LABORATORIO 1']
        ]);
        $idAula = DB::table('AULA')->first()->ID;

        DB::table('MATERIA')->insert([
            ['NOMBRE' => 'COMPUTACIÓN'],
            ['NOMBRE' => 'MATEMÁTICAS']
        ]);
        $idMateria = DB::table('MATERIA')->first()->ID;

        DB::table('GRUPO')->insert([
            ['EST_MIN' => 20, 'EST_MAX' => 70]
        ]);
        $idGrupo = DB::table('GRUPO')->first()->ID;

        DB::table('CARRERA')->insert([
            ['NOMBRE' => 'INGENIERÍA INFORMÁTICA'],
            ['NOMBRE' => 'INGENIERÍA EN SISTEMAS']
        ]);
        $idInformatica = DB::table('CARRERA')->where('NOMBRE', 'INGENIERÍA INFORMÁTICA')->value('ID');
        $idSistemas = DB::table('CARRERA')->where('NOMBRE', 'INGENIERÍA EN SISTEMAS')->value('ID');

        $horarioId = DB::table('HORARIO')->insertGetId([
            'DIA' => 'LUNES',
            'HORA_INI' => '07:30:00',
            'HORA_FIN' => '09:00:00'
        ], 'ID');

        // 3. BLOQUE_HORARIO y HORARIO_EN_BLOQUE
        $bloqueMananaId = DB::table('BLOQUE_HORARIO')->insertGetId(['TURNO' => 'MAÑANA'], 'ID');
        $bloqueTardeId = DB::table('BLOQUE_HORARIO')->insertGetId(['TURNO' => 'TARDE'], 'ID');
        $bloqueNocheId = DB::table('BLOQUE_HORARIO')->insertGetId(['TURNO' => 'NOCHE'], 'ID');

        DB::table('HORARIO_EN_BLOQUE')->insert([
            'HORARIO_ID' => $horarioId,
            'BLOQUE_HORARIO_ID' => $bloqueMananaId,
            'CARGA_HORARIA' => '1.5'
        ]);

        // 4. Inserción de Usuarios, Colegios, Docentes, Estudiantes y CUP
        DB::table('CIUDAD')->insert([['NOMBRE' => 'SANTA CRUZ', 'DEPARTAMENTO' => 'SANTA CRUZ']]);
        $idCiudad = DB::table('CIUDAD')->first()->ID;

        DB::table('COLEGIO')->insert([['NOMBRE' => 'COLEGIO NACIONAL']]);
        $idColegio = DB::table('COLEGIO')->first()->ID;

        $adminId = DB::table('USUARIO')->insertGetId([
            'USERNAME' => 'admin.cup',
            'CONTRASENIA' => Hash::make('Admin123'),
            'CARNET' => 1111111,
            'NOMBRE' => 'Omar',
            'APELLIDO' => 'Saucedo',
            'CORREO' => 'admin@cup.edu',
            'ESTADO' => 'ACTIVO',
            'FECHA_CREACION' => now(),
            'ROL_ID' => $idAdmin
        ], 'ID');

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

        DB::table('DOCENTE')->insert(['CODIGO' => $userDocenteId]);

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

        $cupId = DB::table('CUP')->insertGetId([
            'ANIO' => 2026,
            'SEMESTRE' => 'I-2026',
            'NOTA_MINIMA' => 60.00,
            'CUPOS' => 150,
            'FECHA_INICIO' => '2026-06-01',
            'FECHA_FIN' => '2026-07-15',
            'USUARIO_ID' => $adminId
        ], 'ID');

        // 5. Inserción de CARRERA_CUP y DOCENTE_CUP
        $carreraCupInfoId = DB::table('CARRERA_CUP')->insertGetId([
            'CARRERA_ID' => $idInformatica, 'CUP_ID' => $cupId, 'CUPOS' => 50
        ], 'ID');
        $carreraCupSisId = DB::table('CARRERA_CUP')->insertGetId([
            'CARRERA_ID' => $idSistemas, 'CUP_ID' => $cupId, 'CUPOS' => 60
        ], 'ID');

        $docenteCupId = DB::table('DOCENTE_CUP')->insertGetId([
            'DOCENTE_CODIGO' => $userDocenteId,
            'CUP_ID' => $cupId,
            'FECHA_CREACION' => now()
        ], 'ID');

        // 6. Creación de la CLASE vinculando BLOQUE_HORARIO_ID y DOCENTE_CUP_ID
        DB::table('CLASE')->insert([
            'DOCENTE_CUP_ID' => $docenteCupId,
            'BLOQUE_HORARIO_ID' => $bloqueMananaId,
            'MATERIA_ID' => $idMateria,
            'GRUPO_ID' => $idGrupo,
            'AULA_ID' => $idAula
        ]);

        // 7. Preinscripción ESTUDIANTE_CUP y asignación de OPCION_CARRERA (1 y 2)
        $estudianteCupId = DB::table('ESTUDIANTE_CUP')->insertGetId([
            'ESTUDIANTE_ID' => $estudianteId,
            'CUP_ID' => $cupId,
            'FECHA' => now(),
            'ESTADO' => 'APROBADO',
            'NOTA_FINAL' => 85.50,
            'CARRERA' => 'INGENIERÍA EN SISTEMAS'
        ], 'ID');

        DB::table('OPCION_CARRERA')->insert([
            ['ESTUDIANTE_CUP_ID' => $estudianteCupId, 'CARRERA_CUP_ID' => $carreraCupSisId, 'OPCION' => 1],
            ['ESTUDIANTE_CUP_ID' => $estudianteCupId, 'CARRERA_CUP_ID' => $carreraCupInfoId, 'OPCION' => 2]
        ]);
    }
}