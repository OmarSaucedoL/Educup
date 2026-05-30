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
        DB::table('ROL')->truncate();

        Schema::enableForeignKeyConstraints();

        // ==========================================
        // 1. CONTROL DE ACCESO, ROLES Y SEGURIDAD
        // ==========================================
        $rolAdmin = DB::table('ROL')->insertGetId(['NOMBRE' => 'ADMINISTRADOR'], 'ID');
        $rolDocente = DB::table('ROL')->insertGetId(['NOMBRE' => 'DOCENTE'], 'ID');

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

        // Generación de 10 Docentes con la estructura de cuentas DOCENTE_1 a DOCENTE_10
        $docenteUserIds = [];
        for ($i = 1; $i <= 10; $i++) {
            $uDocId = DB::table('USUARIO')->insertGetId([
                'USERNAME' => "DOCENTE_{$i}",
                'CONTRASENIA' => Hash::make('Docente123/*'),
                'CARNET' => 4567890 + $i,
                'NOMBRE' => "DOCENTE {$i}",
                'APELLIDO' => "APELLIDO {$i}",
                'CORREO' => "docente{$i}@uagrm.edu.bo",
                'ESTADO' => 'ACTIVO',
                'FECHA_CREACION' => Carbon::now(),
                'ROL_ID' => $rolDocente
            ], 'ID');
            $docenteUserIds[] = $uDocId;

            // Extensión a la tabla semántica DOCENTE
            DB::table('DOCENTE')->insert(['CODIGO_DOCENTE' => $uDocId]);
        }

        // ==========================================
        // 2. CONFIGURACIÓN DE CATÁLOGOS BASE Y CATASTRO
        // ==========================================
        $carreras = [
            'INGENIERIA EN SISTEMAS',
            'INGENIERIA INFORMATICA',
            'INGENIERIA EN REDES',
            'LICENCIATURA EN TELECOMUNICACIONES'
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
                'SEMESTRE' => 'PRIMER SEMESTRE',
                'FECHA_INICIO' => '2024-01-15',
                'FECHA_FIN' => '2024-06-20',
            ],
            [
                'ANIO' => 2024,
                'SEMESTRE' => 'SEGUNDO SEMESTRE',
                'FECHA_INICIO' => '2024-07-15',
                'FECHA_FIN' => '2024-12-20',
            ],
            [
                'ANIO' => 2025,
                'SEMESTRE' => 'PRIMER SEMESTRE',
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
            $nroSem = str_contains(strtoupper($cConf['SEMESTRE']), 'PRIMER') ? '1' : '2';
            
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
            $ccTel = DB::table('CARRERA_CUP')->where(['ID_CUP' => $cupId, 'ID_CARRERA' => $carreraIds['LICENCIATURA EN TELECOMUNICACIONES']])->first()->ID;

            DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $ccRedes, 'OPCION' => 1]);
            DB::table('OPCION_CARRERA')->insert(['ESTUDIANTE_CUP_ID' => $eCupId, 'CARRERA_CUP_ID' => $ccTel, 'OPCION' => 2]);

            $gradesList = $generateSubjectGrades($notaFinal, 4);
            $seedGradesForEnrollment($eCupId, $cupId, $gradesList);
        }
    }
}