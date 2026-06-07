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
        DB::unprepared(<<<SQL
CREATE OR REPLACE PROCEDURE public.p_asignar_docente_clase(
    p_id_cup bigint,
    p_id_clase bigint,
    p_docente_cup_id bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_materia bigint;
    v_id_bloque bigint;
    v_id_grupo_destino bigint;
    v_materia_nombre varchar;
    v_grupo_nombre varchar;
    v_bloque_turno varchar;
    v_autorizado boolean;
    v_cruce boolean;
    v_total_grupos_asignados integer;
BEGIN
    -- 1. Obtener datos de la clase destino incluyendo su grupo físico
    SELECT c."ID_MATERIA", m."NOMBRE", c."ID_BLOQUE_HORARIO", c."ID_GRUPO", g."NOMBRE", bh."TURNO"
    INTO v_id_materia, v_materia_nombre, v_id_bloque, v_id_grupo_destino, v_grupo_nombre, v_bloque_turno
    FROM public."CLASE" c
    JOIN public."MATERIA" m ON c."ID_MATERIA" = m."ID_MATERIA"
    JOIN public."GRUPO" g ON c."ID_GRUPO" = g."ID_GRUPO"
    JOIN public."BLOQUE_HORARIO" bh ON c."ID_BLOQUE_HORARIO" = bh."ID_BLOQUE_HORARIO"
    WHERE c."ID_CLASE" = p_id_clase AND c."ID_CUP" = p_id_cup;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La clase especificada no existe en el CUP %.', p_id_cup;
    END IF;

    -- 2. Validar que el docente pertenezca al CUP
    IF NOT EXISTS (SELECT 1 FROM public."DOCENTE_CUP" WHERE "ID" = p_docente_cup_id AND "ID_CUP" = p_id_cup) THEN
        RAISE EXCEPTION 'El docente no pertenece a este CUP.';
    END IF;

    -- 3. Validar autorización de materia (Perfil del docente)
    SELECT EXISTS (
        SELECT 1 FROM public."DOCENTE_CUP_MAT" 
        WHERE "DOCENTE_CUP_ID" = p_docente_cup_id 
          AND "MATERIA_ID" = v_id_materia
    ) INTO v_autorizado;

    IF NOT v_autorizado THEN
        RAISE EXCEPTION 'El docente seleccionado no está autorizado para dictar la materia de esta clase (%).', v_materia_nombre;
    END IF;

    -- 4. Validar cruce por hora fija: Un docente no puede estar en dos grupos a la misma hora
    SELECT EXISTS (
        SELECT 1 FROM public."CLASE" c
        WHERE c."ID_CUP" = p_id_cup
          AND c."DOCENTE_CUP_ID" = p_docente_cup_id
          AND c."ID_BLOQUE_HORARIO" = v_id_bloque
          AND c."ID_CLASE" != p_id_clase
    ) INTO v_cruce;

    IF v_cruce THEN
        RAISE EXCEPTION 'El docente ya tiene asignada otra clase en este mismo bloque horario del turno %.', v_bloque_turno;
    END IF;

    -- 4.b Validar el límite máximo de 4 GRUPOS ÚNICOS por docente en el CUP
    SELECT COUNT(DISTINCT c."ID_GRUPO")::integer INTO v_total_grupos_asignados
    FROM public."CLASE" c
    WHERE c."ID_CUP" = p_id_cup
      AND c."DOCENTE_CUP_ID" = p_docente_cup_id
      AND c."ID_CLASE" != p_id_clase; 

    -- Si el docente ya está en 4 grupos diferentes, evaluamos si el grupo de la clase actual es NUEVO para él
    IF v_total_grupos_asignados >= 4 THEN
        -- Si el grupo al que queremos meter la clase NO está en la lista de los grupos que ya dicta el docente, significa que sería su 5to grupo
        IF NOT EXISTS (
            SELECT 1 FROM public."CLASE" c
            WHERE c."ID_CUP" = p_id_cup
              AND c."DOCENTE_CUP_ID" = p_docente_cup_id
              AND c."ID_GRUPO" = v_id_grupo_destino
              AND c."ID_CLASE" != p_id_clase
        ) THEN
            RAISE EXCEPTION 'Operación denegada. El docente ya alcanzó el límite máximo permitido de 4 grupos asignados en este CUP.';
        END IF;
    END IF;

    -- 5. Asignación Exitosa
    UPDATE public."CLASE"
    SET "DOCENTE_CUP_ID" = p_docente_cup_id
    WHERE "ID_CLASE" = p_id_clase;

END;
$$;
SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS public.p_asignar_docente_clase(bigint, bigint, bigint);');
    }
};
