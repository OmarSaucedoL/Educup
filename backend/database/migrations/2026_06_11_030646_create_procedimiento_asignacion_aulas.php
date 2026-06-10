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
            CREATE OR REPLACE PROCEDURE public.p_asignacion_automatica_aulas(p_id_cup integer)
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_estado varchar;
                v_aula_id integer;
                r_grupo RECORD;
            BEGIN
                -- Validar estado del CUP
                SELECT "ESTADO" INTO v_estado FROM public."CUP" WHERE "ID_CUP" = p_id_cup;
                IF v_estado IS NULL THEN
                    RAISE EXCEPTION 'El CUP % no existe.', p_id_cup;
                END IF;
                
                IF v_estado <> 'Inscripciones' THEN
                    RAISE EXCEPTION 'Operación denegada. Solo se pueden asignar aulas automáticamente en la fase de Inscripciones.';
                END IF;

                -- Recorrer todos los grupos y sus turnos en el CUP
                -- Un grupo en un turno debe tener el mismo ID_AULA.
                FOR r_grupo IN (
                    SELECT DISTINCT 
                           c."ID_GRUPO", 
                           bh."TURNO"
                    FROM public."CLASE" c
                    JOIN public."BLOQUE_HORARIO" bh ON c."ID_BLOQUE_HORARIO" = bh."ID_BLOQUE_HORARIO"
                    WHERE c."ID_CUP" = p_id_cup
                ) LOOP
                    -- Buscar un aula disponible para este turno
                    -- El aula NO debe estar ocupada por OTRO grupo en el MISMO turno del MISMO cup
                    SELECT a."ID_AULA" INTO v_aula_id
                    FROM public."AULA" a
                    WHERE a."ESTADO" = 'ACTIVO'
                      AND NOT EXISTS (
                          SELECT 1 
                          FROM public."CLASE" cl2
                          JOIN public."BLOQUE_HORARIO" bh2 ON cl2."ID_BLOQUE_HORARIO" = bh2."ID_BLOQUE_HORARIO"
                          WHERE cl2."ID_AULA" = a."ID_AULA"
                            AND cl2."ID_CUP" = p_id_cup
                            AND bh2."TURNO" = r_grupo."TURNO"
                            AND cl2."ID_GRUPO" <> r_grupo."ID_GRUPO"
                      )
                    ORDER BY a."ID_AULA" ASC
                    LIMIT 1;

                    IF v_aula_id IS NULL THEN
                        RAISE EXCEPTION 'No hay aulas disponibles suficientes para asignar al grupo en el turno %.', r_grupo."TURNO";
                    END IF;

                    -- Asignar el aula a todas las clases de este grupo en este turno
                    UPDATE public."CLASE" c
                    SET "ID_AULA" = v_aula_id
                    FROM public."BLOQUE_HORARIO" bh
                    WHERE c."ID_BLOQUE_HORARIO" = bh."ID_BLOQUE_HORARIO"
                      AND c."ID_CUP" = p_id_cup
                      AND c."ID_GRUPO" = r_grupo."ID_GRUPO"
                      AND bh."TURNO" = r_grupo."TURNO";

                END LOOP;
            END;
            $$;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP PROCEDURE IF EXISTS public.p_asignacion_automatica_aulas(integer);');
    }
};
