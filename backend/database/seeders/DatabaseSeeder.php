<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Deshabilitar restricciones de FK para permitir truncamientos limpios
        Schema::disableForeignKeyConstraints();

        // Limpieza de datos
        DB::table('CALIFICACIONES')->truncate();
        DB::table('CLASE')->truncate();
        DB::table('DOCENTE_CUP_MAT')->truncate();
        DB::table('DOCENTE_CUP')->truncate();
        DB::table('DOCENTE')->truncate();
        DB::table('OPCION_CARRERA')->truncate();
        DB::table('ESTUDIANTE_CUP')->truncate();
        DB::table('CARRERA_EST')->truncate();
        DB::table('ESTUDIANTE')->truncate();
        DB::table('COLEGIO')->truncate();
        DB::table('CIUDAD')->truncate();
        DB::table('MATERIA_CUP')->truncate();
        DB::table('CARRERA_CUP')->truncate();
        DB::table('MATERIA')->truncate();
        DB::table('CARRERA')->truncate();
        DB::table('HORARIO_EN_BLOQUE')->truncate();
        DB::table('BLOQUE_HORARIO')->truncate();
        DB::table('HORARIO')->truncate();
        DB::table('AULA')->truncate();
        DB::table('GRUPO')->truncate();
        DB::table('BITACORA')->truncate();
        DB::table('PERMISOS_USUARIO')->truncate();
        DB::table('PERMISO_ROL')->truncate();
        DB::table('USUARIO')->truncate();
        DB::table('PERMISOS')->truncate();
        DB::table('ROL')->truncate();

        // Rehabilitar restricciones de FK
        Schema::enableForeignKeyConstraints();

        // ==========================================
        // 1. SECURITY & ACCESS CONTROL
        // ==========================================
        $rolAdmin = DB::table('ROL')->insertGetId(['NOMBRE' => 'ADMINISTRADOR'], 'ID');
        $rolDocente = DB::table('ROL')->insertGetId(['NOMBRE' => 'DOCENTE'], 'ID');

        $uAdminId = DB::table('USUARIO')->insertGetId([
            'USERNAME' => 'OMAR.ADMIN',
            'CONTRASENIA' => Hash::make('Admin123/*'),
            'CARNET' => 8432111,
            'NOMBRE' => 'OMAR ALY',
            'APELLIDO' => 'SAUCEDO LINO',
            'CORREO' => 'omar.admin@ficct.uagrm.edu.bo',
            'ESTADO' => 'ACTIVO',
            'FECHA_CREACION' => Carbon::now(),
            'ROL_ID' => $rolAdmin
        ], 'ID');

        // Docentes (Usuarios base)
        $uDoc1 = DB::table('USUARIO')->insertGetId([
            'USERNAME' => 'ALBERTO.DOC',
            'CONTRASENIA' => Hash::make('Docente123/*'),
            'CARNET' => 4567891,
            'NOMBRE' => 'ALBERTO',
            'APELLIDO' => 'PEREZ',
            'CORREO' => 'alberto.perez@uagrm.edu.bo',
            'ESTADO' => 'ACTIVO',
            'FECHA_CREACION' => Carbon::now(),
            'ROL_ID' => $rolDocente
        ], 'ID');

        $uDoc2 = DB::table('USUARIO')->insertGetId([
            'USERNAME' => 'MARIA.DOC',
            'CONTRASENIA' => Hash::make('Docente123/*'),
            'CARNET' => 4567892,
            'NOMBRE' => 'MARIA',
            'APELLIDO' => 'GOMEZ',
            'CORREO' => 'maria.gomez@uagrm.edu.bo',
            'ESTADO' => 'ACTIVO',
            'FECHA_CREACION' => Carbon::now(),
            'ROL_ID' => $rolDocente
        ], 'ID');

        // Extensión a la tabla DOCENTE
        DB::table('DOCENTE')->insert(['CODIGO_DOCENTE' => $uDoc1]);
        DB::table('DOCENTE')->insert(['CODIGO_DOCENTE' => $uDoc2]);

        // ==========================================
        // 2. INFRAESTRUCTURA ACADÉMICA BASE
        // ==========================================
        $carreras = [
            'INGENIERIA EN SISTEMAS',
            'INGENIERIA INFORMATICA',
            'INGENIERIA EN REDES Y TELECOMUNICACIONES'
        ];
        $carreraIds = [];
        foreach ($carreras as $c) {
            $carreraIds[$c] = DB::table('CARRERA')->insertGetId(['NOMBRE' => $c], 'ID_CARRERA');
        }

        $materias = ['COMPUTACION', 'MATEMATICA', 'INGLES', 'FISICA'];
        $materiaIds = [];
        foreach ($materias as $m) {
            $materiaIds[$m] = DB::table('MATERIA')->insertGetId(['NOMBRE' => $m], 'ID_MATERIA');
        }

        $aula1 = DB::table('AULA')->insertGetId(['NOMBRE' => 'AULA 101', 'ESTADO' => 'ACTIVO'], 'ID_AULA');
        $aula2 = DB::table('AULA')->insertGetId(['NOMBRE' => 'AULA 102', 'ESTADO' => 'ACTIVO'], 'ID_AULA');

        $grupoA = DB::table('GRUPO')->insertGetId(['EST_MIN' => 20, 'EST_MAX' => 80], 'ID_GRUPO');
        $grupoB = DB::table('GRUPO')->insertGetId(['EST_MIN' => 20, 'EST_MAX' => 80], 'ID_GRUPO');

        $ciudad = DB::table('CIUDAD')->insertGetId(['NOMBRE' => 'SANTA CRUZ DE LA SIERRA', 'DEPARTAMENTO' => 'SANTA CRUZ'], 'ID');
        $colegio = DB::table('COLEGIO')->insertGetId(['NOMBRE' => 'NACIONAL FLORIDA'], 'ID');

        // Bloques Horarios y Horarios
        $bloqueBH = DB::table('BLOQUE_HORARIO')->insertGetId(['TURNO' => 'MAÑANA'], 'ID_BLOQUE_HORARIO');
        $h1 = DB::table('HORARIO')->insertGetId(['DIA' => 'LUNES', 'HORA_INI' => '07:00:00', 'HORA_FIN' => '09:15:00'], 'ID');
        $h2 = DB::table('HORARIO')->insertGetId(['DIA' => 'MARTES', 'HORA_INI' => '07:00:00', 'HORA_FIN' => '09:15:00'], 'ID');
        DB::table('HORARIO_EN_BLOQUE')->insert(['HORARIO_ID' => $h1, 'ID_BLOQUE_HORARIO' => $bloqueBH, 'CARGA_HORARIA' => '2.25']);
        DB::table('HORARIO_EN_BLOQUE')->insert(['HORARIO_ID' => $h2, 'ID_BLOQUE_HORARIO' => $bloqueBH, 'CARGA_HORARIA' => '2.25']);

        // ==========================================
        // 3. PERIODOS CUP (HISTÓRICO VS ACTIVO)
        // ==========================================
        
        // CUP 1: CONCLUIDO (Gestión Histórica 2025)
        $cup2025 = DB::table('CUP')->insertGetId([
            'ANIO' => 2025,
            'SEMESTRE' => 'PRIMER SEMESTRE',
            'NOTA_MINIMA' => 60.00,
            'CUPOS' => 150,
            'FECHA_INICIO' => '2025-01-15',
            'FECHA_FIN' => '2025-06-20',
            'USUARIO_ID' => $uAdminId,
            'ESTADO' => 'Concluido'
        ], 'ID_CUP');

        // CUP 2: EN CURSO (Único Activo Operativo 2026)
        $cup2026 = DB::table('CUP')->insertGetId([
            'ANIO' => 2026,
            'SEMESTRE' => 'PRIMER SEMESTRE',
            'NOTA_MINIMA' => 60.00,
            'CUPOS' => 200,
            'FECHA_INICIO' => '2026-01-10',
            'FECHA_FIN' => '2026-06-25',
            'USUARIO_ID' => $uAdminId,
            'ESTADO' => 'Inscripciones'
        ], 'ID_CUP');

        // Población de ofertas de cupos y materias para ambos periodos
        foreach ([$cup2025, $cup2026] as $cupId) {
            foreach ($carreraIds as $idCar) {
                DB::table('CARRERA_CUP')->insert(['ID_CARRERA' => $idCar, 'ID_CUP' => $cupId, 'CUPOS' => 50]);
            }
            foreach ($materiaIds as $idMat) {
                DB::table('MATERIA_CUP')->insert(['ID_CUP' => $cupId, 'ID_MATERIA' => $idMat]);
            }
        }

        // Relación Docentes con los periodos
        $docCup1_25 = DB::table('DOCENTE_CUP')->insertGetId(['CODIGO_DOCENTE' => $uDoc1, 'ID_CUP' => $cup2025, 'FECHA_CREACION' => '2025-01-10'], 'ID');
        $docCup2_25 = DB::table('DOCENTE_CUP')->insertGetId(['CODIGO_DOCENTE' => $uDoc2, 'ID_CUP' => $cup2025, 'FECHA_CREACION' => '2025-01-10'], 'ID');
        
        $docCup1_26 = DB::table('DOCENTE_CUP')->insertGetId(['CODIGO_DOCENTE' => $uDoc1, 'ID_CUP' => $cup2026, 'FECHA_CREACION' => '2026-01-05'], 'ID');
        $docCup2_26 = DB::table('DOCENTE_CUP')->insertGetId(['CODIGO_DOCENTE' => $uDoc2, 'ID_CUP' => $cup2026, 'FECHA_CREACION' => '2026-01-05'], 'ID');

        // Competencias Docentes por materia
        DB::table('DOCENTE_CUP_MAT')->insert(['DOCENTE_CUP_ID' => $docCup1_26, 'MATERIA_ID' => $materiaIds['COMPUTACION']]);
        DB::table('DOCENTE_CUP_MAT')->insert(['DOCENTE_CUP_ID' => $docCup1_26, 'MATERIA_ID' => $materiaIds['MATEMATICA']]);
        DB::table('DOCENTE_CUP_MAT')->insert(['DOCENTE_CUP_ID' => $docCup2_26, 'MATERIA_ID' => $materiaIds['FISICA']]);

        // Instancias de clases operativas para el periodo activo
        $claseComp = DB::table('CLASE')->insertGetId([
            'DOCENTE_CUP_ID' => $docCup1_26, 'ID_BLOQUE_HORARIO' => $bloqueBH, 'ID_MATERIA' => $materiaIds['COMPUTACION'], 'ID_GRUPO' => $grupoA, 'ID_AULA' => $aula1
        ], 'ID_CLASE');
        $claseMat = DB::table('CLASE')->insertGetId([
            'DOCENTE_CUP_ID' => $docCup1_26, 'ID_BLOQUE_HORARIO' => $bloqueBH, 'ID_MATERIA' => $materiaIds['MATEMATICA'], 'ID_GRUPO' => $grupoA, 'ID_AULA' => $aula1
        ], 'ID_CLASE');

        // ==========================================
        // 4. ESCENARIOS DE POSTULANTES (CASOS DE PRUEBA)
        // ==========================================

        // --- CASO 1: Estudiante que APROBÓ el CUP pasado (2025) y ya consolidó su plaza ---
        $estAprobado25 = DB::table('ESTUDIANTE')->insertGetId([
            'CARNET' => 9000001, 'NOMBRE' => 'JUAN CARLOS', 'APELLIDO' => 'SANDOVAL', 'FECHA_NAC' => '2005-04-12',
            'DIRECCION' => 'Radial 26', 'TELEFONO' => '78011111', 'CORREO' => 'juan.sandoval@mail.com',
            'TITULO_BACHILLER' => 'A-2023', 'SEXO' => 'M', 'ESTADO' => 'INSCRITO', 'COLEGIO_ID' => $colegio, 'CIUDAD_ID' => $ciudad
        ], 'ID_ESTUDIANTE');
        $eCup1 = DB::table('ESTUDIANTE_CUP')->insertGetId([
            'ID_ESTUDIANTE' => $estAprobado25, 'ID_CUP' => $cup2025, 'FECHA' => '2025-01-16',
            'ESTADO' => 'APROBADO', 'NOTA_FINAL' => 85.50, 'CARRERA' => 'INGENIERIA EN SISTEMAS'
        ], 'ID');
        // Guardado de preferencias de ese periodo
        $cc25_Sist = DB::table('CARRERA_CUP')->where(['ID_CUP' => $cup2025, 'ID_CARRERA' => $carreraIds['INGENIERIA EN SISTEMAS']])->first()->ID;
        $cc25_Info = DB::table('CARRERA_CUP')->where(['ID_CUP' => $cup2025, 'ID_CARRERA' => $carreraIds['INGENIERIA INFORMATICA']])->first()->ID;
        DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCup1, 'CARRERA_CUP_ID' => $cc25_Sist, 'OPCION' => 1]);
        DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCup1, 'CARRERA_CUP_ID' => $cc25_Info, 'OPCION' => 2]);


        // --- CASO 2: Estudiante que REPROBÓ el CUP pasado (2025) y se RE-INSCRIBE al activo (2026) ---
        $estRepitente = DB::table('ESTUDIANTE')->insertGetId([
            'CARNET' => 9000002, 'NOMBRE' => 'CRISTIAN', 'APELLIDO' => 'AGUILERA', 'FECHA_NAC' => '2006-08-20',
            'DIRECCION' => 'Plan 3000', 'TELEFONO' => '69022222', 'CORREO' => 'cristian.aguilera@mail.com',
            'TITULO_BACHILLER' => 'B-2024', 'SEXO' => 'M', 'ESTADO' => 'INSCRITO', 'COLEGIO_ID' => $colegio, 'CIUDAD_ID' => $ciudad
        ], 'ID_ESTUDIANTE');
        // Inscripción histórica (Reprobado)
        $eCup2_Hist = DB::table('ESTUDIANTE_CUP')->insertGetId([
            'ID_ESTUDIANTE' => $estRepitente, 'ID_CUP' => $cup2025, 'FECHA' => '2025-01-16',
            'ESTADO' => 'REPROBADO', 'NOTA_FINAL' => 45.00, 'CARRERA' => null
        ], 'ID');
        DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCup2_Hist, 'CARRERA_CUP_ID' => $cc25_Info, 'OPCION' => 1]);

        // Re-inscripción en el CUP Activo 2026 (Elige nuevas opciones si lo desea)
        $eCup2_Activo = DB::table('ESTUDIANTE_CUP')->insertGetId([
            'ID_ESTUDIANTE' => $estRepitente, 'ID_CUP' => $cup2026, 'FECHA' => '2026-01-12',
            'ESTADO' => 'INSCRITO', 'NOTA_FINAL' => null, 'CARRERA' => null
        ], 'ID');
        $cc26_Redes = DB::table('CARRERA_CUP')->where(['ID_CUP' => $cup2026, 'ID_CARRERA' => $carreraIds['INGENIERIA EN REDES Y TELECOMUNICACIONES']])->first()->ID;
        $cc26_Sist = DB::table('CARRERA_CUP')->where(['ID_CUP' => $cup2026, 'ID_CARRERA' => $carreraIds['INGENIERIA EN SISTEMAS']])->first()->ID;
        // Elige Redes como nueva Opción 1 y Sistemas como Opción 2
        DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCup2_Activo, 'CARRERA_CUP_ID' => $cc26_Redes, 'OPCION' => 1]);
        DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCup2_Activo, 'CARRERA_CUP_ID' => $cc26_Sist, 'OPCION' => 2]);


        // --- CASO 3: Estudiante Postulante Nuevo inscrito en el periodo activo (2026) ---
        $estNuevo = DB::table('ESTUDIANTE')->insertGetId([
            'CARNET' => 9000003, 'NOMBRE' => 'ANA MARIA', 'APELLIDO' => 'LOPEZ', 'FECHA_NAC' => '2006-01-15',
            'DIRECCION' => 'Avenida Busch', 'TELEFONO' => '77033333', 'CORREO' => 'ana.lopez@mail.com',
            'TITULO_BACHILLER' => 'A-2024', 'SEXO' => 'F', 'ESTADO' => 'INSCRITO', 'COLEGIO_ID' => $colegio, 'CIUDAD_ID' => $ciudad
        ], 'ID_ESTUDIANTE');
        $eCup3_Activo = DB::table('ESTUDIANTE_CUP')->insertGetId([
            'ID_ESTUDIANTE' => $estNuevo, 'ID_CUP' => $cup2026, 'FECHA' => '2026-01-14',
            'ESTADO' => 'INSCRITO', 'NOTA_FINAL' => null, 'CARRERA' => null
        ], 'ID');
        DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCup3_Activo, 'CARRERA_CUP_ID' => $cc26_Sist, 'OPCION' => 1]);
        DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCup3_Activo, 'CARRERA_CUP_ID' => $cc26_Redes, 'OPCION' => 2]);


        // ==========================================
        // 5. SIEMBRA DE CALIFICACIONES (3 EXÁMENES POR CLASE)
        // ==========================================
        
        // Asignaremos las 3 evaluaciones obligatorias para el alumno Nuevo en su clase de Computación
        $examenes = [
            ['NOMBRE' => 'PRIMER PARCIAL', 'PONDERACION' => 30.00],
            ['NOMBRE' => 'SEGUNDO PARCIAL', 'PONDERACION' => 30.00],
            ['NOMBRE' => 'EXAMEN FINAL', 'PONDERACION' => 40.00],
        ];

        foreach ($examenes as $ex) {
            DB::table('CALIFICACIONES')->insert([
                'NOMBRE' => $ex['NOMBRE'],
                'PONDERACION' => $ex['PONDERACION'],
                'ESTUDIANTE_CUP_ID' => $eCup3_Activo,
                'ID_CLASE' => $claseComp
            ]);
        }

        // Asignamos también sus exámenes para la clase de Matemática
        foreach ($examenes as $ex) {
            DB::table('CALIFICACIONES')->insert([
                'NOMBRE' => $ex['NOMBRE'],
                'PONDERACION' => $ex['PONDERACION'],
                'ESTUDIANTE_CUP_ID' => $eCup3_Activo,
                'ID_CLASE' => $claseMat
            ]);
        }
    }
}