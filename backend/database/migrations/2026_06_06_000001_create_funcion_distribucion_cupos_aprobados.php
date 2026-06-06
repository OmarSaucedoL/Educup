<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement(<<<SQL
            CREATE OR REPLACE FUNCTION public.f_obtener_distribucion_cupos_aprobados(p_id_cup bigint)
            RETURNS TABLE (
                carrera_nombre VARCHAR,
                ingresados_opcion_1 INT,
                ingresados_opcion_2 INT,
                aprobado_sin_cupo INT,
                cupos_sobrantes INT
            ) AS $$
            BEGIN
                RETURN QUERY
                WITH estudiantes_postulantes AS (
                    -- 1. Consolidamos en una sola fila por estudiante sus dos opciones para este CUP
                    SELECT 
                        ec."ID" as estudiante_cup_id,
                        ec."ESTADO",
                        ec."CARRERA" as carrera_asignada,
                        -- Buscamos el nombre de la carrera de su opción 1
                        (SELECT c."NOMBRE" FROM public."OPCION_CARRERA" oc 
                         JOIN public."CARRERA_CUP" cc ON oc."CARRERA_CUP_ID" = cc."ID"
                         JOIN public."CARRERA" c ON cc."ID_CARRERA" = c."ID_CARRERA"
                         WHERE oc."ESTUDIANTE_CUP_ID" = ec."ID" AND oc."OPCION" = 1) as carrera_opcion_1,
                        -- Buscamos el nombre de la carrera de su opción 2
                        (SELECT c."NOMBRE" FROM public."OPCION_CARRERA" oc 
                         JOIN public."CARRERA_CUP" cc ON oc."CARRERA_CUP_ID" = cc."ID"
                         JOIN public."CARRERA" c ON cc."ID_CARRERA" = c."ID_CARRERA"
                         WHERE oc."ESTUDIANTE_CUP_ID" = ec."ID" AND oc."OPCION" = 2) as carrera_opcion_2
                    FROM public."ESTUDIANTE_CUP" ec
                    WHERE ec."ID_CUP" = p_id_cup
                ),
                metricas_carrera AS (
                    -- 2. Evaluamos la situación de los estudiantes aprobados frente a cada carrera de forma lineal
                    SELECT
                        c.carrera_nombre,
                        -- Estudiantes asignados a esta carrera cuya opción 1 coincide con ella
                        COUNT(CASE WHEN ep.carrera_asignada = c.carrera_nombre AND ep.carrera_opcion_1 = c.carrera_nombre THEN 1 END)::INT as op1,
                        -- Estudiantes asignados a esta carrera cuya opción 2 coincide con ella
                        COUNT(CASE WHEN ep.carrera_asignada = c.carrera_nombre AND ep.carrera_opcion_2 = c.carrera_nombre THEN 1 END)::INT as op2,
                        -- Estudiantes aprobados que NO consiguieron cupo en ninguna carrera, pero su primera prioridad era esta carrera
                        COUNT(CASE WHEN ep."ESTADO" = 'APROBADO' AND ep.carrera_asignada IS NULL AND ep.carrera_opcion_1 = c.carrera_nombre THEN 1 END)::INT as sin_cupo,
                        -- Total real de estudiantes que ingresaron a esta carrera
                        COUNT(CASE WHEN ep.carrera_asignada = c.carrera_nombre THEN 1 END)::INT as total_ingresados
                    FROM (
                        SELECT car."NOMBRE"::VARCHAR as carrera_nombre 
                        FROM public."CARRERA_CUP" ccup
                        JOIN public."CARRERA" car ON ccup."ID_CARRERA" = car."ID_CARRERA"
                        WHERE ccup."ID_CUP" = p_id_cup
                    ) c
                    LEFT JOIN estudiantes_postulantes ep ON (ep.carrera_opcion_1 = c.carrera_nombre OR ep.carrera_opcion_2 = c.carrera_nombre OR ep.carrera_asignada = c.carrera_nombre)
                    GROUP BY c.carrera_nombre
                )
                -- 3. Cruzamos con CARRERA_CUP para contrastar con los cupos totales ofertados
                SELECT 
                    m.carrera_nombre,
                    m.op1 as ingresados_opcion_1,
                    m.op2 as ingresados_opcion_2,
                    m.sin_cupo as aprobado_sin_cupo,
                    GREATEST(0, cc."CUPOS" - m.total_ingresados)::INT as cupos_sobrantes
                FROM public."CARRERA_CUP" cc
                JOIN public."CARRERA" c ON cc."ID_CARRERA" = c."ID_CARRERA"
                JOIN metricas_carrera m ON c."NOMBRE" = m.carrera_nombre
                WHERE cc."ID_CUP" = p_id_cup
                ORDER BY m.carrera_nombre ASC;
            END;
            $$ LANGUAGE plpgsql;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS public.f_obtener_distribucion_cupos_aprobados(bigint);');
    }
};
