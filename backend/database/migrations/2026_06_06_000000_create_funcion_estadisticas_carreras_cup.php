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
            CREATE OR REPLACE FUNCTION public.f_obtener_estadisticas_carreras_cup(p_id_cup bigint)
            RETURNS TABLE (
                carrera_nombre VARCHAR,
                total_postulantes INT,
                opcion_1_postulantes INT,
                opcion_2_postulantes INT
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    c."NOMBRE"::VARCHAR AS carrera_nombre,
                    COUNT(DISTINCT oc."ESTUDIANTE_CUP_ID")::INT AS total_postulantes,
                    COUNT(DISTINCT CASE WHEN oc."OPCION" = 1 THEN oc."ESTUDIANTE_CUP_ID" END)::INT AS opcion_1_postulantes,
                    COUNT(DISTINCT CASE WHEN oc."OPCION" = 2 THEN oc."ESTUDIANTE_CUP_ID" END)::INT AS opcion_2_postulantes
                FROM public."CARRERA_CUP" cc
                JOIN public."CARRERA" c ON cc."ID_CARRERA" = c."ID_CARRERA"
                LEFT JOIN public."OPCION_CARRERA" oc ON oc."CARRERA_CUP_ID" = cc."ID"
                WHERE cc."ID_CUP" = p_id_cup
                GROUP BY c."ID_CARRERA", c."NOMBRE"
                ORDER BY c."NOMBRE" ASC;
            END;
            $$ LANGUAGE plpgsql;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS public.f_obtener_estadisticas_carreras_cup(bigint);');
    }
};
