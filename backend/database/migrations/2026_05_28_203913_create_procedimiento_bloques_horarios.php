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
        if (DB::getDriverName() === 'pgsql') {
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
                    -- 1. VALIDACIONES DE RESTRICCIONES DE HORA POR TURNO
                    IF UPPER(p_turno) = 'MAÑANA' THEN
                        IF p_hora_inicio < '07:00:00' OR p_hora_inicio >= '12:00:00' THEN
                            RAISE EXCEPTION 'Error de validación: La hora de inicio (%) para el turno MAÑANA debe estar entre las 07:00 y las 11:59.', p_hora_inicio;
                        END IF;
                    ELSIF UPPER(p_turno) = 'TARDE' THEN
                        IF p_hora_inicio < '12:00:00' OR p_hora_inicio >= '18:00:00' THEN
                            RAISE EXCEPTION 'Error de validación: La hora de inicio (%) para el turno TARDE debe estar entre las 12:00 y las 17:59.', p_hora_inicio;
                        END IF;
                    ELSIF UPPER(p_turno) = 'NOCHE' THEN
                        IF p_hora_inicio < '18:00:00' OR p_hora_inicio >= '22:00:00' THEN
                            RAISE EXCEPTION 'Error de validación: La hora de inicio (%) para el turno NOCHE debe estar entre las 18:00 y las 21:59.', p_hora_inicio;
                        END IF;
                    ELSE
                        RAISE EXCEPTION 'Error de validación: Turno no válido (%). Debe ser MAÑANA, TARDE o NOCHE.', p_turno;
                    END IF;

                    v_hora_fin_clase := p_hora_inicio + ( p_carga_horaria || ' minutes' )::INTERVAL;

                    IF v_hora_fin_clase > '22:00:00' THEN
                        RAISE EXCEPTION 'Error de validación: El bloque terminaría a las %, excediendo el límite de las 22:00.', v_hora_fin_clase;
                    END IF;

                    -- 2. INSERCIÓN DEL ENCABEZADO
                    INSERT INTO "BLOQUE_HORARIO" ("TURNO")
                    VALUES (UPPER(p_turno))
                    RETURNING "ID_BLOQUE_HORARIO" INTO v_bloque_id;

                    -- 3. BUCLE PARA DISTRIBUIR LOS DÍAS
                    FOREACH v_dia_actual IN ARRAY p_dias
                    LOOP
                        SELECT "ID" INTO v_horario_id 
                        FROM "HORARIO"
                        WHERE "DIA" = UPPER(v_dia_actual) 
                          AND "HORA_INI" = p_hora_inicio 
                          AND "HORA_FIN" = v_hora_fin_clase;

                        IF v_horario_id IS NULL THEN
                            INSERT INTO "HORARIO" ("DIA", "HORA_INI", "HORA_FIN")
                            VALUES (UPPER(v_dia_actual), p_hora_inicio, v_hora_fin_clase)
                            RETURNING "ID" INTO v_horario_id;
                        END IF;

                        INSERT INTO "HORARIO_EN_BLOQUE" ("HORARIO_ID", "ID_BLOQUE_HORARIO", "CARGA_HORARIA")
                        VALUES (v_horario_id, v_bloque_id, p_carga_horaria);
                    END LOOP;
                END;
                $$;
            SQL);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            // Regla de oro en Laravel: dejar la BD tal cual como estaba si se hace rollback
            DB::statement('DROP PROCEDURE IF EXISTS f_crear_bloque_horario_completo(VARCHAR, TIME, VARCHAR[], INT);');
        }
    }
};