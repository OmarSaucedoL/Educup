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
        DB::statement(<<<SQL
            CREATE OR REPLACE FUNCTION public.f_obtener_lista_general_postulantes(p_id_cup bigint)
            RETURNS TABLE (
                id BIGINT,
                carnet INT,
                nombre VARCHAR,
                apellido VARCHAR,
                nombre_completo VARCHAR,
                correo VARCHAR,
                telefono VARCHAR,
                colegio VARCHAR,
                ciudad VARCHAR,
                estado VARCHAR,
                nota_final NUMERIC,
                carrera_asignada VARCHAR,
                preferencia_asignada VARCHAR,
                opcion_1 VARCHAR,
                opcion_2 VARCHAR,
                notas_materias JSONB,
                fecha_inscripcion VARCHAR
            ) AS $$
            BEGIN
                RETURN QUERY
                WITH opciones AS (
                    SELECT 
                        ec."ID" as est_cup_id,
                        (SELECT c."NOMBRE"::VARCHAR FROM public."OPCION_CARRERA" oc 
                         JOIN public."CARRERA_CUP" cc ON oc."CARRERA_CUP_ID" = cc."ID"
                         JOIN public."CARRERA" c ON cc."ID_CARRERA" = c."ID_CARRERA"
                         WHERE oc."ESTUDIANTE_CUP_ID" = ec."ID" AND oc."OPCION" = 1) as carrera_opcion_1,
                        (SELECT c."NOMBRE"::VARCHAR FROM public."OPCION_CARRERA" oc 
                         JOIN public."CARRERA_CUP" cc ON oc."CARRERA_CUP_ID" = cc."ID"
                         JOIN public."CARRERA" c ON cc."ID_CARRERA" = c."ID_CARRERA"
                         WHERE oc."ESTUDIANTE_CUP_ID" = ec."ID" AND oc."OPCION" = 2) as carrera_opcion_2
                    FROM public."ESTUDIANTE_CUP" ec
                    WHERE ec."ID_CUP" = p_id_cup
                ),
                calificaciones_est AS (
                    SELECT 
                        ecl."ESTUDIANTE_CUP_ID" as est_cup_id,
                        jsonb_agg(
                            jsonb_build_object(
                                'materia', m."NOMBRE",
                                'materia_sigla', '',
                                'nota_final', ecl."NOTA_FINAL",
                                'estado', ecl."ESTADO"
                            )
                        ) as notas_arr
                    FROM public."ESTUDIANTES_CLASE" ecl
                    JOIN public."CLASE" cl ON ecl."ID_CLASE" = cl."ID_CLASE"
                    JOIN public."MATERIA" m ON cl."ID_MATERIA" = m."ID_MATERIA"
                    GROUP BY ecl."ESTUDIANTE_CUP_ID"
                )
                SELECT 
                    ec."ID" as id,
                    e."CARNET" as carnet,
                    e."NOMBRE"::VARCHAR as nombre,
                    e."APELLIDO"::VARCHAR as apellido,
                    TRIM(CONCAT(e."APELLIDO", ' ', e."NOMBRE"))::VARCHAR as nombre_completo,
                    e."CORREO"::VARCHAR as correo,
                    e."TELEFONO"::VARCHAR as telefono,
                    COALESCE(col."NOMBRE", 'No especificado')::VARCHAR as colegio,
                    COALESCE(ciu."NOMBRE", 'No especificada')::VARCHAR as ciudad,
                    ec."ESTADO"::VARCHAR as estado,
                    ec."NOTA_FINAL"::NUMERIC as nota_final,
                    ec."CARRERA"::VARCHAR as carrera_asignada,
                    (CASE 
                        WHEN ec."CARRERA" IS NULL OR ec."CARRERA" = '' THEN NULL
                        WHEN ec."CARRERA" = o.carrera_opcion_1 THEN '1'
                        WHEN ec."CARRERA" = o.carrera_opcion_2 THEN '2'
                        ELSE 'Otro'
                     END)::VARCHAR as preferencia_asignada,
                    COALESCE(o.carrera_opcion_1, 'Sin seleccionar')::VARCHAR as opcion_1,
                    COALESCE(o.carrera_opcion_2, 'Sin seleccionar')::VARCHAR as opcion_2,
                    COALESCE(c.notas_arr, '[]'::jsonb) as notas_materias,
                    COALESCE(TO_CHAR(ec."FECHA", 'DD/MM/YYYY'), 'No registrada')::VARCHAR as fecha_inscripcion
                FROM public."ESTUDIANTE_CUP" ec
                JOIN public."ESTUDIANTE" e ON ec."ID_ESTUDIANTE" = e."ID_ESTUDIANTE"
                LEFT JOIN public."COLEGIO" col ON e."COLEGIO_ID" = col."ID"
                LEFT JOIN public."CIUDAD" ciu ON e."CIUDAD_ID" = ciu."ID"
                LEFT JOIN opciones o ON ec."ID" = o.est_cup_id
                LEFT JOIN calificaciones_est c ON ec."ID" = c.est_cup_id
                WHERE ec."ID_CUP" = p_id_cup
                ORDER BY e."APELLIDO" ASC, e."NOMBRE" ASC;
            END;
            $$ LANGUAGE plpgsql;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS public.f_obtener_lista_general_postulantes(bigint);');
    }
};
