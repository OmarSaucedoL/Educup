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
        CREATE OR REPLACE FUNCTION public.f_actualizar_usuario(
            p_id BIGINT,
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
        RETURNS VOID AS $$
        DECLARE
            v_rol_nombre VARCHAR;
        BEGIN
            -- 1. Validaciones de duplicidad estricta (excluyendo al mismo usuario)
            IF EXISTS (SELECT 1 FROM "USUARIO" WHERE "USERNAME" = p_username AND "ID" != p_id) THEN
                RAISE EXCEPTION \'El nombre de usuario "%" ya está en uso.\', p_username;
            END IF;

            IF EXISTS (SELECT 1 FROM "USUARIO" WHERE "CORREO" = p_correo AND "ID" != p_id) THEN
                RAISE EXCEPTION \'El correo electrónico "%" ya está registrado.\', p_correo;
            END IF;

            IF p_carnet IS NOT NULL THEN
                IF EXISTS (SELECT 1 FROM "USUARIO" WHERE "CARNET" = p_carnet AND "ID" != p_id) THEN
                    RAISE EXCEPTION \'El carnet de identidad "%" ya está registrado por otro usuario.\', p_carnet;
                END IF;
            END IF;

            -- 2. Actualización del usuario principal
            UPDATE "USUARIO" SET
                "USERNAME" = p_username,
                "CONTRASENIA" = COALESCE(p_contrasenia, "CONTRASENIA"),
                "CARNET" = p_carnet,
                "NOMBRE" = p_nombre,
                "APELLIDO" = p_apellido,
                "CORREO" = p_correo,
                "TELEFONO" = p_telefono,
                "ESTADO" = COALESCE(p_estado, "ESTADO"),
                "ROL_ID" = p_rol_id
            WHERE "ID" = p_id;

            -- 3. Lógica dependiente (Docente)
            IF p_rol_id IS NOT NULL THEN
                SELECT "NOMBRE" INTO v_rol_nombre FROM "ROL" WHERE "ID" = p_rol_id;
                
                IF v_rol_nombre ILIKE \'%DOCENTE%\' THEN
                    IF NOT EXISTS (SELECT 1 FROM "DOCENTE" WHERE "CODIGO_DOCENTE" = p_id) THEN
                        INSERT INTO "DOCENTE" ("CODIGO_DOCENTE") VALUES (p_id);
                    END IF;
                END IF;
            END IF;
        END;
        $$ LANGUAGE plpgsql;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::unprepared('DROP FUNCTION IF EXISTS public.f_actualizar_usuario');
    }
};
