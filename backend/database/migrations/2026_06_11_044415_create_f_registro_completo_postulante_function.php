<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::unprepared('
        CREATE OR REPLACE FUNCTION public.f_registro_completo_postulante(
            p_carnet INTEGER,
            p_nombre VARCHAR,
            p_apellido VARCHAR,
            p_fecha_nac DATE,
            p_sexo VARCHAR,
            p_correo VARCHAR,
            p_telefono BIGINT,
            p_direccion VARCHAR,
            p_titulo_bachiller VARCHAR,
            p_ciudad_id BIGINT,
            p_nueva_ciudad_nombre VARCHAR,
            p_nueva_ciudad_departamento VARCHAR,
            p_colegio_id BIGINT,
            p_nuevo_colegio_nombre VARCHAR,
            p_id_cup BIGINT,
            p_opcion_1 BIGINT,
            p_opcion_2 BIGINT,
            p_paypal_order_id VARCHAR,
            p_monto NUMERIC,
            p_contrasenia_hasheada VARCHAR
        )
        RETURNS BIGINT AS $$
        DECLARE
            v_rol_estudiante_id BIGINT;
            v_usuario_id BIGINT;
            v_ciudad_id BIGINT := p_ciudad_id;
            v_colegio_id BIGINT := p_colegio_id;
            v_estudiante_id BIGINT;
            v_inscripcion_id BIGINT;
        BEGIN
            -- 1. Obtener o crear Rol ESTUDIANTE
            SELECT "ID" INTO v_rol_estudiante_id FROM "ROL" WHERE UPPER("NOMBRE") = \'ESTUDIANTE\' LIMIT 1;
            IF v_rol_estudiante_id IS NULL THEN
                INSERT INTO "ROL" ("NOMBRE") VALUES (\'ESTUDIANTE\') RETURNING "ID" INTO v_rol_estudiante_id;
            END IF;

            -- 2. Manejo de Ciudad Nueva
            IF p_nueva_ciudad_nombre IS NOT NULL AND p_nueva_ciudad_nombre <> \'\' THEN
                SELECT "ID" INTO v_ciudad_id FROM "CIUDAD" WHERE UPPER("NOMBRE") = UPPER(p_nueva_ciudad_nombre) LIMIT 1;
                IF v_ciudad_id IS NULL THEN
                    INSERT INTO "CIUDAD" ("NOMBRE", "DEPARTAMENTO") 
                    VALUES (UPPER(p_nueva_ciudad_nombre), COALESCE(UPPER(p_nueva_ciudad_departamento), \'SANTA CRUZ\'))
                    RETURNING "ID" INTO v_ciudad_id;
                END IF;
            END IF;

            -- 3. Manejo de Colegio Nuevo
            IF p_nuevo_colegio_nombre IS NOT NULL AND p_nuevo_colegio_nombre <> \'\' THEN
                SELECT "ID" INTO v_colegio_id FROM "COLEGIO" WHERE UPPER("NOMBRE") = UPPER(p_nuevo_colegio_nombre) LIMIT 1;
                IF v_colegio_id IS NULL THEN
                    INSERT INTO "COLEGIO" ("NOMBRE") 
                    VALUES (UPPER(p_nuevo_colegio_nombre))
                    RETURNING "ID" INTO v_colegio_id;
                END IF;
            END IF;

            -- 4. Buscar o crear Usuario utilizando f_insertar_usuario
            SELECT "ID" INTO v_usuario_id FROM "USUARIO" WHERE "CARNET" = CAST(p_carnet AS VARCHAR) LIMIT 1;
            IF v_usuario_id IS NULL THEN
                v_usuario_id := public.f_insertar_usuario(
                    CAST(LOWER(p_nombre || p_carnet) AS VARCHAR),
                    p_contrasenia_hasheada,
                    p_carnet,
                    p_nombre,
                    p_apellido,
                    LOWER(p_correo),
                    p_telefono,
                    \'ACTIVO\',
                    v_rol_estudiante_id
                );
            END IF;

            -- 5. Crear el registro de Estudiante
            SELECT "ID_ESTUDIANTE" INTO v_estudiante_id FROM "ESTUDIANTE" WHERE "CARNET" = p_carnet LIMIT 1;
            IF v_estudiante_id IS NULL THEN
                INSERT INTO "ESTUDIANTE" (
                    "CARNET", "NOMBRE", "APELLIDO", "FECHA_NAC", "SEXO", 
                    "DIRECCION", "TELEFONO", "CORREO", "TITULO_BACHILLER", 
                    "ESTADO", "COLEGIO_ID", "CIUDAD_ID", "USUARIO_ID"
                ) VALUES (
                    p_carnet, UPPER(p_nombre), UPPER(p_apellido), p_fecha_nac, UPPER(p_sexo),
                    UPPER(p_direccion), CAST(p_telefono AS VARCHAR), LOWER(p_correo), UPPER(p_titulo_bachiller),
                    \'ACTIVO\', v_colegio_id, v_ciudad_id, v_usuario_id
                ) RETURNING "ID_ESTUDIANTE" INTO v_estudiante_id;
            END IF;

            -- 6. Inscribir usando el procedimiento almacenado
            CALL public.p_inscribir_estudiante_cup(v_estudiante_id, p_id_cup, p_opcion_1, p_opcion_2);

            -- 7. Obtener ID de la inscripción generada
            SELECT "ID" INTO v_inscripcion_id 
            FROM "ESTUDIANTE_CUP" 
            WHERE "ID_ESTUDIANTE" = v_estudiante_id AND "ID_CUP" = p_id_cup LIMIT 1;

            IF v_inscripcion_id IS NULL THEN
                RAISE EXCEPTION \'No se pudo confirmar la inscripción académica en el CUP.\';
            END IF;

            -- 8. Validar e integrar el estado del Pago
            UPDATE "ESTUDIANTE_CUP"
            SET "ESTADO" = \'ACTIVO\',
                "NOTA_FINAL" = 0.00
            WHERE "ID" = v_inscripcion_id;

            INSERT INTO "PAGO" (
                "ESTUDIANTE_CUP_ID", "PAYPAL_ORDER_ID", "MONTO", "ESTADO"
            ) VALUES (
                v_inscripcion_id, p_paypal_order_id, p_monto, \'COMPLETADO\'
            );

            RETURN v_usuario_id;
        END;
        $$ LANGUAGE plpgsql;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::unprepared('DROP FUNCTION IF EXISTS public.f_registro_completo_postulante');
    }
};
