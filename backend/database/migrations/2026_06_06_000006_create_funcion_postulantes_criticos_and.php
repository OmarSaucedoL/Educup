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
            CREATE OR REPLACE FUNCTION public.f_filtrar_postulantes_criticos_and(
                p_id_cup bigint,
                p_id_materias bigint[],   -- Arreglo de IDs elegidos, ej: '{2, 4}'
                p_nota_maxima numeric     -- Nota límite superior (inclusive), ej: 51
            )
            RETURNS TABLE (
                id BIGINT,
                carnet INT,
                nombre_completo VARCHAR,
                -- Columnas fijas para las notas finales de cada materia
                nota_computacion NUMERIC,  -- ID 1
                nota_matematica NUMERIC,   -- ID 2
                nota_ingles NUMERIC,       -- ID 3
                nota_fisica NUMERIC,       -- ID 4
                nota_final_promedio NUMERIC
            ) AS $$
            BEGIN
                RETURN QUERY
                WITH notas_pivoteadas AS (
                    -- 1. Armamos el boletín completo en columnas para cada estudiante
                    SELECT 
                        ecl."ESTUDIANTE_CUP_ID" as est_cup_id,
                        MAX(CASE WHEN cl."ID_MATERIA" = 1 THEN COALESCE(ecl."NOTA_FINAL", 0.00) END)::NUMERIC as n_com,
                        MAX(CASE WHEN cl."ID_MATERIA" = 2 THEN COALESCE(ecl."NOTA_FINAL", 0.00) END)::NUMERIC as n_mat,
                        MAX(CASE WHEN cl."ID_MATERIA" = 3 THEN COALESCE(ecl."NOTA_FINAL", 0.00) END)::NUMERIC as n_ing,
                        MAX(CASE WHEN cl."ID_MATERIA" = 4 THEN COALESCE(ecl."NOTA_FINAL", 0.00) END)::NUMERIC as n_fis,
                        
                        -- Contamos en cuántas de las materias SELECCIONADAS el alumno tiene nota <= a la máxima
                        COUNT(DISTINCT CASE 
                            WHEN cl."ID_MATERIA" = ANY(p_id_materias) AND COALESCE(ecl."NOTA_FINAL", 0.00) <= p_nota_maxima 
                            THEN cl."ID_MATERIA" 
                        END)::integer as coincidencias_criticas
                    FROM public."ESTUDIANTES_CLASE" ecl
                    JOIN public."CLASE" cl ON ecl."ID_CLASE" = cl."ID_CLASE"
                    WHERE cl."ID_CUP" = p_id_cup
                    GROUP BY ecl."ESTUDIANTE_CUP_ID"
                )
                SELECT 
                    ec."ID" as id,
                    e."CARNET" as carnet,
                    TRIM(CONCAT(e."APELLIDO", ' ', e."NOMBRE"))::VARCHAR as nombre_completo,
                    np.n_com as nota_computacion,
                    np.n_mat as nota_matematica,
                    np.n_ing as nota_ingles,
                    np.n_fis as nota_fisica,
                    ec."NOTA_FINAL"::NUMERIC as nota_final_promedio
                FROM public."ESTUDIANTE_CUP" ec
                JOIN public."ESTUDIANTE" e ON ec."ID_ESTUDIANTE" = e."ID_ESTUDIANTE"
                JOIN notas_pivoteadas np ON ec."ID" = np.est_cup_id
                WHERE ec."ID_CUP" = p_id_cup
                  -- FILTRO AND ESTRICTO: Exige que el alumno esté jodido en TODAS las materias elegidas
                  AND np.coincidencias_criticas = array_length(p_id_materias, 1)
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
        DB::statement('DROP FUNCTION IF EXISTS public.f_filtrar_postulantes_criticos_and(bigint, bigint[], numeric);');
    }
};
