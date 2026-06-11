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
CREATE OR REPLACE PROCEDURE public.p_inscribir_estudiante_cup(
    p_id_estudiante BIGINT,
    p_id_cup BIGINT,
    p_opcion_1_carrera_cup_id BIGINT,
    p_opcion_2_carrera_cup_id BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estudiante_estado VARCHAR(50);
    v_cup_estado VARCHAR(50);
    v_estudiante_cup_id BIGINT;
BEGIN
    -- Validación 1: Bloqueo de Graduados (Aprobados)
    SELECT "ESTADO" INTO v_estudiante_estado
    FROM "ESTUDIANTE"
    WHERE "ID_ESTUDIANTE" = p_id_estudiante;

    IF v_estudiante_estado = 'APROBADO' THEN
        RAISE EXCEPTION 'Operación denegada. El estudiante ya cuenta con un perfil de admisión APROBADO en el sistema.';
    END IF;

    -- Validación 2: Carreras Duplicadas
    IF p_opcion_1_carrera_cup_id IS NULL OR p_opcion_2_carrera_cup_id IS NULL THEN
        RAISE EXCEPTION 'Operación denegada. Debe seleccionar ambas opciones de carrera.';
    END IF;

    IF p_opcion_1_carrera_cup_id = p_opcion_2_carrera_cup_id THEN
        RAISE EXCEPTION 'La primera y segunda opción de carrera deben ser estrictamente diferentes.';
    END IF;

    -- Validación 3: El CUP no debe estar concluido
    SELECT "ESTADO" INTO v_cup_estado
    FROM "CUP"
    WHERE "ID_CUP" = p_id_cup;

    IF v_cup_estado = 'CONCLUIDO' OR v_cup_estado = 'Concluido' THEN
        RAISE EXCEPTION 'No se pueden registrar inscripciones en un periodo académico concluido.';
    END IF;

    -- Flujo de Inserción / Actualización:
    -- 1. Realizar upsert en ESTUDIANTE_CUP
    SELECT "ID" INTO v_estudiante_cup_id
    FROM "ESTUDIANTE_CUP"
    WHERE "ID_ESTUDIANTE" = p_id_estudiante
      AND "ID_CUP" = p_id_cup;

    IF v_estudiante_cup_id IS NULL THEN
        INSERT INTO "ESTUDIANTE_CUP" ("ID_ESTUDIANTE", "ID_CUP", "FECHA", "ESTADO", "NOTA_FINAL", "CARRERA")
        VALUES (p_id_estudiante, p_id_cup, CURRENT_DATE, 'INSCRITO', 0.00, NULL)
        RETURNING "ID" INTO v_estudiante_cup_id;
    ELSE
        -- 2. Purgar opciones de carrera previas para este CUP
        DELETE FROM "OPCION_CARRERA"
        WHERE "ESTUDIANTE_CUP_ID" = v_estudiante_cup_id;
        
        -- Asegurarnos de que el estado vuelva a ser INSCRITO
        UPDATE "ESTUDIANTE_CUP"
        SET "ESTADO" = 'INSCRITO'
        WHERE "ID" = v_estudiante_cup_id;
    END IF;

    -- 3. Insertar las dos nuevas opciones
    INSERT INTO "OPCION_CARRERA" ("ESTUDIANTE_CUP_ID", "CARRERA_CUP_ID", "OPCION")
    VALUES (v_estudiante_cup_id, p_opcion_1_carrera_cup_id, 1);

    INSERT INTO "OPCION_CARRERA" ("ESTUDIANTE_CUP_ID", "CARRERA_CUP_ID", "OPCION")
    VALUES (v_estudiante_cup_id, p_opcion_2_carrera_cup_id, 2);

    -- 4. Actualizar el ESTADO del alumno a ACTIVO
    UPDATE "ESTUDIANTE"
    SET "ESTADO" = 'ACTIVO'
    WHERE "ID_ESTUDIANTE" = p_id_estudiante;
END;
$$;
SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No hay un down fácil ya que sobrescribimos el procedimiento.
    }
};
