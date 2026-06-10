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
        DB::statement(<<<'SQL'
            CREATE OR REPLACE FUNCTION public.f_reporte_general_docente(p_id_cup integer)
            RETURNS TABLE (
                codigo_docente bigint,
                nombre_docente varchar,
                clases_dadas integer,
                grupos_asignados integer,
                materias_dadas varchar,
                total_estudiantes integer,
                total_aprobados integer,
                total_reprobados integer,
                promedio_por_materia varchar
            )
            LANGUAGE sql
            AS $$
            SELECT
                dc."CODIGO_DOCENTE"::bigint AS codigo_docente,
                UPPER(TRIM(u."NOMBRE"))::varchar AS nombre_docente,
                COUNT(DISTINCT c."ID_CLASE")::integer AS clases_dadas,
                COUNT(DISTINCT c."ID_GRUPO")::integer AS grupos_asignados,
                string_agg(DISTINCT m."NOMBRE", ', ' ORDER BY m."NOMBRE")::varchar AS materias_dadas,
                
                -- Cuenta al estudiante por cada clase diferente (permite repetidos en clases distintas)
                COUNT(DISTINCT c."ID_CLASE" || '-' || ec."ESTUDIANTE_CUP_ID")::integer AS total_estudiantes,
                
                -- Lo mismo para aprobados y reprobados
                COUNT(DISTINCT CASE WHEN ec."ESTADO" = 'APROBADO' THEN c."ID_CLASE" || '-' || ec."ESTUDIANTE_CUP_ID" END)::integer AS total_aprobados,
                COUNT(DISTINCT CASE WHEN ec."ESTADO" = 'REPROBADO' THEN c."ID_CLASE" || '-' || ec."ESTUDIANTE_CUP_ID" END)::integer AS total_reprobados,
                
                (
                    SELECT string_agg(
                        materia_info,
                        ', ' ORDER BY materia_nombre
                    )::varchar
                    FROM (
                        SELECT
                            m2."NOMBRE" AS materia_nombre,
                            m2."NOMBRE" || ' (' || ROUND(COALESCE(AVG(ec2."NOTA_FINAL"), 0), 2)::text || ')' AS materia_info
                        FROM public."CLASE" c2
                        JOIN public."MATERIA" m2 ON c2."ID_MATERIA" = m2."ID_MATERIA"
                        LEFT JOIN public."ESTUDIANTES_CLASE" ec2 ON ec2."ID_CLASE" = c2."ID_CLASE"
                        WHERE c2."DOCENTE_CUP_ID" = dc."ID"
                          AND c2."ID_CUP" = p_id_cup
                        GROUP BY m2."NOMBRE"
                    ) AS materia_promedios
                ) AS promedio_por_materia
            FROM public."CLASE" c
            JOIN public."DOCENTE_CUP" dc ON c."DOCENTE_CUP_ID" = dc."ID"
            LEFT JOIN public."DOCENTE" d ON dc."CODIGO_DOCENTE" = d."CODIGO_DOCENTE"
            LEFT JOIN public."USUARIO" u ON d."CODIGO_DOCENTE" = u."ID"
            LEFT JOIN public."MATERIA" m ON c."ID_MATERIA" = m."ID_MATERIA"
            LEFT JOIN public."ESTUDIANTES_CLASE" ec ON ec."ID_CLASE" = c."ID_CLASE"
            WHERE c."ID_CUP" = p_id_cup
            GROUP BY
                dc."ID",
                dc."CODIGO_DOCENTE",
                u."NOMBRE"
            ORDER BY
                u."NOMBRE";
            $$;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS public.f_reporte_general_docente(integer);');
    }
};
