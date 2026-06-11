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
        DB::statement('
            CREATE OR REPLACE FUNCTION public.f_reporte_historico_docente(p_id_docente integer)
            RETURNS TABLE (
                docente varchar,
                grupo varchar,
                materia varchar,
                turno varchar,
                numero_estudiantes bigint,
                nota_promedio numeric,
                cup varchar
            )
            LANGUAGE sql
            AS $$
            SELECT 
                CONCAT(u."NOMBRE", \' \', u."APELLIDO")::varchar AS docente,
                g."NOMBRE"::varchar AS grupo,
                m."NOMBRE"::varchar AS materia,
                bh."TURNO"::varchar AS turno,
                COUNT(ec."ID") AS numero_estudiantes,
                ROUND(AVG(ec."NOTA_FINAL"), 2)::numeric AS nota_promedio,
                CONCAT(cup."ANIO", \' - \', cup."SEMESTRE")::varchar AS cup
            FROM public."CLASE" c
            JOIN public."DOCENTE_CUP" dc ON c."DOCENTE_CUP_ID" = dc."ID"
            JOIN public."USUARIO" u ON dc."CODIGO_DOCENTE" = u."ID"
            JOIN public."GRUPO" g ON c."ID_GRUPO" = g."ID_GRUPO"
            JOIN public."MATERIA" m ON c."ID_MATERIA" = m."ID_MATERIA"
            JOIN public."BLOQUE_HORARIO" bh ON c."ID_BLOQUE_HORARIO" = bh."ID_BLOQUE_HORARIO"
            JOIN public."CUP" cup ON c."ID_CUP" = cup."ID_CUP"
            LEFT JOIN public."ESTUDIANTES_CLASE" ec ON c."ID_CLASE" = ec."ID_CLASE"
            WHERE dc."CODIGO_DOCENTE" = p_id_docente
            GROUP BY 
                u."NOMBRE", u."APELLIDO", g."NOMBRE", m."NOMBRE", bh."TURNO", cup."ANIO", cup."SEMESTRE"
            ORDER BY cup."ANIO" DESC, cup."SEMESTRE" DESC, m."NOMBRE" ASC;
            $$;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS public.f_reporte_historico_docente(integer);');
    }
};
