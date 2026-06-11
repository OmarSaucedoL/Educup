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
            CREATE OR REPLACE FUNCTION public.f_reporte_general_aceptados(p_id_cup integer)
            RETURNS TABLE (
                carnet varchar,
                nombre_completo varchar,
                carrera_asignada varchar
            )
            LANGUAGE sql
            AS $$
            SELECT
                e."CARNET"::varchar AS carnet,
                -- concat_ws une con espacios y maneja NULLs con gracia, luego limpiamos con TRIM y pasamos a UPPER
                UPPER(TRIM(concat_ws(' ', e."APELLIDO", e."NOMBRE")))::varchar AS nombre_completo,
                ec."CARRERA"::varchar AS carrera_asignada
            FROM public."ESTUDIANTE_CUP" ec
            JOIN public."ESTUDIANTE" e ON ec."ID_ESTUDIANTE" = e."ID_ESTUDIANTE"
            WHERE ec."ID_CUP" = p_id_cup
              AND ec."ESTADO" = 'APROBADO'
            ORDER BY 
                UPPER(TRIM(e."APELLIDO")) ASC, 
                UPPER(TRIM(e."NOMBRE")) ASC;
            $$;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS public.f_reporte_general_aceptados(integer);');
    }
};
