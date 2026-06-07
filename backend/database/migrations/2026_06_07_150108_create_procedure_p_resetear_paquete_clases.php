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
CREATE OR REPLACE PROCEDURE public.p_resetear_paquete_clases(
    p_id_cup bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_cup varchar;
    v_grupos_ids bigint[];
BEGIN
    -- 1. Validar el estado del CUP (Uso defensivo de mayúsculas y espacios)
    SELECT UPPER(TRIM("ESTADO")) INTO v_estado_cup
    FROM public."CUP"
    WHERE "ID_CUP" = p_id_cup;

    IF v_estado_cup IS DISTINCT FROM 'INSCRIPCIONES' THEN
        RAISE EXCEPTION 'Operación denegada. Solo se pueden resetear los grupos de un CUP en estado "INSCRIPCIONES". Estado actual: %', COALESCE(v_estado_cup, 'N/A');
    END IF;

    -- 2. Recolectar los IDs de los grupos asociados a este CUP antes de borrar las clases
    SELECT ARRAY_AGG(DISTINCT "ID_GRUPO") INTO v_grupos_ids
    FROM public."CLASE"
    WHERE "ID_CUP" = p_id_cup;

    -- 3. Borrado controlado en orden inverso de dependencias
    -- Si no hay grupos o clases, saltamos el borrado sin romper el proceso con excepciones
    IF v_grupos_ids IS NOT NULL AND ARRAY_LENGTH(v_grupos_ids, 1) > 0 THEN
        
        -- A. Borrar asignaciones de estudiantes a clases (ESTUDIANTES_CLASE)
        DELETE FROM public."ESTUDIANTES_CLASE"
        WHERE "ID_CLASE" IN (
            SELECT "ID_CLASE" FROM public."CLASE" WHERE "ID_CUP" = p_id_cup
        );

        -- B. Borrar las clases académicas del periodo
        DELETE FROM public."CLASE"
        WHERE "ID_CUP" = p_id_cup;

        -- C. Borrar los grupos físicos creados para este CUP
        DELETE FROM public."GRUPO"
        WHERE "ID_GRUPO" = ANY(v_grupos_ids);
        
    END IF;

    -- 4. Restablecer el estado y limpiar carreras asignadas de los estudiantes del CUP
    -- Esto garantiza que vuelvan a la bolsa de alumnos pendientes de procesamiento de clases
    UPDATE public."ESTUDIANTE_CUP"
    SET "ESTADO" = 'INSCRITO'::varchar,
        "CARRERA" = NULL
    WHERE "ID_CUP" = p_id_cup;

    RAISE NOTICE 'El paquete de clases, grupos y asignaciones del CUP % ha sido reseteado con éxito.', p_id_cup;
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
        DB::statement('DROP PROCEDURE IF EXISTS public.p_resetear_paquete_clases(bigint);');
    }
};
