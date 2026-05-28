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
        // Creamos el procedimiento directamente en PostgreSQL
        DB::statement(<<<SQL
            CREATE OR REPLACE PROCEDURE f_crear_bloque_horario_completo(
                p_turno VARCHAR(30),
                p_hora_inicio TIME,
                p_dias VARCHAR[],
                p_carga_horaria INT
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_bloque_id INT;
                v_hora_actual TIME;
                v_hora_fin_clase TIME;
                v_dia_actual VARCHAR(20);
                v_horario_id INT;
                v_materia_contador INT;
            BEGIN
                -- 1. VALIDACIONES DE RESTRICCIONES DE HORA
                IF p_hora_inicio < '07:00:00' OR p_hora_inicio > '20:00:00' THEN
                    RAISE EXCEPTION 'Error de validación: La hora de inicio (%) debe estar entre las 07:00 y las 20:00.', p_hora_inicio;
                END IF;

                v_hora_fin_clase := p_hora_inicio + ( (p_carga_horaria * 2) || ' minutes' )::INTERVAL;

                IF v_hora_fin_clase > '22:00:00' THEN
                    RAISE EXCEPTION 'Error de validación: El bloque terminaría a las %, excediendo el límite de las 22:00.', v_hora_fin_clase;
                END IF;

                -- 2. INSERCIÓN DEL ENCABEZADO
                INSERT INTO "BLOQUE_HORARIO" ("TURNO")
                VALUES (UPPER(p_turno))
                RETURNING "ID" INTO v_bloque_id;

                -- 3. BUCLE PARA DISTRIBUIR LOS DÍAS Y LAS 2 MATERIAS
                FOREACH v_dia_actual IN ARRAY p_dias
                LOOP
                    v_hora_actual := p_hora_inicio;
                    
                    FOR v_materia_contador IN 1..2 LOOP
                        v_hora_fin_clase := v_hora_actual + (p_carga_horaria || ' minutes')::INTERVAL;

                        SELECT "ID" INTO v_horario_id 
                        FROM "HORARIO"
                        WHERE "DIA" = UPPER(v_dia_actual) 
                          AND "HORA_INI" = v_hora_actual 
                          AND "HORA_FIN" = v_hora_fin_clase;

                        IF v_horario_id IS NULL THEN
                            INSERT INTO "HORARIO" ("DIA", "HORA_INI", "HORA_FIN")
                            VALUES (UPPER(v_dia_actual), v_hora_actual, v_hora_fin_clase)
                            RETURNING "ID" INTO v_horario_id;
                        END IF;

                        INSERT INTO "HORARIO_EN_BLOQUE" ("HORARIO_ID", "BLOQUE_HORARIO_ID", "CARGA_HORARIA")
                        VALUES (v_horario_id, v_bloque_id, p_carga_horaria);

                        v_hora_actual := v_hora_fin_clase;
                    END LOOP;
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
        // Regla de oro en Laravel: dejar la BD tal cual como estaba si se hace rollback
        DB::statement('DROP PROCEDURE IF EXISTS f_crear_bloque_horario_completo(VARCHAR, TIME, VARCHAR[], INT);');
    }
};