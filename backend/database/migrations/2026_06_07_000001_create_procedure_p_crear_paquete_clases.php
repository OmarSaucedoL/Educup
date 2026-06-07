<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement(<<<'SQL'
            CREATE OR REPLACE PROCEDURE public.p_crear_paquete_clases(
                p_id_cup            bigint,
                p_est_min           integer,
                p_est_max           integer,
                p_turnos            text[],
                INOUT p_grupos_creados integer DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_inscritos         integer;
                v_total_grupos      integer;
                v_sobrantes         integer;
                v_num_turnos        integer;
                v_grupos_existentes integer;
                v_anio              integer;
                v_semestre          integer;
                v_prefijo           text;
                v_nombre_grupo      text;
                v_turno_nombre      text;
                v_id_grupo          bigint;
                v_materias          bigint[];
                v_bloques           bigint[];
                v_id_clase          bigint;
                v_clases_ids        bigint[];
                v_j                 integer;
                v_i                 integer;
            BEGIN
                -- 1. Estudiantes inscritos sin clase asignada
                SELECT COUNT(*)::integer INTO v_inscritos
                FROM public."ESTUDIANTE_CUP" ec
                WHERE ec."ID_CUP"  = p_id_cup
                  AND ec."ESTADO"  = 'INSCRITO'
                  AND NOT EXISTS (
                      SELECT 1 FROM public."ESTUDIANTES_CLASE" ecl
                      WHERE ecl."ESTUDIANTE_CUP_ID" = ec."ID"
                  );

                IF v_inscritos = 0 THEN
                    RAISE EXCEPTION 'No hay estudiantes inscritos sin asignar clases.';
                END IF;

                -- 2. Verificar exactamente 4 materias en el CUP
                IF (SELECT COUNT(*) FROM public."MATERIA_CUP" WHERE "ID_CUP" = p_id_cup) <> 4 THEN
                    RAISE EXCEPTION 'El CUP no tiene exactamente 4 materias asignadas.';
                END IF;

                -- 3. Calcular número de grupos (lógica balanceada)
                v_total_grupos := FLOOR(v_inscritos::NUMERIC / p_est_max);
                v_sobrantes    := v_inscritos % p_est_max;

                IF v_sobrantes >= p_est_min THEN
                    v_total_grupos := v_total_grupos + 1;
                END IF;

                IF v_total_grupos = 0 THEN
                    v_total_grupos := 1;
                END IF;

                -- 4. Prefijo de nombre de grupo (ej: "261" → año 2026, semestre 1)
                SELECT "ANIO", "SEMESTRE" INTO v_anio, v_semestre
                FROM public."CUP" WHERE "ID_CUP" = p_id_cup;

                v_prefijo := RIGHT(v_anio::TEXT, 2) || v_semestre::TEXT;

                SELECT COUNT(*)::integer INTO v_grupos_existentes
                FROM public."GRUPO" WHERE "NOMBRE" LIKE v_prefijo || '%';

                -- 5. IDs de materias del CUP
                SELECT ARRAY_AGG("ID_MATERIA" ORDER BY "ID_MATERIA") INTO v_materias
                FROM public."MATERIA_CUP" WHERE "ID_CUP" = p_id_cup;

                v_num_turnos := ARRAY_LENGTH(p_turnos, 1);

                -- 6. Tabla temporal: distribuir estudiantes con NTILE
                CREATE TEMP TABLE _paquete_estudiantes ON COMMIT DROP AS
                SELECT
                    ec."ID" AS estudiante_cup_id,
                    NTILE(v_total_grupos) OVER (ORDER BY ec."ID") AS grupo_idx
                FROM public."ESTUDIANTE_CUP" ec
                WHERE ec."ID_CUP" = p_id_cup
                  AND ec."ESTADO" = 'INSCRITO'
                  AND NOT EXISTS (
                      SELECT 1 FROM public."ESTUDIANTES_CLASE" ecl
                      WHERE ecl."ESTUDIANTE_CUP_ID" = ec."ID"
                  );

                -- 7. Loop Round-Robin por cada grupo
                FOR v_i IN 1..v_total_grupos LOOP
                    v_turno_nombre := p_turnos[((v_i - 1) % v_num_turnos) + 1];
                    v_nombre_grupo := v_prefijo || (v_grupos_existentes + v_i)::TEXT;

                    -- Crear el grupo físico
                    INSERT INTO public."GRUPO" ("NOMBRE", "EST_MIN", "EST_MAX")
                    VALUES (v_nombre_grupo, p_est_min, p_est_max)
                    RETURNING "ID_GRUPO" INTO v_id_grupo;

                    -- Obtener los 4 bloques horarios del turno (orden determinista)
                    SELECT ARRAY_AGG("ID_BLOQUE_HORARIO" ORDER BY "ID_BLOQUE_HORARIO")
                    INTO v_bloques
                    FROM (
                        SELECT "ID_BLOQUE_HORARIO"
                        FROM public."BLOQUE_HORARIO"
                        WHERE UPPER(TRIM("TURNO")) = UPPER(TRIM(v_turno_nombre))
                        ORDER BY "ID_BLOQUE_HORARIO" ASC
                        LIMIT 4
                    ) bh;

                    IF ARRAY_LENGTH(v_bloques, 1) IS NULL OR ARRAY_LENGTH(v_bloques, 1) < 4 THEN
                        RAISE EXCEPTION 'No hay suficientes bloques (mínimo 4) para el turno: %', v_turno_nombre;
                    END IF;

                    -- Crear las 4 clases del paquete académico
                    v_clases_ids := ARRAY[]::bigint[];
                    FOR v_j IN 1..4 LOOP
                        INSERT INTO public."CLASE" ("ID_CUP", "ID_MATERIA", "ID_BLOQUE_HORARIO", "ID_GRUPO", "DOCENTE_CUP_ID", "ID_AULA")
                        VALUES (p_id_cup, v_materias[v_j], v_bloques[v_j], v_id_grupo, NULL, NULL)
                        RETURNING "ID_CLASE" INTO v_id_clase;

                        v_clases_ids := v_clases_ids || v_id_clase;
                    END LOOP;

                    -- Inserción masiva: cada estudiante del subconjunto → 4 clases
                    INSERT INTO public."ESTUDIANTES_CLASE" ("ESTUDIANTE_CUP_ID", "ID_CLASE", "ESTADO", "FECHA_CREACION")
                    SELECT
                        pe.estudiante_cup_id,
                        c.id_clase,
                        'CURSANDO'::varchar,
                        CURRENT_TIMESTAMP
                    FROM _paquete_estudiantes pe
                    CROSS JOIN UNNEST(v_clases_ids) AS c(id_clase)
                    WHERE pe.grupo_idx = v_i;

                END LOOP;

                -- Asignar valor de salida
                p_grupos_creados := v_total_grupos;

                -- Limpieza preventiva (doble protección con ON COMMIT DROP)
                DROP TABLE IF EXISTS _paquete_estudiantes;
            END;
            $$;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP PROCEDURE IF EXISTS public.p_crear_paquete_clases(bigint, integer, integer, text[], integer);');
    }
};
