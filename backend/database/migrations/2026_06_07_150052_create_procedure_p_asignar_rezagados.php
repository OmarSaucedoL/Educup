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
CREATE OR REPLACE PROCEDURE public.p_asignar_rezagados(
    p_id_cup bigint,
    INOUT p_asignados integer DEFAULT 0,
    INOUT p_sin_cupo integer DEFAULT 0
)
LANGUAGE plpgsql
AS $$
DECLARE
    r_estudiante RECORD;
    v_id_grupo   bigint;
    v_clases_ids bigint[];
BEGIN
    p_asignados := 0;
    p_sin_cupo := 0;

    -- 1. Obtener el estado inicial de los grupos del CUP, midiendo cuántos alumnos ya tienen
    CREATE TEMP TABLE _cupos_grupos ON COMMIT DROP AS
    SELECT 
        g."ID_GRUPO",
        g."EST_MAX",
        -- Cantidad de alumnos actuales en el grupo
        COALESCE(
            (
                SELECT COUNT(DISTINCT ecl."ESTUDIANTE_CUP_ID")
                FROM public."CLASE" c
                JOIN public."ESTUDIANTES_CLASE" ecl ON c."ID_CLASE" = ecl."ID_CLASE"
                WHERE c."ID_GRUPO" = g."ID_GRUPO"
                  AND c."ID_CUP" = p_id_cup
            ), 0
        )::integer AS alumnos_actuales,
        -- Cupos libres que le quedan al grupo antes de colapsar (EST_MAX - actuales)
        (g."EST_MAX" - COALESCE(
            (
                SELECT COUNT(DISTINCT ecl."ESTUDIANTE_CUP_ID")
                FROM public."CLASE" c
                JOIN public."ESTUDIANTES_CLASE" ecl ON c."ID_CLASE" = ecl."ID_CLASE"
                WHERE c."ID_GRUPO" = g."ID_GRUPO"
                  AND c."ID_CUP" = p_id_cup
            ), 0
        ))::integer AS disponibles,
        -- El paquete de sus 4 clases académicas
        (
            SELECT ARRAY_AGG(c."ID_CLASE" ORDER BY c."ID_CLASE")::bigint[]
            FROM public."CLASE" c
            WHERE c."ID_GRUPO" = g."ID_GRUPO"
              AND c."ID_CUP" = p_id_cup
        ) AS clases_ids
    FROM public."GRUPO" g
    WHERE EXISTS (
        SELECT 1 FROM public."CLASE" cl 
        WHERE cl."ID_GRUPO" = g."ID_GRUPO" AND cl."ID_CUP" = p_id_cup
    );

    -- Índice único para que los UPDATE dentro del bucle vuelen
    CREATE UNIQUE INDEX idx_temp_rezagados_equitativos ON _cupos_grupos ("ID_GRUPO");

    -- 2. Recorremos los alumnos inscritos sin clases asignadas (por orden de llegada)
    FOR r_estudiante IN
        SELECT ec."ID" AS estudiante_cup_id
        FROM public."ESTUDIANTE_CUP" ec
        WHERE ec."ID_CUP" = p_id_cup
          AND ec."ESTADO" = 'INSCRITO'
          AND NOT EXISTS (
              SELECT 1 FROM public."ESTUDIANTES_CLASE" ecl
              WHERE ecl."ESTUDIANTE_CUP_ID" = ec."ID"
          )
        ORDER BY ec."ID" ASC
    LOOP
        
        -- 3. CLAVE: Buscamos el grupo que tenga cupos disponibles, pero PRIORIZANDO
        -- al que tenga MENOS alumnos inscritos en este instante (alumnos_actuales ASC)
        SELECT "ID_GRUPO", clases_ids 
        INTO v_id_grupo, v_clases_ids
        FROM _cupos_grupos
        WHERE disponibles > 0
        ORDER BY alumnos_actuales ASC, "ID_GRUPO" ASC
        LIMIT 1;

        -- 4. Si encontramos un grupo con vacantes, hacemos el reparto
        IF v_id_grupo IS NOT NULL THEN
            
            -- Insertamos masivamente al estudiante a las 4 clases de ese grupo
            INSERT INTO public."ESTUDIANTES_CLASE" ("ESTUDIANTE_CUP_ID", "ID_CLASE", "ESTADO", "FECHA_CREACION")
            SELECT r_estudiante.estudiante_cup_id, id_clase, 'CURSANDO'::varchar, CURRENT_TIMESTAMP
            FROM UNNEST(v_clases_ids) AS id_clase;

            -- Actualizamos la tabla temporal INMEDIATAMENTE para alterar el orden de la siguiente vuelta
            UPDATE _cupos_grupos 
            SET alumnos_actuales = alumnos_actuales + 1,
                disponibles = disponibles - 1 
            WHERE "ID_GRUPO" = v_id_grupo;

            p_asignados := p_asignados + 1;
            
            -- Limpieza de variables para el siguiente estudiante
            v_id_grupo := NULL;
            v_clases_ids := NULL;
        ELSE
            -- Si ya de plano ningún grupo tiene cupos libres, se cuenta como sin cupo
            p_sin_cupo := p_sin_cupo + 1;
        END IF;

    END LOOP;

    -- Destruimos la tabla temporal al finalizar de procesar todo el lote
    DROP TABLE IF EXISTS _cupos_grupos;
END;
$$;
SQL
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP PROCEDURE IF EXISTS public.p_asignar_rezagados(bigint, integer, integer);');
    }
};
