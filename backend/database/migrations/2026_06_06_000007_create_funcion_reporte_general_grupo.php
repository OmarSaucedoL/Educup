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
            CREATE OR REPLACE FUNCTION public.f_reporte_general_grupo(p_id_cup integer)
            RETURNS TABLE (
                id_grupo bigint,
                nombre_grupo varchar,
                turno varchar,
                total_aprobados integer,
                total_reprobados integer,
                promedio_grupo numeric
            )
            LANGUAGE sql
            AS $$
            SELECT
                g."ID_GRUPO"::bigint AS id_grupo,
                g."NOMBRE"::varchar AS nombre_grupo,
                string_agg(DISTINCT UPPER(TRIM(bh."TURNO")), ', ' ORDER BY UPPER(TRIM(bh."TURNO")))::varchar AS turno,
                COUNT(DISTINCT CASE WHEN ec."ESTADO" = 'APROBADO' THEN ec."ESTUDIANTE_CUP_ID" END)::integer AS total_aprobados,
                COUNT(DISTINCT CASE WHEN ec."ESTADO" = 'REPROBADO' THEN ec."ESTUDIANTE_CUP_ID" END)::integer AS total_reprobados,
                ROUND(AVG(ec."NOTA_FINAL"), 2)::numeric(5,2) AS promedio_grupo
            FROM public."CLASE" c
            JOIN public."GRUPO" g ON c."ID_GRUPO" = g."ID_GRUPO"
            JOIN public."BLOQUE_HORARIO" bh ON c."ID_BLOQUE_HORARIO" = bh."ID_BLOQUE_HORARIO"
            LEFT JOIN public."ESTUDIANTES_CLASE" ec ON ec."ID_CLASE" = c."ID_CLASE"
            WHERE c."ID_CUP" = p_id_cup
            GROUP BY
                g."ID_GRUPO",
                g."NOMBRE"
            ORDER BY
                g."NOMBRE";
            $$;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS public.f_reporte_general_grupo(integer);');
    }
};
