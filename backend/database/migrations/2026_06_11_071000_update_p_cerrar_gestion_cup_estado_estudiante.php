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
CREATE OR REPLACE PROCEDURE public.p_cerrar_gestion_cup(p_id_cup INT)
LANGUAGE plpgsql
AS $$
DECLARE
    r_estudiante RECORD;
    r_opcion RECORD;
BEGIN
    -- 1. Limpiamos asignaciones previas de este CUP
    UPDATE public."ESTUDIANTE_CUP"
    SET "CARRERA" = NULL
    WHERE "ID_CUP" = p_id_cup;

    -- 2. Estructura en memoria con ON COMMIT DROP (Evita el error de tabla ya existente)
    CREATE TEMPORARY TABLE temp_cupos_carrera ON COMMIT DROP AS
    SELECT cc."ID" AS carrera_cup_id, c."NOMBRE" AS carrera_nombre, cc."CUPOS" AS cupos_libres
    FROM public."CARRERA_CUP" cc
    JOIN public."CARRERA" c ON cc."ID_CARRERA" = c."ID_CARRERA"
    WHERE cc."ID_CUP" = p_id_cup;

    -- Índice único para búsquedas y actualizaciones instantáneas (O(1))
    CREATE UNIQUE INDEX idx_temp_cupos ON temp_cupos_carrera (carrera_cup_id);

    -- 3. Recorremos a los estudiantes APROBADOS en estricto orden de mérito
    FOR r_estudiante IN 
        WITH estudiante_notas AS (
            SELECT 
                ecup."ID",
                ecup."NOTA_FINAL" AS nota_global,
                COALESCE(
                    (
                        SELECT ARRAY_AGG(ecl."NOTA_FINAL" ORDER BY ecl."NOTA_FINAL" ASC)
                        FROM public."ESTUDIANTES_CLASE" ecl
                        WHERE ecl."ESTUDIANTE_CUP_ID" = ecup."ID"
                    ), 
                    ARRAY[]::numeric[]
                ) AS notas_ordenadas
            FROM public."ESTUDIANTE_CUP" ecup
            WHERE ecup."ID_CUP" = p_id_cup AND ecup."ESTADO" = 'APROBADO'
        )
        SELECT "ID"
        FROM estudiante_notas
        ORDER BY 
            nota_global DESC,         -- 1er Criterio: Nota promedio final
            notas_ordenadas DESC,     -- 2do Criterio: Menor nota más alta primero
            "ID" ASC                  -- 3er Criterio: Desempate absoluto
    LOOP

        -- 4. Evaluamos sus opciones en orden de preferencia (Opción 1, luego Opción 2)
        FOR r_opcion IN 
            SELECT oc."CARRERA_CUP_ID" AS carrera_cup_id, t.carrera_nombre
            FROM public."OPCION_CARRERA" oc
            JOIN temp_cupos_carrera t ON oc."CARRERA_CUP_ID" = t.carrera_cup_id
            WHERE oc."ESTUDIANTE_CUP_ID" = r_estudiante."ID"
            ORDER BY oc."OPCION" ASC
        LOOP
            
            -- OPTIMIZACIÓN: Modificación directa condicional para evitar un UPDATE ciego
            UPDATE temp_cupos_carrera
            SET cupos_libres = cupos_libres - 1
            WHERE carrera_cup_id = r_opcion.carrera_cup_id 
              AND cupos_libres > 0;
            
            -- Si el UPDATE afectó a una fila, significa que había cupos y ya lo reservamos exitosamente
            IF FOUND THEN
                -- Asignamos formalmente la carrera al estudiante
                UPDATE public."ESTUDIANTE_CUP"
                SET "CARRERA" = r_opcion.carrera_nombre
                WHERE "ID" = r_estudiante."ID";
                
                EXIT; -- Saltamos a evaluar al siguiente estudiante
            END IF;

        END LOOP;
    END LOOP;

    -- Liberar la memoria RAM inmediatamente antes de que acabe la transacción.
    DROP TABLE IF EXISTS temp_cupos_carrera;

    -- 5. Actualizar el estado global en la tabla principal ESTUDIANTE
    -- Para los aprobados: pasan a APROBADO permanentemente
    UPDATE public."ESTUDIANTE"
    SET "ESTADO" = 'APROBADO'
    WHERE "ID_ESTUDIANTE" IN (
        SELECT "ID_ESTUDIANTE" FROM public."ESTUDIANTE_CUP"
        WHERE "ID_CUP" = p_id_cup AND "ESTADO" = 'APROBADO'
    );

    -- Para los que no aprobaron (Reprobados, Abandonos, etc.): pasan a INACTIVO para poder reinscribirse
    UPDATE public."ESTUDIANTE"
    SET "ESTADO" = 'INACTIVO'
    WHERE "ID_ESTUDIANTE" IN (
        SELECT "ID_ESTUDIANTE" FROM public."ESTUDIANTE_CUP"
        WHERE "ID_CUP" = p_id_cup AND "ESTADO" != 'APROBADO'
    );

END;
$$;
SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // En caso de rollback, el procedimiento anterior no tenía la sección 5.
        // Pero como es un procedure complejo, lo ideal sería hacer DROP o dejar que otra migración lo reescriba.
    }
};
