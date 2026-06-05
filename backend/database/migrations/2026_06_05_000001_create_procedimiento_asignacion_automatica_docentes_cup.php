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
CREATE OR REPLACE PROCEDURE public.p_asignacion_automatica_docentes_cup(p_id_cup bigint)
LANGUAGE plpgsql
AS $$
DECLARE
    r_clase RECORD;
    r_docente RECORD;
    
    v_materia_en_turno integer;
    v_asignado boolean;
    v_clases_procesadas integer := 0;
    v_clases_asignadas integer := 0;
BEGIN
    RAISE NOTICE 'Iniciando proceso de asignación automática con afinidad de grupo para el CUP ID: %', p_id_cup;

    -- 1. Recorrer cada clase vacía en el CUP
    FOR r_clase IN 
        SELECT c."ID_CLASE", c."ID_MATERIA", c."ID_GRUPO", UPPER(TRIM(bh."TURNO")) as turno
        FROM public."CLASE" c
        JOIN public."BLOQUE_HORARIO" bh ON c."ID_BLOQUE_HORARIO" = bh."ID_BLOQUE_HORARIO"
        WHERE c."ID_CUP" = p_id_cup 
          AND c."DOCENTE_CUP_ID" IS NULL
        ORDER BY c."ID_MATERIA", c."ID_GRUPO"
    LOOP
        v_clases_procesadas := v_clases_procesadas + 1;
        v_asignado := FALSE;

        -- 2. Buscar docentes con perfil. 
        -- Traemos la carga total y evaluamos la afinidad del grupo usando agregación limpia en el LEFT JOIN
        FOR r_docente IN 
            SELECT 
                dc."ID" as docente_cup_id,
                COALESCE(workload.cant_grupos, 0)::integer as carga_inicial,
                -- Si la subconsulta detectó que el ID_GRUPO actual está en el historial del docente, prioridad = 0 (Máxima)
                (CASE WHEN r_clase."ID_GRUPO" = ANY(workload.grupos_asignados) THEN 0 ELSE 1 END) as prioridad_grupo
            FROM public."DOCENTE_CUP_MAT" dcm
            JOIN public."DOCENTE_CUP" dc ON dcm."DOCENTE_CUP_ID" = dc."ID"
            LEFT JOIN (
                -- Consolidamos la carga de trabajo y el array de grupos del docente en una sola pasada por la tabla CLASE
                SELECT 
                    c2."DOCENTE_CUP_ID", 
                    COUNT(DISTINCT c2."ID_GRUPO") as cant_grupos,
                    array_agg(DISTINCT c2."ID_GRUPO") as grupos_asignados
                FROM public."CLASE" c2
                WHERE c2."ID_CUP" = p_id_cup AND c2."DOCENTE_CUP_ID" IS NOT NULL
                GROUP BY c2."DOCENTE_CUP_ID"
            ) workload ON dc."ID" = workload."DOCENTE_CUP_ID"
            WHERE dcm."MATERIA_ID" = r_clase."ID_MATERIA" 
              AND dc."ID_CUP" = p_id_cup
            ORDER BY 
                (CASE WHEN r_clase."ID_GRUPO" = ANY(workload.grupos_asignados) THEN 0 ELSE 1 END) ASC, 
                COALESCE(workload.cant_grupos, 0) ASC, 
                RANDOM()
        LOOP
            
            -- -----------------------------------------------------------------
            -- REGLA 1: Máximo una vez por turno para la misma materia
            -- -----------------------------------------------------------------
            SELECT COUNT(*)::integer INTO v_materia_en_turno
            FROM public."CLASE" c
            JOIN public."BLOQUE_HORARIO" bh ON c."ID_BLOQUE_HORARIO" = bh."ID_BLOQUE_HORARIO"
            WHERE c."DOCENTE_CUP_ID" = r_docente.docente_cup_id
              AND c."ID_CUP" = p_id_cup
              AND c."ID_MATERIA" = r_clase."ID_MATERIA"
              AND UPPER(TRIM(bh."TURNO")) = r_clase.turno;

            IF v_materia_en_turno > 0 THEN
                CONTINUE;
            END IF;

            -- -----------------------------------------------------------------
            -- REGLA 2: Límite máximo de 4 grupos por docente en este CUP
            -- -----------------------------------------------------------------
            -- Si ya tiene 4 o más grupos y no es un grupo en el que ya trabaje, saltamos.
            IF r_docente.carga_inicial >= 4 AND r_docente.prioridad_grupo = 1 THEN
                CONTINUE; 
            END IF;

            -- -----------------------------------------------------------------
            -- ASIGNACIÓN EFECTIVA
            -- -----------------------------------------------------------------
            UPDATE public."CLASE"
            SET "DOCENTE_CUP_ID" = r_docente.docente_cup_id
            WHERE "ID_CLASE" = r_clase."ID_CLASE";

            v_clases_asignadas := v_clases_asignadas + 1;
            v_asignado := TRUE;
            EXIT;
        END LOOP;

        IF NOT v_asignado THEN
            RAISE WARNING 'Aviso: No hay docentes disponibles para la Clase ID: % (Materia ID: %, Grupo ID: %) en el turno %', 
                r_clase."ID_CLASE", r_clase."ID_MATERIA", r_clase."ID_GRUPO", r_clase.turno;
        END IF;

    END LOOP;

    RAISE NOTICE 'Asignación masiva finalizada.';
    RAISE NOTICE 'Clases sin docente procesadas: %', v_clases_procesadas;
    RAISE NOTICE 'Clases asignadas exitosamente: %', v_clases_asignadas;
END;
$$;
SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP PROCEDURE IF EXISTS public.p_asignacion_automatica_docentes_cup(bigint);');
    }
};
