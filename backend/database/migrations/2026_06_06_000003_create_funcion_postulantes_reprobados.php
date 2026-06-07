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
            CREATE OR REPLACE FUNCTION public.f_obtener_postulantes_reprobados(p_id_cup bigint)
            RETURNS TABLE (
                id BIGINT,
                carnet INT,
                nombre_completo VARCHAR,
                colegio VARCHAR,
                ciudad VARCHAR,
                opcion_1 VARCHAR,
                opcion_2 VARCHAR,
                nota_final NUMERIC,
                notas_materias JSONB
            ) AS $$
            BEGIN
                RETURN QUERY
                WITH opciones AS (
                    SELECT 
                        ec."ID" as est_cup_id,
                        (SELECT c."NOMBRE"::VARCHAR FROM public."OPCION_CARRERA" oc 
                         JOIN public."CARRERA_CUP" cc ON oc."CARRERA_CUP_ID" = cc."ID"
                         JOIN public."CARRERA" c ON cc."ID_CARRERA" = c."ID_CARRERA"
                         WHERE oc."ESTUDIANTE_CUP_ID" = ec."ID" AND oc."OPCION" = 1) as carrera_opcion_1,
                        (SELECT c."NOMBRE"::VARCHAR FROM public."OPCION_CARRERA" oc 
                         JOIN public."CARRERA_CUP" cc ON oc."CARRERA_CUP_ID" = cc."ID"
                         JOIN public."CARRERA" c ON cc."ID_CARRERA" = c."ID_CARRERA"
                         WHERE oc."ESTUDIANTE_CUP_ID" = ec."ID" AND oc."OPCION" = 2) as carrera_opcion_2
                    FROM public."ESTUDIANTE_CUP" ec
                    WHERE ec."ID_CUP" = p_id_cup AND ec."ESTADO" = 'REPROBADO'
                ),
                calificaciones_est AS (
                    SELECT 
                        ecl."ESTUDIANTE_CUP_ID" as est_cup_id,
                        jsonb_agg(
                            jsonb_build_object(
                                'materia', m."NOMBRE",
                                'materia_sigla', '',
                                'nota_final', ecl."NOTA_FINAL",
                                'estado', ecl."ESTADO"
                            )
                        ) as notas_arr
                    FROM public."ESTUDIANTES_CLASE" ecl
                    JOIN public."CLASE" cl ON ecl."ID_CLASE" = cl."ID_CLASE"
                    JOIN public."MATERIA" m ON cl."ID_MATERIA" = m."ID_MATERIA"
                    GROUP BY ecl."ESTUDIANTE_CUP_ID"
                )
                SELECT 
                    ec."ID" as id,
                    e."CARNET" as carnet,
                    TRIM(CONCAT(e."APELLIDO", ' ', e."NOMBRE"))::VARCHAR as nombre_completo,
                    col."NOMBRE"::VARCHAR as colegio,
                    ciu."NOMBRE"::VARCHAR as ciudad,
                    COALESCE(o.carrera_opcion_1, 'Sin seleccionar')::VARCHAR as opcion_1,
                    COALESCE(o.carrera_opcion_2, 'Sin seleccionar')::VARCHAR as opcion_2,
                    ec."NOTA_FINAL"::NUMERIC as nota_final,
                    COALESCE(c.notas_arr, '[]'::jsonb) as notas_materias
                FROM public."ESTUDIANTE_CUP" ec
                JOIN public."ESTUDIANTE" e ON ec."ID_ESTUDIANTE" = e."ID_ESTUDIANTE"
                LEFT JOIN public."COLEGIO" col ON e."COLEGIO_ID" = col."ID"
                LEFT JOIN public."CIUDAD" ciu ON e."CIUDAD_ID" = ciu."ID"
                LEFT JOIN opciones o ON ec."ID" = o.est_cup_id
                LEFT JOIN calificaciones_est c ON ec."ID" = c.est_cup_id
                WHERE ec."ID_CUP" = p_id_cup AND ec."ESTADO" = 'REPROBADO'
                ORDER BY e."APELLIDO" ASC, e."NOMBRE" ASC;
            END;
            $$ LANGUAGE plpgsql;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS public.f_obtener_postulantes_reprobados(bigint);');
    }
};
