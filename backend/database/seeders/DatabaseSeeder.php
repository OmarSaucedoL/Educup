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
        DB::table('MODULO')->truncate();
        DB::table('ROL')->truncate();

        Schema::enableForeignKeyConstraints();

        // ==========================================
        // 1. CONTROL DE ACCESO, ROLES, MÓDULOS Y SEGURIDAD
        // ==========================================
        $rolAdmin = DB::table('ROL')->insertGetId(['NOMBRE' => 'ADMINISTRADOR'], 'ID');
        $rolDocente = DB::table('ROL')->insertGetId(['NOMBRE' => 'DOCENTE'], 'ID');

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
            
            // Asignar todos los permisos al Administrador
            DB::table('PERMISO_ROL')->insert([
                'ROL_ID' => $rolAdmin,
                'PERMISOS_ID' => $permisosIds[$pNombre],
                'ESTADO' => 'ACTIVO',
                'FECHA_MOD' => Carbon::now()
            ]);
        }

        // Permisos específicos para Docentes (Ver materias, aulas, horarios, calificaciones y registrar notas)
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

        // Administrador Principal del Sistema (OMAR.ADMIN)
        $uAdminId = DB::table('USUARIO')->insertGetId([
            'USERNAME' => 'OMAR.ADMIN',
            'CONTRASENIA' => Hash::make('contraseña'),
            'CARNET' => 8432111,
            'NOMBRE' => 'OMAR ALY',
            'APELLIDO' => 'SAUCEDO LINO',
            'CORREO' => 'admin@cup.edu',
            'ESTADO' => 'ACTIVO',
            'FECHA_CREACION' => Carbon::now(),
            'ROL_ID' => $rolAdmin
        ], 'ID');

        // Seed direct permissions for admin
        $allPermisos = DB::table('PERMISOS')->pluck('ID');
        foreach ($allPermisos as $permId) {
            DB::table('PERMISOS_USUARIO')->insert([
                'USUARIO_ID' => $uAdminId,
                'PERMISOS_ID' => $permId,
                'ESTADO' => 'ACTIVO',
                'FECHA_MOD' => Carbon::now()
            ]);
        }

        // Generación de 10 Docentes con la estructura de cuentas DOCENTE_1 a DOCENTE_10
        $docenteUserIds = [];
        for ($i = 1; $i <= 10; $i++) {
            $uDocId = DB::table('USUARIO')->insertGetId([
                'USERNAME' => "DOCENTE_{$i}",
                'CONTRASENIA' => Hash::make('Docente'),
                'CARNET' => 4567890 + $i,
                'NOMBRE' => "DOCENTE {$i}",
                'APELLIDO' => "APELLIDO {$i}",
                'CORREO' => "docente{$i}@cup.edu",
                'ESTADO' => 'ACTIVO',
                'FECHA_CREACION' => Carbon::now(),
                'ROL_ID' => $rolDocente
            ], 'ID');
            $docenteUserIds[] = $uDocId;

            // Extensión a la tabla semántica DOCENTE
            DB::table('DOCENTE')->insert(['CODIGO_DOCENTE' => $uDocId]);

            // Seed direct permissions for docente based on ROL_ID
            $rolPermisosIds = DB::table('PERMISO_ROL')
                ->where('ROL_ID', $rolDocente)
                ->where('ESTADO', 'ACTIVO')
                ->pluck('PERMISOS_ID');
            foreach ($rolPermisosIds as $permId) {
                DB::table('PERMISOS_USUARIO')->insert([
                    'USUARIO_ID' => $uDocId,
                    'PERMISOS_ID' => $permId,
                    'ESTADO' => 'ACTIVO',
                    'FECHA_MOD' => Carbon::now()
                ]);
            }
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

        // Infraestructura de Aulas
        $aula1 = DB::table('AULA')->insertGetId(['NOMBRE' => 'AULA 101', 'ESTADO' => 'ACTIVO'], 'ID_AULA');
        $aula2 = DB::table('AULA')->insertGetId(['NOMBRE' => 'AULA 102', 'ESTADO' => 'ACTIVO'], 'ID_AULA');
        $aula3 = DB::table('AULA')->insertGetId(['NOMBRE' => 'AULA 103', 'ESTADO' => 'ACTIVO'], 'ID_AULA');

        // Grupos son generados dinámicamente por cada CUP más abajo.
        // Colegios y Ciudades
        $ciudadId = DB::table('CIUDAD')->insertGetId(['NOMBRE' => 'SANTA CRUZ DE LA SIERRA', 'DEPARTAMENTO' => 'SANTA CRUZ'], 'ID');
        $colegioId = DB::table('COLEGIO')->insertGetId(['NOMBRE' => 'NACIONAL FLORIDA'], 'ID');

        // ==============================================================
        // ESTRUCTURA TEMPORAL DE BLOQUES HORARIOS REALISTA (2 MATERIAS/DIA)
        // ==============================================================
        $bloquesMañana = [];
        $bloquesTarde = [];
        $bloquesNoche = [];

        $diasG1 = ['LUNES', 'MIERCOLES', 'VIERNES'];
        $diasG2 = ['MARTES', 'JUEVES', 'SABADO'];

        $horariosConfig = [
            'MAÑANA' => [['07:00:00', '09:00:00'], ['09:00:00', '11:00:00']],
            'TARDE'  => [['13:30:00', '15:30:00'], ['15:30:00', '17:30:00']],
            'NOCHE'  => [['18:00:00', '20:00:00'], ['20:00:00', '22:00:00']]
        ];

        foreach (['MAÑANA', 'TARDE', 'NOCHE'] as $turno) {
            $bloques = [];
            foreach ([$diasG1, $diasG2] as $grupoDias) {
                foreach ($horariosConfig[$turno] as $horaObj) {
                    $bloqueId = DB::table('BLOQUE_HORARIO')->insertGetId(['TURNO' => $turno], 'ID_BLOQUE_HORARIO');
                    $bloques[] = $bloqueId;
                    foreach ($grupoDias as $dia) {
                        // Insertar o buscar el horario
                        $hId = DB::table('HORARIO')->where([
                            'DIA' => $dia, 'HORA_INI' => $horaObj[0], 'HORA_FIN' => $horaObj[1]
                        ])->value('ID');
                        
                        if (!$hId) {
                            $hId = DB::table('HORARIO')->insertGetId([
                                'DIA' => $dia, 'HORA_INI' => $horaObj[0], 'HORA_FIN' => $horaObj[1]
                            ], 'ID');
                        }
                        
                        DB::table('HORARIO_EN_BLOQUE')->insert([
                            'HORARIO_ID' => $hId,
                            'ID_BLOQUE_HORARIO' => $bloqueId,
                            'CARGA_HORARIA' => '2'
                        ]);
                    }
                }
            }
            if ($turno === 'MAÑANA') $bloquesMañana = $bloques;
            if ($turno === 'TARDE') $bloquesTarde = $bloques;
            if ($turno === 'NOCHE') $bloquesNoche = $bloques;
        }

        $bMañana = $bloquesMañana[0]; // Referencia original para las clases hardcodeadas del seeder

        // Asignación de competencias de docentes por materia base
        $teacherSubjects = [
            0 => $materiaIds['COMPUTACION'],
            1 => $materiaIds['COMPUTACION'],
            2 => $materiaIds['MATEMATICA'],
            3 => $materiaIds['MATEMATICA'],
            4 => $materiaIds['INGLES'],
            5 => $materiaIds['INGLES'],
            6 => $materiaIds['FISICA'],
            7 => $materiaIds['FISICA'],
            8 => $materiaIds['MATEMATICA'],
            9 => $materiaIds['FISICA'],
        ];

        // ==========================================
        // 3. LÍNEA DE TIEMPO CUP (3 CONCLUIDOS)
        // ==========================================
        $cupsConfig = [
            [
                'ANIO' => 2024,
                'SEMESTRE' => 1,
                'FECHA_INICIO' => '2024-01-15',
                'FECHA_FIN' => '2024-06-20',
            ],
            [
                'ANIO' => 2024,
                'SEMESTRE' => 2,
                'FECHA_INICIO' => '2024-07-15',
                'FECHA_FIN' => '2024-12-20',
            ],
            [
                'ANIO' => 2025,
                'SEMESTRE' => 1,
                'FECHA_INICIO' => '2025-01-15',
                'FECHA_FIN' => '2025-06-20',
            ],
        ];

        $cupIds = [];
        $clasesMap = [];

        foreach ($cupsConfig as $cConf) {
            $cupId = DB::table('CUP')->insertGetId([
                'ANIO' => $cConf['ANIO'],
                'SEMESTRE' => $cConf['SEMESTRE'],
                'NOTA_MINIMA' => 60.00,
                'CUPOS' => 200,
                'FECHA_INICIO' => $cConf['FECHA_INICIO'],
                'FECHA_FIN' => $cConf['FECHA_FIN'],
                'USUARIO_ID' => $uAdminId,
                'ESTADO' => 'Concluido'
            ], 'ID_CUP');
            $cupIds[] = $cupId;

            // Registrar oferta de cupos por carrera en este periodo
            foreach ($carreraIds as $cId) {
                DB::table('CARRERA_CUP')->insert([
                    'ID_CARRERA' => $cId,
                    'ID_CUP' => $cupId,
                    'CUPOS' => 50
                ]);
            }

            // Registrar materias vinculadas en este periodo
            foreach ($materiaIds as $mId) {
                DB::table('MATERIA_CUP')->insert([
                    'ID_CUP' => $cupId,
                    'ID_MATERIA' => $mId
                ]);
            }

            // Vincular docentes disponibles a la convocatoria actual
            $docCupIds = [];
            foreach ($docenteUserIds as $index => $uDocId) {
                $docCupId = DB::table('DOCENTE_CUP')->insertGetId([
                    'CODIGO_DOCENTE' => $uDocId,
                    'ID_CUP' => $cupId,
                    'FECHA_CREACION' => Carbon::parse($cConf['FECHA_INICIO'])->subDays(5)
                ], 'ID');
                $docCupIds[$index] = $docCupId;

                // Asignar materia competente al docente dentro del CUP
                DB::table('DOCENTE_CUP_MAT')->insert([
                    'DOCENTE_CUP_ID' => $docCupId,
                    'MATERIA_ID' => $teacherSubjects[$index]
                ]);
            }

            // Generación de clases operativas para cada materia de este CUP
            $clasesMap[$cupId] = [];

            // Generar un nombre de grupo de ejemplo para el seeder
            $anioCorto = substr((string)$cConf['ANIO'], -2);
            $nroSem = $cConf['SEMESTRE'];
            
            $grupoA_Id = DB::table('GRUPO')->insertGetId(['NOMBRE' => "{$anioCorto}{$nroSem}1", 'EST_MIN' => 20, 'EST_MAX' => 80], 'ID_GRUPO');
            $grupoB_Id = DB::table('GRUPO')->insertGetId(['NOMBRE' => "{$anioCorto}{$nroSem}2", 'EST_MIN' => 20, 'EST_MAX' => 80], 'ID_GRUPO');

            // COMPUTACION (Docente 1, Aula 101, Grupo A)
            $clasesMap[$cupId][$materiaIds['COMPUTACION']] = DB::table('CLASE')->insertGetId([
                'ID_CUP' => $cupId,
                'DOCENTE_CUP_ID' => $docCupIds[0],
                'ID_BLOQUE_HORARIO' => $bMañana,
                'ID_MATERIA' => $materiaIds['COMPUTACION'],
                'ID_GRUPO' => $grupoA_Id,
                'ID_AULA' => $aula1
            ], 'ID_CLASE');

            // MATEMATICA (Docente 3, Aula 102, Grupo A)
            $clasesMap[$cupId][$materiaIds['MATEMATICA']] = DB::table('CLASE')->insertGetId([
                'ID_CUP' => $cupId,
                'DOCENTE_CUP_ID' => $docCupIds[2],
                'ID_BLOQUE_HORARIO' => $bMañana,
                'ID_MATERIA' => $materiaIds['MATEMATICA'],
                'ID_GRUPO' => $grupoA_Id,
                'ID_AULA' => $aula2
            ], 'ID_CLASE');

            // INGLES (Docente 5, Aula 103, Grupo B)
            $clasesMap[$cupId][$materiaIds['INGLES']] = DB::table('CLASE')->insertGetId([
                'ID_CUP' => $cupId,
                'DOCENTE_CUP_ID' => $docCupIds[4],
                'ID_BLOQUE_HORARIO' => $bMañana,
                'ID_MATERIA' => $materiaIds['INGLES'],
                'ID_GRUPO' => $grupoB_Id,
                'ID_AULA' => $aula3
            ], 'ID_CLASE');

            // FISICA (Docente 7, Aula 101, Grupo B)
            $clasesMap[$cupId][$materiaIds['FISICA']] = DB::table('CLASE')->insertGetId([
                'ID_CUP' => $cupId,
                'DOCENTE_CUP_ID' => $docCupIds[6],
                'ID_BLOQUE_HORARIO' => $bMañana,
                'ID_MATERIA' => $materiaIds['FISICA'],
                'ID_GRUPO' => $grupoB_Id,
                'ID_AULA' => $aula1
            ], 'ID_CLASE');
        }

        // ==========================================
        // 4. SIEMBRA DE 50 ESTUDIANTES REALISTAS
        // ==========================================
        $nombresMasc = ['CARLOS', 'JUAN', 'PEDRO', 'LUIS', 'JORGE', 'ANDRES', 'MIGUEL', 'CRISTIAN', 'FERNANDO', 'RICARDO', 'ALEJANDRO', 'DAVID', 'MAURICIO', 'ROBERTO', 'DANIEL'];
        $nombresFem = ['MARIA', 'ANA', 'LAURA', 'SOFIA', 'ANDREA', 'CAROLINA', 'GABRIELA', 'PATRICIA', 'ELIZABETH', 'CLAUDIA', 'NATALIA', 'VALERIA', 'CAMILA', 'DANIELA', 'ISABEL'];
        $apellidos = ['SAUCEDO', 'LINO', 'PEREZ', 'GOMEZ', 'SANDOVAL', 'AGUILERA', 'LOPEZ', 'SUAREZ', 'RODRIGUEZ', 'TORRES', 'MENDOZA', 'FLORES', 'ROJAS', 'VARGAS', 'CASTRO', 'GUZMAN', 'ORTEGA', 'PINTO', 'CHAVEZ', 'MORALES'];

        $studentIds = [];
        for ($i = 1; $i <= 50; $i++) {
            $gender = ($i % 2 === 0) ? 'F' : 'M';
            $name = ($gender === 'M') 
                ? $nombresMasc[($i - 1) % count($nombresMasc)]
                : $nombresFem[($i - 1) % count($nombresFem)];
            $lastname1 = $apellidos[($i - 1) % count($apellidos)];
            $lastname2 = $apellidos[($i + 3) % count($apellidos)];
            
            $carnet = 6000000 + $i;
            $correo = strtolower("estudiante{$i}@mail.com");
            $titulo = "TIT-BACH-2023-{$carnet}";

            $estId = DB::table('ESTUDIANTE')->insertGetId([
                'CARNET' => $carnet,
                'NOMBRE' => $name,
                'APELLIDO' => "{$lastname1} {$lastname2}",
                'FECHA_NAC' => '2005-' . str_pad(($i % 12) + 1, 2, '0', STR_PAD_LEFT) . '-' . str_pad(($i % 28) + 1, 2, '0', STR_PAD_LEFT),
                'DIRECCION' => "AV. BUSCH, CALLE " . ($i % 20 + 1),
                'TELEFONO' => "700" . str_pad($i, 5, '0', STR_PAD_LEFT),
                'CORREO' => $correo,
                'TITULO_BACHILLER' => $titulo,
                'SEXO' => $gender,
                'ESTADO' => $i <= 15 ? 'INACTIVO' : 'APROBADO',
                'COLEGIO_ID' => $colegioId,
                'CIUDAD_ID' => $ciudadId
            ], 'ID_ESTUDIANTE');
            $studentIds[$i] = $estId;
        }

        // --- Función matemática para generar notas que promedien exactamente la Nota Final ---
        $generateSubjectGrades = function ($notaFinal, $numSubjects = 4) {
            $targetSum = $notaFinal * $numSubjects;
            $grades = [];
            $currentSum = 0;
            
            for ($i = 0; $i < $numSubjects - 1; $i++) {
                $dev = rand(-700, 700) / 100; // Desviación controlada entre -7 y +7
                $g = min(98, max(20, $notaFinal + $dev));
                $grades[] = round($g, 2);
                $currentSum += $g;
            }
            
            $lastGrade = $targetSum - $currentSum;
            // Si la última materia se sale de límites, devolvemos la nota uniforme
            if ($lastGrade < 10 || $lastGrade > 100) {
                return array_fill(0, $numSubjects, round($notaFinal, 2));
            }
            $grades[] = round($lastGrade, 2);
            
            return $grades;
        };

        // --- Función para sembrar notas exactas de 3 exámenes por clase ---
        $seedGradesForEnrollment = function ($eCupId, $cupId, $gradesList) use ($clasesMap, $materiaIds) {
            $materiasOrder = ['COMPUTACION', 'MATEMATICA', 'INGLES', 'FISICA'];
            foreach ($materiasOrder as $mIdx => $mName) {
                $mId = $materiaIds[$mName];
                $claseId = $clasesMap[$cupId][$mId];
                $subGrade = $gradesList[$mIdx];

                $estClaseId = DB::table('ESTUDIANTES_CLASE')->insertGetId([
                    'ESTUDIANTE_CUP_ID' => $eCupId,
                    'ID_CLASE' => $claseId,
                    'NOTA_FINAL' => round($subGrade, 2),
                    'ESTADO' => ($subGrade >= 60.00) ? 'APROBADO' : 'REPROBADO',
                ], 'ID');

                // Tres calificaciones cuya suma ponderada (30% + 30% + 40%) sea exactamente la nota final
                DB::table('CALIFICACIONES')->insert([
                    'NOMBRE' => 'PRIMER PARCIAL',
                    'CALIFICACION' => round($subGrade, 1),
                    'PONDERACION' => 30.00,
                    'ESTUDIANTE_CLASE_ID' => $estClaseId
                ]);

                DB::table('CALIFICACIONES')->insert([
                    'NOMBRE' => 'SEGUNDO PARCIAL',
                    'CALIFICACION' => round($subGrade, 1),
                    'PONDERACION' => 30.00,
                    'ESTUDIANTE_CLASE_ID' => $estClaseId
                ]);

                DB::table('CALIFICACIONES')->insert([
                    'NOMBRE' => 'EXAMEN FINAL',
                    'CALIFICACION' => round($subGrade, 1),
                    'PONDERACION' => 40.00,
                    'ESTUDIANTE_CLASE_ID' => $estClaseId
                ]);
            }
        };

        // ==========================================
        // 5. ESCENARIOS Y TRAYECTORIAS ESTUDIANTILES
        // ==========================================

        // --- PERFIL A (Los que fallaron en todo - 15 Estudiantes: IDs 1 a 15) ---
        // Se inscribieron a los 3 periodos CUP y reprobaron todos sistemáticamente con NOTA_FINAL < 60
        for ($sIdx = 1; $sIdx <= 15; $sIdx++) {
            $estId = $studentIds[$sIdx];
            
            foreach ($cupIds as $cIdx => $cupId) {
                $notaFinal = round(rand(3500, 5500) / 100, 2); // Nota reprobatoria entre 35.00 y 55.00
                
                $eCupId = DB::table('ESTUDIANTE_CUP')->insertGetId([
                    'ID_ESTUDIANTE' => $estId,
                    'ID_CUP' => $cupId,
                    'FECHA' => Carbon::parse($cupsConfig[$cIdx]['FECHA_INICIO'])->addDays(2),
                    'ESTADO' => 'REPROBADO',
                    'NOTA_FINAL' => $notaFinal,
                    'CARRERA' => null
                ], 'ID');

                // Registro de opciones postuladas en el periodo
                $cCups = DB::table('CARRERA_CUP')->where('ID_CUP', $cupId)->get();
                DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $cCups[0]->ID, 'OPCION' => 1]);
                DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $cCups[1]->ID, 'OPCION' => 2]);

                // Calificaciones académicas exactas
                $gradesList = $generateSubjectGrades($notaFinal, 4);
                $seedGradesForEnrollment($eCupId, $cupId, $gradesList);
            }
        }

        // --- PERFIL B (La Redención - 15 Estudiantes: IDs 16 a 30) ---
        // Reprobaron CUP 1 y CUP 2, pero en el CUP 3 aprobaron exitosamente con plaza en INGENIERIA EN SISTEMAS
        for ($sIdx = 16; $sIdx <= 30; $sIdx++) {
            $estId = $studentIds[$sIdx];

            // CUP 1 (2024-I) y CUP 2 (2024-II): Reprobaron
            for ($cIdx = 0; $cIdx <= 1; $cIdx++) {
                $cupId = $cupIds[$cIdx];
                $notaFinal = round(rand(4000, 5400) / 100, 2);
                
                $eCupId = DB::table('ESTUDIANTE_CUP')->insertGetId([
                    'ID_ESTUDIANTE' => $estId,
                    'ID_CUP' => $cupId,
                    'FECHA' => Carbon::parse($cupsConfig[$cIdx]['FECHA_INICIO'])->addDays(2),
                    'ESTADO' => 'REPROBADO',
                    'NOTA_FINAL' => $notaFinal,
                    'CARRERA' => null
                ], 'ID');

                $cCups = DB::table('CARRERA_CUP')->where('ID_CUP', $cupId)->get();
                DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $cCups[1]->ID, 'OPCION' => 1]);
                DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $cCups[2]->ID, 'OPCION' => 2]);

                $gradesList = $generateSubjectGrades($notaFinal, 4);
                $seedGradesForEnrollment($eCupId, $cupId, $gradesList);
            }

            // CUP 3 (2025-I): Redención y Aprobación
            $cupId = $cupIds[2];
            $notaFinal = round(rand(6500, 8500) / 100, 2); // Nota aprobatoria >= 60.00
            
            $eCupId = DB::table('ESTUDIANTE_CUP')->insertGetId([
                'ID_ESTUDIANTE' => $estId,
                'ID_CUP' => $cupId,
                'FECHA' => Carbon::parse($cupsConfig[2]['FECHA_INICIO'])->addDays(2),
                'ESTADO' => 'APROBADO',
                'NOTA_FINAL' => $notaFinal,
                'CARRERA' => 'INGENIERIA EN SISTEMAS'
            ], 'ID');

            $ccSist = DB::table('CARRERA_CUP')->where(['ID_CUP' => $cupId, 'ID_CARRERA' => $carreraIds['INGENIERIA EN SISTEMAS']])->first()->ID;
            $ccInfo = DB::table('CARRERA_CUP')->where(['ID_CUP' => $cupId, 'ID_CARRERA' => $carreraIds['INGENIERIA INFORMATICA']])->first()->ID;
            
            DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $ccSist, 'OPCION' => 1]);
            DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $ccInfo, 'OPCION' => 2]);

            $gradesList = $generateSubjectGrades($notaFinal, 4);
            $seedGradesForEnrollment($eCupId, $cupId, $gradesList);
        }

        // --- PERFIL C (Aprobación Inmediata - 20 Estudiantes: IDs 31 a 50) ---
        // Admitidos en su primer intento. No vuelven a aparecer en periodos posteriores.
        
        // 10 Estudiantes ingresan en el CUP 1 (IDs 31 a 40)
        for ($sIdx = 31; $sIdx <= 40; $sIdx++) {
            $estId = $studentIds[$sIdx];
            $cupId = $cupIds[0];
            $notaFinal = round(rand(7000, 9200) / 100, 2);

            $eCupId = DB::table('ESTUDIANTE_CUP')->insertGetId([
                'ID_ESTUDIANTE' => $estId,
                'ID_CUP' => $cupId,
                'FECHA' => Carbon::parse($cupsConfig[0]['FECHA_INICIO'])->addDays(2),
                'ESTADO' => 'APROBADO',
                'NOTA_FINAL' => $notaFinal,
                'CARRERA' => 'INGENIERIA INFORMATICA'
            ], 'ID');

            $ccInfo = DB::table('CARRERA_CUP')->where(['ID_CUP' => $cupId, 'ID_CARRERA' => $carreraIds['INGENIERIA INFORMATICA']])->first()->ID;
            $ccSist = DB::table('CARRERA_CUP')->where(['ID_CUP' => $cupId, 'ID_CARRERA' => $carreraIds['INGENIERIA EN SISTEMAS']])->first()->ID;

            DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $ccInfo, 'OPCION' => 1]);
            DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $ccSist, 'OPCION' => 2]);

            $gradesList = $generateSubjectGrades($notaFinal, 4);
            $seedGradesForEnrollment($eCupId, $cupId, $gradesList);
        }

        // 10 Estudiantes ingresan en el CUP 2 (IDs 41 a 50)
        for ($sIdx = 41; $sIdx <= 50; $sIdx++) {
            $estId = $studentIds[$sIdx];
            $cupId = $cupIds[1];
            $notaFinal = round(rand(7000, 9500) / 100, 2);

            $eCupId = DB::table('ESTUDIANTE_CUP')->insertGetId([
                'ID_ESTUDIANTE' => $estId,
                'ID_CUP' => $cupId,
                'FECHA' => Carbon::parse($cupsConfig[1]['FECHA_INICIO'])->addDays(2),
                'ESTADO' => 'APROBADO',
                'NOTA_FINAL' => $notaFinal,
                'CARRERA' => 'INGENIERIA EN REDES'
            ], 'ID');

            $ccRedes = DB::table('CARRERA_CUP')->where(['ID_CUP' => $cupId, 'ID_CARRERA' => $carreraIds['INGENIERIA EN REDES']])->first()->ID;
            $ccTel = DB::table('CARRERA_CUP')->where(['ID_CUP' => $cupId, 'ID_CARRERA' => $carreraIds['INGENIERIA ROBOTICA']])->first()->ID;

            DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $ccRedes, 'OPCION' => 1]);
            DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $ccTel, 'OPCION' => 2]);

            $gradesList = $generateSubjectGrades($notaFinal, 4);
            $seedGradesForEnrollment($eCupId, $cupId, $gradesList);
        }

        // ==========================================
        // 6. CUP DE PRUEBA ACTIVO ("En curso")
        // ==========================================
        $cupPruebaId = DB::table('CUP')->insertGetId([
            'ANIO' => 2026,
            'SEMESTRE' => 1,
            'NOTA_MINIMA' => 60.00,
            'CUPOS' => 7, // Total cupos
            'FECHA_INICIO' => '2026-01-15',
            'FECHA_FIN' => '2026-06-20',
            'USUARIO_ID' => $uAdminId,
            'ESTADO' => 'En curso' // Activo para que se pueda ejecutar el Cierre
        ], 'ID_CUP');

        // Oferta de carreras con cupos muy limitados para forzar el comportamiento de llenado y rebotado
        $carrerasCupPrueba = [
            'INGENIERIA EN SISTEMAS' => 2,
            'INGENIERIA INFORMATICA' => 2,
            'INGENIERIA EN REDES' => 1,
            'INGENIERIA ROBOTICA' => 1,
        ];
        $ccPruebaIds = [];
        foreach ($carrerasCupPrueba as $cName => $cuposCant) {
            $ccPruebaIds[$cName] = DB::table('CARRERA_CUP')->insertGetId([
                'ID_CARRERA' => $carreraIds[$cName],
                'ID_CUP' => $cupPruebaId,
                'CUPOS' => $cuposCant
            ], 'ID');
        }

        // Vincular materias a este CUP de prueba
        foreach ($materiaIds as $mId) {
            DB::table('MATERIA_CUP')->insert([
                'ID_CUP' => $cupPruebaId,
                'ID_MATERIA' => $mId
            ]);
        }

        // Generar un grupo de clases para el CUP de prueba para poder sembrar notas
        $grupoPruebaId = DB::table('GRUPO')->insertGetId([
            'NOMBRE' => '2611',
            'EST_MIN' => 5,
            'EST_MAX' => 30
        ], 'ID_GRUPO');

        // Vincular docentes y crear clases para el CUP de prueba
        $clasesPruebaMap = [];
        $materiasKeys = ['COMPUTACION', 'MATEMATICA', 'INGLES', 'FISICA'];
        
        // Vincular docentes disponibles a la convocatoria del CUP 4
        $docCupPruebaIds = [];
        foreach ($docenteUserIds as $index => $uDocId) {
            $docCupId = DB::table('DOCENTE_CUP')->insertGetId([
                'CODIGO_DOCENTE' => $uDocId,
                'ID_CUP' => $cupPruebaId,
                'FECHA_CREACION' => Carbon::now()
            ], 'ID');
            $docCupPruebaIds[$index] = $docCupId;

            DB::table('DOCENTE_CUP_MAT')->insert([
                'DOCENTE_CUP_ID' => $docCupId,
                'MATERIA_ID' => $teacherSubjects[$index]
            ]);
        }

        // Crear clases
        $clasesPruebaMap[$materiaIds['COMPUTACION']] = DB::table('CLASE')->insertGetId([
            'ID_CUP' => $cupPruebaId,
            'DOCENTE_CUP_ID' => $docCupPruebaIds[0],
            'ID_BLOQUE_HORARIO' => $bMañana,
            'ID_MATERIA' => $materiaIds['COMPUTACION'],
            'ID_GRUPO' => $grupoPruebaId,
            'ID_AULA' => $aula1
        ], 'ID_CLASE');

        $clasesPruebaMap[$materiaIds['MATEMATICA']] = DB::table('CLASE')->insertGetId([
            'ID_CUP' => $cupPruebaId,
            'DOCENTE_CUP_ID' => $docCupPruebaIds[2],
            'ID_BLOQUE_HORARIO' => $bMañana,
            'ID_MATERIA' => $materiaIds['MATEMATICA'],
            'ID_GRUPO' => $grupoPruebaId,
            'ID_AULA' => $aula2
        ], 'ID_CLASE');

        $clasesPruebaMap[$materiaIds['INGLES']] = DB::table('CLASE')->insertGetId([
            'ID_CUP' => $cupPruebaId,
            'DOCENTE_CUP_ID' => $docCupPruebaIds[4],
            'ID_BLOQUE_HORARIO' => $bMañana,
            'ID_MATERIA' => $materiaIds['INGLES'],
            'ID_GRUPO' => $grupoPruebaId,
            'ID_AULA' => $aula3
        ], 'ID_CLASE');

        $clasesPruebaMap[$materiaIds['FISICA']] = DB::table('CLASE')->insertGetId([
            'ID_CUP' => $cupPruebaId,
            'DOCENTE_CUP_ID' => $docCupPruebaIds[6],
            'ID_BLOQUE_HORARIO' => $bMañana,
            'ID_MATERIA' => $materiaIds['FISICA'],
            'ID_GRUPO' => $grupoPruebaId,
            'ID_AULA' => $aula1
        ], 'ID_CLASE');

        // Estudiantes de prueba para CUP 4
        // Queremos probar orden de mérito, opciones cruzadas y tiebreakers con notas exactas
        $estudiantesCUP4 = [
            // Estudiante 1: Nota 95. Opción 1: Sistemas, Opción 2: Informatica.
            ['nombre' => 'ANDRES', 'apellido' => 'VILLAGOMEZ', 'nota' => 95.00, 'grades' => [95, 95, 95, 95], 'opciones' => ['INGENIERIA EN SISTEMAS', 'INGENIERIA INFORMATICA']],
            // Estudiante 2: Nota 90. Opción 1: Sistemas, Opción 2: Informatica.
            ['nombre' => 'BEATRIZ', 'apellido' => 'JUSTINIANO', 'nota' => 90.00, 'grades' => [90, 90, 90, 90], 'opciones' => ['INGENIERIA EN SISTEMAS', 'INGENIERIA INFORMATICA']],
            // Estudiante 3: Nota 85. Opción 1: Sistemas, Opción 2: Informatica.
            ['nombre' => 'CARLOS', 'apellido' => 'PINTO', 'nota' => 85.00, 'grades' => [85, 85, 85, 85], 'opciones' => ['INGENIERIA EN SISTEMAS', 'INGENIERIA INFORMATICA']],
            
            // Estudiantes 4 y 5: Empate de Nota 80.00. 
            // Estudiante 4 (T2): Grades [65, 75, 90, 90]. Mínima es 65.
            ['nombre' => 'DANIEL', 'apellido' => 'SUAREZ', 'nota' => 80.00, 'grades' => [65, 75, 90, 90], 'opciones' => ['INGENIERIA EN SISTEMAS', 'INGENIERIA INFORMATICA']],
            // Estudiante 5 (T1): Grades [60, 80, 90, 90]. Mínima es 60.
            ['nombre' => 'EDUARDO', 'apellido' => 'GUTIERREZ', 'nota' => 80.00, 'grades' => [60, 80, 90, 90], 'opciones' => ['INGENIERIA EN SISTEMAS', 'INGENIERIA INFORMATICA']],
            
            // Estudiantes 6 y 7: Empate de Nota 75.00. 
            // Ambos tienen nota mínima 70.
            // Estudiante 6 (T4): Grades [70, 72, 78, 80]. Segunda mínima es 72.
            ['nombre' => 'FERNANDA', 'apellido' => 'MENDIZABAL', 'nota' => 75.00, 'grades' => [70, 72, 78, 80], 'opciones' => ['INGENIERIA INFORMATICA', 'INGENIERIA EN REDES']],
            // Estudiante 7 (T3): Grades [70, 70, 80, 80]. Segunda mínima es 70.
            ['nombre' => 'GUSTAVO', 'apellido' => 'SANDOVAL', 'nota' => 75.00, 'grades' => [70, 70, 80, 80], 'opciones' => ['INGENIERIA INFORMATICA', 'INGENIERIA EN REDES']],
            
            // Estudiante 8: Nota 70. Opción 1: Redes, Opción 2: Robotica.
            ['nombre' => 'HUGO', 'apellido' => 'MORALES', 'nota' => 70.00, 'grades' => [70, 70, 70, 70], 'opciones' => ['INGENIERIA EN REDES', 'INGENIERIA ROBOTICA']],
            // Estudiante 9: Nota 65. Opción 1: Redes, Opción 2: Robotica.
            ['nombre' => 'IRENE', 'apellido' => 'VALVERDE', 'nota' => 65.00, 'grades' => [65, 65, 65, 65], 'opciones' => ['INGENIERIA EN REDES', 'INGENIERIA ROBOTICA']],
            // Estudiante 10: Nota 60. Opción 1: Robotica, Opción 2: Sistemas.
            ['nombre' => 'JORGE', 'apellido' => 'CHAVEZ', 'nota' => 60.00, 'grades' => [60, 60, 60, 60], 'opciones' => ['INGENIERIA ROBOTICA', 'INGENIERIA EN SISTEMAS']],
        ];

        foreach ($estudiantesCUP4 as $key => $estData) {
            $carnet = 7000000 + $key;
            $correo = strtolower("cup4_{$key}@mail.com");
            $titulo = "TIT-BACH-2026-{$carnet}";

            $estId = DB::table('ESTUDIANTE')->insertGetId([
                'CARNET' => $carnet,
                'NOMBRE' => $estData['nombre'],
                'APELLIDO' => $estData['apellido'],
                'FECHA_NAC' => '2007-05-15',
                'DIRECCION' => 'AV. BUSCH',
                'TELEFONO' => '7891234' . $key,
                'CORREO' => $correo,
                'TITULO_BACHILLER' => $titulo,
                'SEXO' => ($key % 2 === 0) ? 'M' : 'F',
                'ESTADO' => 'APROBADO', // Debe ser aprobado en general
                'COLEGIO_ID' => $colegioId,
                'CIUDAD_ID' => $ciudadId
            ], 'ID_ESTUDIANTE');

            // Crear el registro de postulación CUP en estado APROBADO pero sin CARRERA asignada
            $eCupId = DB::table('ESTUDIANTE_CUP')->insertGetId([
                'ID_ESTUDIANTE' => $estId,
                'ID_CUP' => $cupPruebaId,
                'FECHA' => Carbon::now(),
                'ESTADO' => 'APROBADO', // Solo los aprobados entran en la asignación de plazas
                'NOTA_FINAL' => $estData['nota'],
                'CARRERA' => null // Inicialmente null para que lo asigne el procedimiento
            ], 'ID');

            // Registrar las dos opciones de carrera elegidas
            foreach ($estData['opciones'] as $opIdx => $cName) {
                DB::table('OPCION_CARRERA')->insert([
                    'ESTUDIANTE_CUP_ID' => $eCupId,
                    'CARRERA_CUP_ID' => $ccPruebaIds[$cName],
                    'OPCION' => $opIdx + 1
                ]);
            }

            // Registrar las notas individuales de las 4 materias
            foreach ($materiasKeys as $mIdx => $mName) {
                $mId = $materiaIds[$mName];
                $claseId = $clasesPruebaMap[$mId];
                $subGrade = $estData['grades'][$mIdx];

                $estClaseId = DB::table('ESTUDIANTES_CLASE')->insertGetId([
                    'ESTUDIANTE_CUP_ID' => $eCupId,
                    'ID_CLASE' => $claseId,
                    'NOTA_FINAL' => $subGrade,
                    'ESTADO' => ($subGrade >= 60.00) ? 'APROBADO' : 'REPROBADO',
                ], 'ID');

                // Calificaciones parciales correspondientes
                DB::table('CALIFICACIONES')->insert([
                    'NOMBRE' => 'PRIMER PARCIAL',
                    'CALIFICACION' => $subGrade,
                    'PONDERACION' => 30.00,
                    'ESTUDIANTE_CLASE_ID' => $estClaseId
                ]);
                DB::table('CALIFICACIONES')->insert([
                    'NOMBRE' => 'SEGUNDO PARCIAL',
                    'CALIFICACION' => $subGrade,
                    'PONDERACION' => 30.00,
                    'ESTUDIANTE_CLASE_ID' => $estClaseId
                ]);
                DB::table('CALIFICACIONES')->insert([
                    'NOMBRE' => 'EXAMEN FINAL',
                    'CALIFICACION' => $subGrade,
                    'PONDERACION' => 40.00,
                    'ESTUDIANTE_CLASE_ID' => $estClaseId
                ]);
            }
        }
    }
}