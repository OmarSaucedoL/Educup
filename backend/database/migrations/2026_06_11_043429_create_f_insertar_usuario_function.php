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
        CREATE OR REPLACE FUNCTION public.f_insertar_usuario(
            p_username VARCHAR,
            p_contrasenia VARCHAR,
            p_carnet INTEGER,
            p_nombre VARCHAR,
            p_apellido VARCHAR,
            p_correo VARCHAR,
            p_telefono BIGINT,
            p_estado VARCHAR,
            p_rol_id BIGINT
        )
        RETURNS BIGINT AS $$
        DECLARE
            v_nuevo_id BIGINT;
            v_rol_nombre VARCHAR;
        BEGIN
            -- 1. Validaciones de duplicidad estricta
            IF EXISTS (SELECT 1 FROM "USUARIO" WHERE "USERNAME" = p_username) THEN
                RAISE EXCEPTION \'El nombre de usuario "%" ya está en uso.\', p_username;
            END IF;

            IF EXISTS (SELECT 1 FROM "USUARIO" WHERE "CORREO" = p_correo) THEN
                RAISE EXCEPTION \'El correo electrónico "%" ya está registrado.\', p_correo;
            END IF;

            IF p_carnet IS NOT NULL THEN
                IF EXISTS (SELECT 1 FROM "USUARIO" WHERE "CARNET" = CAST(p_carnet AS VARCHAR)) THEN
                    RAISE EXCEPTION \'El carnet de identidad "%" ya está registrado por otro usuario.\', p_carnet;
                END IF;
            END IF;

            -- 2. Inserción del usuario principal
            INSERT INTO "USUARIO" (
                "USERNAME", "CONTRASENIA", "CARNET", "NOMBRE", "APELLIDO", 
                "CORREO", "TELEFONO", "ESTADO", "FECHA_CREACION", "ROL_ID"
            ) VALUES (
                p_username, p_contrasenia, CAST(p_carnet AS VARCHAR), p_nombre, p_apellido, 
                p_correo, p_telefono, COALESCE(p_estado, \'ACTIVO\'), CURRENT_TIMESTAMP, p_rol_id
            ) RETURNING "ID" INTO v_nuevo_id;

            -- 3. Lógica dependiente (Permisos y Docente)
            IF p_rol_id IS NOT NULL THEN
                INSERT INTO "PERMISOS_USUARIO" ("USUARIO_ID", "PERMISOS_ID", "ESTADO", "FECHA_MOD")
                SELECT v_nuevo_id, "PERMISOS_ID", \'ACTIVO\', CURRENT_TIMESTAMP
                FROM "PERMISO_ROL"
                WHERE "ROL_ID" = p_rol_id AND "ESTADO" = \'ACTIVO\';

                SELECT "NOMBRE" INTO v_rol_nombre FROM "ROL" WHERE "ID" = p_rol_id;
                
                IF v_rol_nombre ILIKE \'%DOCENTE%\' THEN
                    IF NOT EXISTS (SELECT 1 FROM "DOCENTE" WHERE "CODIGO_DOCENTE" = v_nuevo_id) THEN
                        INSERT INTO "DOCENTE" ("CODIGO_DOCENTE") VALUES (v_nuevo_id);
                    END IF;
                END IF;
            END IF;

            RETURN v_nuevo_id;
        END;
        $$ LANGUAGE plpgsql;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::unprepared('DROP FUNCTION IF EXISTS public.f_insertar_usuario');
    }
};
