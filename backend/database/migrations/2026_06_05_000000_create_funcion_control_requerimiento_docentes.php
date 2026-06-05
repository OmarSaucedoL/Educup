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
            CREATE OR REPLACE FUNCTION public.f_control_requerimiento_docentes(p_id_cup bigint)
            RETURNS TABLE(
                materia_id bigint,
                materia_nombre varchar,
                docentes_necesitados integer,
                docentes_disponibles_perfil integer,
                docentes_asignados_actuales integer,
                docentes_faltantes_perfil integer,
                docentes_faltantes_asignacion integer
            ) 
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                WITH grupos_por_turno AS (
                    -- 1. Contamos cuántos grupos únicos tienen programada la materia en cada turno para este CUP
                    SELECT 
                        c."ID_MATERIA",
                        UPPER(TRIM(bh."TURNO")) as turno,
                        COUNT(DISTINCT c."ID_GRUPO")::integer as cant_grupos
                    FROM public."CLASE" c
                    JOIN public."BLOQUE_HORARIO" bh ON c."ID_BLOQUE_HORARIO" = bh."ID_BLOQUE_HORARIO"
                    WHERE c."ID_CUP" = p_id_cup
                    GROUP BY c."ID_MATERIA", UPPER(TRIM(bh."TURNO"))
                ),
                necesidad_materia AS (
                    -- 2. El cuello de botella es el turno con más grupos simultáneos
                    SELECT 
                        gpt."ID_MATERIA",
                        COALESCE(MAX(gpt.cant_grupos), 0)::integer as necesitados
                    FROM grupos_por_turno gpt
                    GROUP BY gpt."ID_MATERIA"
                ),
                disponibles_materia AS (
                    -- 3. Cantidad de docentes habilitados por perfil para la materia en este CUP
                    SELECT 
                        dcm."MATERIA_ID",
                        COUNT(DISTINCT dcm."DOCENTE_CUP_ID")::integer as disponibles
                    FROM public."DOCENTE_CUP_MAT" dcm
                    JOIN public."DOCENTE_CUP" dc ON dcm."DOCENTE_CUP_ID" = dc."ID"
                    WHERE dc."ID_CUP" = p_id_cup
                    GROUP BY dcm."MATERIA_ID"
                ),
                asignados_materia AS (
                    -- 4. Cantidad de docentes que ya tienen al menos una clase asignada de esta materia
                    SELECT 
                        c."ID_MATERIA",
                        COUNT(DISTINCT c."DOCENTE_CUP_ID")::integer as asignados
                    FROM public."CLASE" c
                    WHERE c."ID_CUP" = p_id_cup AND c."DOCENTE_CUP_ID" IS NOT NULL
                    GROUP BY c."ID_MATERIA"
                )
                -- 5. Unimos todo con el catálogo de materias ofertadas en el CUP actual
                SELECT 
                    m."ID_MATERIA" as materia_id,
                    m."NOMBRE" as materia_nombre,
                    COALESCE(n.necesitados, 0) as docentes_necesitados,
                    COALESCE(d.disponibles, 0) as docentes_disponibles_perfil,
                    COALESCE(a.asignados, 0) as docentes_asignados_actuales,
                    -- Faltantes en el banco de perfiles (Planificación de contratos/nuevos perfiles)
                    GREATEST(0, COALESCE(n.necesitados, 0) - COALESCE(d.disponibles, 0)) as docentes_faltantes_perfil,
                    -- Faltantes en la asignación horaria real (Horas libres por asignar en el cronograma)
                    GREATEST(0, COALESCE(n.necesitados, 0) - COALESCE(a.asignados, 0)) as docentes_faltantes_asignacion
                FROM public."MATERIA_CUP" mc
                JOIN public."MATERIA" m ON mc."ID_MATERIA" = m."ID_MATERIA"
                LEFT JOIN necesidad_materia n ON m."ID_MATERIA" = n."ID_MATERIA"
                LEFT JOIN disponibles_materia d ON m."ID_MATERIA" = d."MATERIA_ID"
                LEFT JOIN asignados_materia a ON m."ID_MATERIA" = a."ID_MATERIA"
                WHERE mc."ID_CUP" = p_id_cup
                ORDER BY m."NOMBRE";
            END;
            $$;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS public.f_control_requerimiento_docentes(bigint);');
    }
};
