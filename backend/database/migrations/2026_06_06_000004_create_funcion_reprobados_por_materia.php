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
            CREATE OR REPLACE FUNCTION public.f_obtener_reprobados_por_materia(p_id_cup bigint)
            RETURNS TABLE (
                materia_nombre VARCHAR,
                cantidad_reprobados INT
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    m."NOMBRE"::VARCHAR AS materia_nombre,
                    -- Contamos los estudiantes únicos en estado REPROBADO para esta materia específica
                    COUNT(DISTINCT ecl."ESTUDIANTE_CUP_ID")::INTEGER AS cantidad_reprobados
                FROM public."MATERIA_CUP" mc
                JOIN public."MATERIA" m ON mc."ID_MATERIA" = m."ID_MATERIA"
                -- Unimos con CLASE asegurando la coincidencia exacta de Materia y CUP de forma indexada
                LEFT JOIN public."CLASE" c ON c."ID_MATERIA" = mc."ID_MATERIA" AND c."ID_CUP" = mc."ID_CUP"
                -- Filtramos las inscripciones que terminaron con nota de reprobación
                LEFT JOIN public."ESTUDIANTES_CLASE" ecl ON ecl."ID_CLASE" = c."ID_CLASE" AND ecl."ESTADO" = 'REPROBADO'
                WHERE mc."ID_CUP" = p_id_cup
                GROUP BY m."ID_MATERIA", m."NOMBRE"
                ORDER BY m."NOMBRE" ASC;
            END;
            $$ LANGUAGE plpgsql;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS public.f_obtener_reprobados_por_materia(bigint);');
    }
};
