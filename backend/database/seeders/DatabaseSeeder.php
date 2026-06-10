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
        // Deshabilitar restricciones de FK para permitir truncamientos limpios en PostgreSQL
        Schema::disableForeignKeyConstraints();

        // Limpieza de datos completa respetando restricciones de integridad referencial
        DB::table('CALIFICACIONES')->truncate();
        DB::table('ESTUDIANTES_CLASE')->truncate();
        DB::table('CLASE')->truncate();
        DB::table('DOCENTE_CUP_MAT')->truncate();
        DB::table('DOCENTE_CUP')->truncate();
        DB::table('DOCENTE')->truncate();
        DB::table('OPCION_CARRERA')->truncate();
        DB::table('ESTUDIANTE_CUP')->truncate();
        DB::table('CARRERA_EST')->truncate();
        DB::table('PAGO')->truncate();
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
        DB::table('MODULO')->truncate();
        DB::table('ROL')->truncate();

        Schema::enableForeignKeyConstraints();

        // ==========================================
        // 1. CONTROL DE ACCESO, ROLES, MÓDULOS Y SEGURIDAD
        // ==========================================
        $rolAdmin = DB::table('ROL')->insertGetId(['NOMBRE' => 'ADMINISTRADOR'], 'ID');
        $rolDocente = DB::table('ROL')->insertGetId(['NOMBRE' => 'DOCENTE'], 'ID');
        $rolEstudiante = DB::table('ROL')->insertGetId(['NOMBRE' => 'ESTUDIANTE'], 'ID');
        $rolCoordinador = DB::table('ROL')->insertGetId(['NOMBRE' => 'COORDINADOR'], 'ID');

        // Módulos del sistema
        $modulos = [
            'USUARIOS'        => DB::table('MODULO')->insertGetId(['NOMBRE' => 'USUARIOS'], 'ID'),
            'ROLES_PERMISOS' => DB::table('MODULO')->insertGetId(['NOMBRE' => 'ROLES_PERMISOS'], 'ID'),
            'CUP'             => DB::table('MODULO')->insertGetId(['NOMBRE' => 'CUP'], 'ID'),
            'DOCENTES'        => DB::table('MODULO')->insertGetId(['NOMBRE' => 'DOCENTES'], 'ID'),
            'ESTUDIANTES'     => DB::table('MODULO')->insertGetId(['NOMBRE' => 'ESTUDIANTES'], 'ID'),
            'MATERIAS'        => DB::table('MODULO')->insertGetId(['NOMBRE' => 'MATERIAS'], 'ID'),
            'INFRAESTRUCTURA' => DB::table('MODULO')->insertGetId(['NOMBRE' => 'INFRAESTRUCTURA'], 'ID'),
            'CALIFICACIONES'  => DB::table('MODULO')->insertGetId(['NOMBRE' => 'CALIFICACIONES'], 'ID'),
            'BITACORA'        => DB::table('MODULO')->insertGetId(['NOMBRE' => 'BITACORA'], 'ID'),
        ];

        // Mapeo de permisos a sus módulos correspondientes
        $permisosModuloMap = [
            // Módulo USUARIOS
            'VER_USUARIOS'              => 'USUARIOS',
            'CREAR_USUARIOS'            => 'USUARIOS',
            'EDITAR_USUARIOS'           => 'USUARIOS',
            'ELIMINAR_USUARIOS'         => 'USUARIOS',

            // Módulo ROLES_PERMISOS
            'VER_ROLES'                 => 'ROLES_PERMISOS',
            'CREAR_ROLES'               => 'ROLES_PERMISOS',
            'EDITAR_ROLES'              => 'ROLES_PERMISOS',
            'ELIMINAR_ROLES'            => 'ROLES_PERMISOS',
            'ASIGNAR_PERMISOS'          => 'ROLES_PERMISOS',
            'VER_ROLES_PERMISOS'        => 'ROLES_PERMISOS',

            // Módulo CUP
            'VER_CUP'                   => 'CUP',
            'CREAR_CUP'                 => 'CUP',
            'EDITAR_CUP'                => 'CUP',
            'ELIMINAR_CUP'              => 'CUP',
            'CERRAR_GESTION_CUP'        => 'CUP',
            'GESTIONAR_GRUPOS_CLASES'   => 'CUP',
            'GESTIONAR_CUP'             => 'CUP',

            // Módulo DOCENTES
            'VER_DOCENTES'              => 'DOCENTES',
            'CREAR_DOCENTES'            => 'DOCENTES',
            'EDITAR_DOCENTES'           => 'DOCENTES',
            'ELIMINAR_DOCENTES'         => 'DOCENTES',
            'ASIGNAR_DOCENTES_CUP'      => 'DOCENTES',

            // Módulo ESTUDIANTES
            'VER_ESTUDIANTES'           => 'ESTUDIANTES',
            'CREAR_ESTUDIANTES'         => 'ESTUDIANTES',
            'EDITAR_ESTUDIANTES'        => 'ESTUDIANTES',
            'ELIMINAR_ESTUDIANTES'      => 'ESTUDIANTES',

            // Módulo MATERIAS
            'VER_MATERIAS'              => 'MATERIAS',
            'CREAR_MATERIAS'            => 'MATERIAS',
            'EDITAR_MATERIAS'           => 'MATERIAS',
            'ELIMINAR_MATERIAS'         => 'MATERIAS',
            'GESTIONAR_MATERIAS'        => 'MATERIAS',

            // Módulo INFRAESTRUCTURA
            'VER_AULAS'                 => 'INFRAESTRUCTURA',
            'CREAR_AULAS'               => 'INFRAESTRUCTURA',
            'EDITAR_AULAS'              => 'INFRAESTRUCTURA',
            'ELIMINAR_AULAS'            => 'INFRAESTRUCTURA',
            'ASIGNAR_AULAS_CUP'         => 'INFRAESTRUCTURA',
            'VER_HORARIOS'              => 'INFRAESTRUCTURA',
            'CREAR_HORARIOS'            => 'INFRAESTRUCTURA',
            'EDITAR_HORARIOS'           => 'INFRAESTRUCTURA',
            'ELIMINAR_HORARIOS'         => 'INFRAESTRUCTURA',

            // Módulo CALIFICACIONES
            'VER_CALIFICACIONES'        => 'CALIFICACIONES',
            'REGISTRAR_NOTAS'           => 'CALIFICACIONES',
            'GESTIONAR_CALIFICACIONES'  => 'CALIFICACIONES',

            // Módulo BITACORA
            'VER_BITACORA'              => 'BITACORA',
        ];

        $permisosIds = [];
        foreach ($permisosModuloMap as $pNombre => $moduloNombre) {
            $permisosIds[$pNombre] = DB::table('PERMISOS')->insertGetId([
                'NOMBRE' => $pNombre,
                'MODULO_ID' => $modulos[$moduloNombre]
            ], 'ID');
            
            DB::table('PERMISO_ROL')->insert([
                'ROL_ID' => $rolAdmin,
                'PERMISOS_ID' => $permisosIds[$pNombre],
                'ESTADO' => 'ACTIVO',
                'FECHA_MOD' => Carbon::now()
            ]);
        }

        // Permisos Docentes
        $permisosDocente = [
            'VER_MATERIAS', 
            'VER_AULAS', 
            'VER_HORARIOS', 
            'VER_CALIFICACIONES', 
            'REGISTRAR_NOTAS', 
            'GESTIONAR_CALIFICACIONES'
        ];
        foreach ($permisosDocente as $pDoc) {
            if (isset($permisosIds[$pDoc])) {
                DB::table('PERMISO_ROL')->insert([
                    'ROL_ID' => $rolDocente,
                    'PERMISOS_ID' => $permisosIds[$pDoc],
                    'ESTADO' => 'ACTIVO',
                    'FECHA_MOD' => Carbon::now()
                ]);
            }
        }

        // Admin OMAR.ADMIN
        $uAdminId = DB::selectOne('
            SELECT public.f_insertar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?) as nuevo_id
        ', [
            'OMAR.ADMIN', Hash::make('Contrasenia1!'), 8432111, 'OMAR ALY', 'SAUCEDO LINO', 'admin@cup.edu', null, 'ACTIVO', $rolAdmin
        ])->nuevo_id;

        // Generación de 30 Docentes
        $docenteUserIds = [];
        for ($i = 1; $i <= 30; $i++) {
            $uDocId = DB::selectOne('
                SELECT public.f_insertar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?) as nuevo_id
            ', [
                "DOCENTE_{$i}", Hash::make('DocenteSeguro1!'), 4567890 + $i, "DOCENTE {$i}", "APELLIDO {$i}", "docente{$i}@cup.edu", 70000000 + $i, 'ACTIVO', $rolDocente
            ])->nuevo_id;
            $docenteUserIds[] = $uDocId;
        }

        // ==========================================
        // 2. CONFIGURACIÓN DE CATÁLOGOS BASE Y CATASTRO
        // ==========================================
        $carreras = [
            'INGENIERIA EN SISTEMAS',
            'INGENIERIA INFORMATICA',
            'INGENIERIA EN REDES',
            'INGENIERIA ROBOTICA'
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

        // Infraestructura de Aulas (20 aulas)
        $aulas = [];
        for ($i = 1; $i <= 20; $i++) {
            $aulas[] = DB::table('AULA')->insertGetId(['NOMBRE' => "AULA 1" . str_pad($i, 2, '0', STR_PAD_LEFT), 'ESTADO' => 'ACTIVO'], 'ID_AULA');
        }

        $ciudadId = DB::table('CIUDAD')->insertGetId(['NOMBRE' => 'SANTA CRUZ DE LA SIERRA', 'DEPARTAMENTO' => 'SANTA CRUZ'], 'ID');
        $colegioId = DB::table('COLEGIO')->insertGetId(['NOMBRE' => 'NACIONAL FLORIDA'], 'ID');

        // ==============================================================
        // ESTRUCTURA TEMPORAL DE BLOQUES HORARIOS
        // ==============================================================
        $bloquesMañana = [];
        $diasG1 = ['LUNES', 'MIERCOLES', 'VIERNES'];
        $diasG2 = ['MARTES', 'JUEVES', 'SABADO'];

        $horariosConfig = [
            'MAÑANA' => [['07:00:00', '09:00:00'], ['09:00:00', '11:00:00']],
            'TARDE'  => [['13:30:00', '15:30:00'], ['15:30:00', '17:30:00']],
            'NOCHE'  => [['18:00:00', '20:00:00'], ['20:00:00', '22:00:00']]
        ];

        foreach (['MAÑANA', 'TARDE', 'NOCHE'] as $turno) {
            foreach ([$diasG1, $diasG2] as $grupoDias) {
                foreach ($horariosConfig[$turno] as $horaObj) {
                    $bloqueId = DB::table('BLOQUE_HORARIO')->insertGetId(['TURNO' => $turno], 'ID_BLOQUE_HORARIO');
                    if ($turno === 'MAÑANA') $bloquesMañana[] = $bloqueId;
                    foreach ($grupoDias as $dia) {
                        $hId = DB::table('HORARIO')->where(['DIA' => $dia, 'HORA_INI' => $horaObj[0], 'HORA_FIN' => $horaObj[1]])->value('ID');
                        if (!$hId) {
                            $hId = DB::table('HORARIO')->insertGetId(['DIA' => $dia, 'HORA_INI' => $horaObj[0], 'HORA_FIN' => $horaObj[1]], 'ID');
                        }
                        DB::table('HORARIO_EN_BLOQUE')->insert(['HORARIO_ID' => $hId, 'ID_BLOQUE_HORARIO' => $bloqueId, 'CARGA_HORARIA' => '2']);
                    }
                }
            }
        }

        // Funciones auxiliares
        $generateSubjectGrades = function ($notaFinal, $numSubjects = 4) {
            $targetSum = $notaFinal * $numSubjects;
            $grades = [];
            $currentSum = 0;
            for ($i = 0; $i < $numSubjects - 1; $i++) {
                $dev = rand(-700, 700) / 100;
                $g = min(98, max(20, $notaFinal + $dev));
                $grades[] = round($g, 2);
                $currentSum += $g;
            }
            $lastGrade = $targetSum - $currentSum;
            if ($lastGrade < 10 || $lastGrade > 100) {
                return array_fill(0, $numSubjects, round($notaFinal, 2));
            }
            $grades[] = round($lastGrade, 2);
            return $grades;
        };

        $seedGradesForEnrollment = function ($eCupId, $cupId, $gradesList, $clasesMap, $materiaIds) {
            $materiasOrder = ['COMPUTACION', 'MATEMATICA', 'INGLES', 'FISICA'];
            // Para inserciones masivas de calificaciones
            $califInsert = [];
            
            // Asignar al estudiante aleatoriamente a un grupo de cada materia
            foreach ($materiasOrder as $mIdx => $mName) {
                $mId = $materiaIds[$mName];
                $clasesDisponibles = $clasesMap[$cupId][$mId];
                $claseId = $clasesDisponibles[array_rand($clasesDisponibles)]; // Elige una clase de grupo al azar
                $subGrade = $gradesList[$mIdx];

                $estClaseId = DB::table('ESTUDIANTES_CLASE')->insertGetId([
                    'ESTUDIANTE_CUP_ID' => $eCupId,
                    'ID_CLASE' => $claseId,
                    'NOTA_FINAL' => round($subGrade, 2),
                    'ESTADO' => ($subGrade >= 60.00) ? 'APROBADO' : 'REPROBADO',
                ], 'ID');

                $califInsert[] = ['NOMBRE' => 'PRIMER PARCIAL', 'CALIFICACION' => round($subGrade, 1), 'PONDERACION' => 30.00, 'ESTUDIANTE_CLASE_ID' => $estClaseId];
                $califInsert[] = ['NOMBRE' => 'SEGUNDO PARCIAL', 'CALIFICACION' => round($subGrade, 1), 'PONDERACION' => 30.00, 'ESTUDIANTE_CLASE_ID' => $estClaseId];
                $califInsert[] = ['NOMBRE' => 'EXAMEN FINAL', 'CALIFICACION' => round($subGrade, 1), 'PONDERACION' => 40.00, 'ESTUDIANTE_CLASE_ID' => $estClaseId];
            }
            DB::table('CALIFICACIONES')->insert($califInsert);
        };

        // ==========================================
        // LÍNEA DE TIEMPO CUP
        // ==========================================
        $cupsConfig = [
            ['ANIO' => 2024, 'SEMESTRE' => 1, 'FECHA_INICIO' => '2024-01-15', 'FECHA_FIN' => '2024-06-20', 'ESTADO' => 'Concluido'],
            ['ANIO' => 2024, 'SEMESTRE' => 2, 'FECHA_INICIO' => '2024-07-15', 'FECHA_FIN' => '2024-12-20', 'ESTADO' => 'Concluido'],
            ['ANIO' => 2025, 'SEMESTRE' => 1, 'FECHA_INICIO' => '2025-01-15', 'FECHA_FIN' => '2025-06-20', 'ESTADO' => 'Concluido'],
            ['ANIO' => 2026, 'SEMESTRE' => 1, 'FECHA_INICIO' => '2026-01-15', 'FECHA_FIN' => '2026-06-20', 'ESTADO' => 'En curso'],
        ];

        $cupIds = [];
        $clasesMap = [];

        // Generar pool grande de estudiantes: 2000 estudiantes
        $nombresMasc = ['CARLOS', 'JUAN', 'PEDRO', 'LUIS', 'JORGE', 'ANDRES', 'MIGUEL', 'CRISTIAN', 'FERNANDO', 'RICARDO', 'ALEJANDRO', 'DAVID', 'MAURICIO', 'ROBERTO', 'DANIEL'];
        $nombresFem = ['MARIA', 'ANA', 'LAURA', 'SOFIA', 'ANDREA', 'CAROLINA', 'GABRIELA', 'PATRICIA', 'ELIZABETH', 'CLAUDIA', 'NATALIA', 'VALERIA', 'CAMILA', 'DANIELA', 'ISABEL'];
        $apellidos = ['SAUCEDO', 'LINO', 'PEREZ', 'GOMEZ', 'SANDOVAL', 'AGUILERA', 'LOPEZ', 'SUAREZ', 'RODRIGUEZ', 'TORRES', 'MENDOZA', 'FLORES', 'ROJAS', 'VARGAS', 'CASTRO', 'GUZMAN', 'ORTEGA', 'PINTO', 'CHAVEZ', 'MORALES'];

        $poolEstudiantesIds = [];
        $timeNow = Carbon::now();
        $defaultPasswordHash = Hash::make('Estudiante1!');

        // Para acelerar, crearemos 2000 estudiantes insertando directo en lotes de 100
        $batchEstudiantes = [];
        $batchUsuarios = [];
        
        for ($i = 1; $i <= 2000; $i++) {
            $gender = ($i % 2 === 0) ? 'F' : 'M';
            $name = ($gender === 'M') ? $nombresMasc[($i - 1) % count($nombresMasc)] : $nombresFem[($i - 1) % count($nombresFem)];
            $lastname1 = $apellidos[($i - 1) % count($apellidos)];
            $lastname2 = $apellidos[($i + 3) % count($apellidos)];
            $carnet = 6000000 + $i;
            $correo = "est{$i}@mail.com";
            
            $uEstId = DB::table('USUARIO')->insertGetId([
                'USERNAME' => (string)$carnet,
                'CONTRASENIA' => $defaultPasswordHash,
                'CARNET' => $carnet,
                'NOMBRE' => $name,
                'APELLIDO' => "$lastname1 $lastname2",
                'CORREO' => $correo,
                'ESTADO' => 'ACTIVO',
                'ROL_ID' => $rolEstudiante,
                'FECHA_CREACION' => $timeNow,
            ], 'ID');

            $estId = DB::table('ESTUDIANTE')->insertGetId([
                'CARNET' => $carnet,
                'NOMBRE' => $name,
                'APELLIDO' => "$lastname1 $lastname2",
                'FECHA_NAC' => '2005-01-01',
                'DIRECCION' => "CALLE $i",
                'TELEFONO' => 70000000 + $i,
                'CORREO' => $correo,
                'TITULO_BACHILLER' => "TIT-{$carnet}",
                'SEXO' => $gender,
                'ESTADO' => 'INACTIVO',
                'COLEGIO_ID' => $colegioId,
                'CIUDAD_ID' => $ciudadId,
                'USUARIO_ID' => $uEstId
            ], 'ID_ESTUDIANTE');

            $poolEstudiantesIds[] = $estId;
        }

        $estudiantesDisponibles = $poolEstudiantesIds;

        foreach ($cupsConfig as $cIdx => $cConf) {
            // CUPOS dinámicos
            $cuposCarreras = [
                'INGENIERIA EN SISTEMAS' => rand(100, 150),
                'INGENIERIA INFORMATICA' => rand(80, 120),
                'INGENIERIA EN REDES' => rand(70, 100),
                'INGENIERIA ROBOTICA' => rand(50, 80)
            ];
            $totalCupos = array_sum($cuposCarreras);

            $cupId = DB::table('CUP')->insertGetId([
                'ANIO' => $cConf['ANIO'],
                'SEMESTRE' => $cConf['SEMESTRE'],
                'NOTA_MINIMA' => 60.00,
                'CUPOS' => $totalCupos,
                'FECHA_INICIO' => $cConf['FECHA_INICIO'],
                'FECHA_FIN' => $cConf['FECHA_FIN'],
                'USUARIO_ID' => $uAdminId,
                'ESTADO' => $cConf['ESTADO']
            ], 'ID_CUP');
            $cupIds[] = $cupId;

            $ccIds = [];
            foreach ($carreras as $cName) {
                $ccIds[$cName] = DB::table('CARRERA_CUP')->insertGetId([
                    'ID_CARRERA' => $carreraIds[$cName],
                    'ID_CUP' => $cupId,
                    'CUPOS' => $cuposCarreras[$cName]
                ], 'ID');
            }

            foreach ($materiaIds as $mId) {
                DB::table('MATERIA_CUP')->insert(['ID_CUP' => $cupId, 'ID_MATERIA' => $mId]);
            }

            // Docentes (30) => repartir entre las materias
            $docCupIds = [];
            foreach ($docenteUserIds as $index => $uDocId) {
                $docCupId = DB::table('DOCENTE_CUP')->insertGetId([
                    'CODIGO_DOCENTE' => $uDocId,
                    'ID_CUP' => $cupId,
                    'FECHA_CREACION' => Carbon::parse($cConf['FECHA_INICIO'])->subDays(5)
                ], 'ID');
                $docCupIds[$index] = $docCupId;
                
                $matIndex = $index % count($materias); // 0,1,2,3
                $materiaAsignada = $materiaIds[$materias[$matIndex]];
                DB::table('DOCENTE_CUP_MAT')->insert(['DOCENTE_CUP_ID' => $docCupId, 'MATERIA_ID' => $materiaAsignada]);
            }

            // Grupos: Para 400+ alumnos con tamaño máx 70, min 50 -> crearemos 8 grupos (8 * 70 = 560 cupos).
            $clasesMap[$cupId] = [];
            foreach ($materiaIds as $mName => $mId) {
                $clasesMap[$cupId][$mId] = [];
                for ($g = 1; $g <= 8; $g++) {
                    $grupoId = DB::table('GRUPO')->insertGetId(['NOMBRE' => "G{$g}-M{$mId}", 'EST_MIN' => 50, 'EST_MAX' => 70], 'ID_GRUPO');
                    // Asignamos un docente y aula aleatoria
                    $d = $docCupIds[rand(0, 29)];
                    $a = $aulas[rand(0, 19)];
                    $b = $bloquesMañana[rand(0, count($bloquesMañana)-1)];

                    $claseId = DB::table('CLASE')->insertGetId([
                        'ID_CUP' => $cupId,
                        'DOCENTE_CUP_ID' => $d,
                        'ID_BLOQUE_HORARIO' => $b,
                        'ID_MATERIA' => $mId,
                        'ID_GRUPO' => $grupoId,
                        'ID_AULA' => $a
                    ], 'ID_CLASE');
                    
                    $clasesMap[$cupId][$mId][] = $claseId;
                }
            }

            // ================== POBLEMOS ALUMNOS (aprox 450-500 por CUP) ==================
            // Elegimos estudiantes inactivos del pool
            shuffle($estudiantesDisponibles);
            $cantidadAInscribir = min(450, count($estudiantesDisponibles));
            $inscritosHoy = array_splice($estudiantesDisponibles, 0, $cantidadAInscribir);

            if ($cIdx == 3) {
                // CASOS ESPECIALES AL FINAL PARA CUP EN CURSO
                // Asegurarnos de usar 15 estudiantes fijos (para probar los empates como antes)
                $estudiantesEspeciales = array_splice($estudiantesDisponibles, 0, 15);
                $estudiantesCUP4_Config = [
                    ['nota' => 95.00, 'grades' => [95, 95, 95, 95], 'opciones' => ['INGENIERIA EN SISTEMAS', 'INGENIERIA INFORMATICA']],
                    ['nota' => 90.00, 'grades' => [90, 90, 90, 90], 'opciones' => ['INGENIERIA EN SISTEMAS', 'INGENIERIA INFORMATICA']],
                    ['nota' => 85.00, 'grades' => [85, 85, 85, 85], 'opciones' => ['INGENIERIA EN SISTEMAS', 'INGENIERIA INFORMATICA']],
                    ['nota' => 80.00, 'grades' => [65, 75, 90, 90], 'opciones' => ['INGENIERIA EN SISTEMAS', 'INGENIERIA INFORMATICA']],
                    ['nota' => 80.00, 'grades' => [60, 80, 90, 90], 'opciones' => ['INGENIERIA EN SISTEMAS', 'INGENIERIA INFORMATICA']],
                    ['nota' => 75.00, 'grades' => [70, 72, 78, 80], 'opciones' => ['INGENIERIA INFORMATICA', 'INGENIERIA EN REDES']],
                    ['nota' => 75.00, 'grades' => [70, 70, 80, 80], 'opciones' => ['INGENIERIA INFORMATICA', 'INGENIERIA EN REDES']],
                    ['nota' => 75.00, 'grades' => [60, 80, 80, 80], 'opciones' => ['INGENIERIA INFORMATICA', 'INGENIERIA EN REDES']],
                    ['nota' => 75.00, 'grades' => [60, 80, 80, 80], 'opciones' => ['INGENIERIA INFORMATICA', 'INGENIERIA EN REDES']],
                    ['nota' => 70.00, 'grades' => [70, 70, 70, 70], 'opciones' => ['INGENIERIA EN REDES', 'INGENIERIA ROBOTICA']],
                    ['nota' => 70.00, 'grades' => [65, 70, 70, 75], 'opciones' => ['INGENIERIA ROBOTICA', 'INGENIERIA EN REDES']],
                    ['nota' => 60.00, 'grades' => [60, 60, 60, 60], 'opciones' => ['INGENIERIA ROBOTICA', 'INGENIERIA EN REDES']],
                    ['nota' => 59.99, 'grades' => [59, 60, 60, 60.99], 'opciones' => ['INGENIERIA ROBOTICA', 'INGENIERIA EN SISTEMAS']]
                ];

                foreach ($estudiantesEspeciales as $i => $estId) {
                    if (!isset($estudiantesCUP4_Config[$i])) break;
                    $cfg = $estudiantesCUP4_Config[$i];
                    
                    // Modificar estado global a ACTIVO
                    DB::table('ESTUDIANTE')->where('ID_ESTUDIANTE', $estId)->update(['ESTADO' => 'ACTIVO']);

                    $eCupId = DB::table('ESTUDIANTE_CUP')->insertGetId([
                        'ID_ESTUDIANTE' => $estId, 'ID_CUP' => $cupId,
                        'FECHA' => Carbon::parse($cConf['FECHA_INICIO'])->addDays(2),
                        'ESTADO' => 'INSCRITO',
                        'NOTA_FINAL' => $cfg['nota'], 'CARRERA' => null
                    ], 'ID');
                    
                    DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $ccIds[$cfg['opciones'][0]], 'OPCION' => 1]);
                    DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $ccIds[$cfg['opciones'][1]], 'OPCION' => 2]);
                    $seedGradesForEnrollment($eCupId, $cupId, $cfg['grades'], $clasesMap, $materiaIds);
                }
            }

            // Estudiantes normales para este CUP
            foreach ($inscritosHoy as $estId) {
                // Nota aleatoria entre 30 y 100
                $notaFinal = round(rand(3000, 9800) / 100, 2);
                
                // Si el CUP ya concluyó, simulamos el estado
                $estadoCup = 'INSCRITO';
                $carreraAsignada = null;
                if ($cConf['ESTADO'] === 'Concluido') {
                    if ($notaFinal >= 60.00) {
                        $estadoCup = 'APROBADO';
                        $carreraAsignada = $carreras[array_rand($carreras)]; // Asignación aleatoria simple (los cupos reales requieren correr la lógica, simulamos)
                        DB::table('ESTUDIANTE')->where('ID_ESTUDIANTE', $estId)->update(['ESTADO' => 'APROBADO']);
                    } else {
                        $estadoCup = 'REPROBADO';
                        // Vuelve al pool para el siguiente CUP
                        $estudiantesDisponibles[] = $estId;
                    }
                } else {
                    // En curso: estado INSCRITO, nota generada. Modificamos ESTUDIANTE.ESTADO a ACTIVO
                    DB::table('ESTUDIANTE')->where('ID_ESTUDIANTE', $estId)->update(['ESTADO' => 'ACTIVO']);
                }

                $eCupId = DB::table('ESTUDIANTE_CUP')->insertGetId([
                    'ID_ESTUDIANTE' => $estId,
                    'ID_CUP' => $cupId,
                    'FECHA' => Carbon::parse($cConf['FECHA_INICIO'])->addDays(rand(1, 15)),
                    'ESTADO' => $estadoCup,
                    'NOTA_FINAL' => $notaFinal,
                    'CARRERA' => $carreraAsignada
                ], 'ID');

                // Opciones de carrera
                $k = array_rand($carreras, 2);
                DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $ccIds[$carreras[$k[0]]], 'OPCION' => 1]);
                DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $ccIds[$carreras[$k[1]]], 'OPCION' => 2]);

                $gradesList = $generateSubjectGrades($notaFinal, 4);
                $seedGradesForEnrollment($eCupId, $cupId, $gradesList, $clasesMap, $materiaIds);
            }
        }
    }
}