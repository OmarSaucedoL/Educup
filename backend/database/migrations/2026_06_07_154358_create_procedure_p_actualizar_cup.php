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
        DB::unprepared('
CREATE OR REPLACE PROCEDURE public.p_actualizar_cup(
    p_id_cup bigint,
    p_anio integer,
    p_semestre integer,
    p_nota_minima numeric,
    p_cupos integer,
    p_fecha_inicio date,
    p_fecha_fin date,
    p_usuario_id bigint,
    p_estado varchar,
    p_carreras_ids bigint[],
    p_carreras_cupos integer[],
    p_materias_ids bigint[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    i integer;
    v_carrera_nombre varchar;
    v_materia_nombre varchar;
BEGIN
    -- 1. Actualizar datos base de la tabla principal CUP
    UPDATE public."CUP"
    SET 
        "ANIO" = p_anio,
        "SEMESTRE" = p_semestre,
        "NOTA_MINIMA" = p_nota_minima,
        "CUPOS" = p_cupos,
        "FECHA_INICIO" = p_fecha_inicio,
        "FECHA_FIN" = p_fecha_fin,
        "USUARIO_ID" = p_usuario_id,
        "ESTADO" = p_estado
    WHERE "ID_CUP" = p_id_cup;

    -- =======================================================
    -- 2. Sincronizar CARRERA_CUP
    -- =======================================================
    
    -- 2.a VALIDACIÓN DEFENSIVA: Verificar si las carreras a eliminar ya tienen postulantes
    SELECT c."NOMBRE"::varchar INTO v_carrera_nombre
    FROM public."CARRERA_CUP" cc
    JOIN public."CARRERA" c ON cc."ID_CARRERA" = c."ID_CARRERA"
    WHERE cc."ID_CUP" = p_id_cup 
      AND NOT (cc."ID_CARRERA" = ANY(p_carreras_ids))
      AND EXISTS (
          SELECT 1 FROM public."OPCION_CARRERA" oc 
          WHERE oc."CARRERA_CUP_ID" = cc."ID"
      )
    LIMIT 1;

    IF v_carrera_nombre IS NOT NULL THEN
        RAISE EXCEPTION \'No se puede remover la carrera "%" porque ya existen estudiantes que la seleccionaron en sus opciones.\', v_carrera_nombre;
    END IF;

    -- 2.b Eliminar carreras quitadas de forma segura
    DELETE FROM public."CARRERA_CUP"
    WHERE "ID_CUP" = p_id_cup 
      AND NOT ("ID_CARRERA" = ANY(p_carreras_ids));

    -- 2.c Insertar nuevas o Actualizar cupos
    IF p_carreras_ids IS NOT NULL THEN
        FOR i IN 1 .. array_length(p_carreras_ids, 1) LOOP
            IF EXISTS (SELECT 1 FROM public."CARRERA_CUP" WHERE "ID_CUP" = p_id_cup AND "ID_CARRERA" = p_carreras_ids[i]) THEN
                UPDATE public."CARRERA_CUP"
                SET "CUPOS" = p_carreras_cupos[i]
                WHERE "ID_CUP" = p_id_cup AND "ID_CARRERA" = p_carreras_ids[i];
            ELSE
                INSERT INTO public."CARRERA_CUP" ("ID_CUP", "ID_CARRERA", "CUPOS")
                VALUES (p_id_cup, p_carreras_ids[i], p_carreras_cupos[i]);
            END IF;
        END LOOP;
    END IF;

    -- =======================================================
    -- 3. Sincronizar MATERIA_CUP
    -- =======================================================
    
    -- 3.a VALIDACIÓN DEFENSIVA: Verificar si las materias a eliminar ya tienen clases planificadas
    SELECT m."NOMBRE"::varchar INTO v_materia_nombre
    FROM public."MATERIA_CUP" mc
    JOIN public."MATERIA" m ON mc."ID_MATERIA" = m."ID_MATERIA"
    WHERE mc."ID_CUP" = p_id_cup
      AND NOT (mc."ID_MATERIA" = ANY(p_materias_ids))
      AND EXISTS (
          SELECT 1 FROM public."CLASE" cl 
          WHERE cl."ID_MATERIA" = mc."ID_MATERIA" AND cl."ID_CUP" = p_id_cup
      )
    LIMIT 1;

    IF v_materia_nombre IS NOT NULL THEN
        RAISE EXCEPTION \'No se puede remover la materia "%" porque ya existen clases y horarios asignados a ella en este CUP.\', v_materia_nombre;
    END IF;

    -- 3.b Eliminar materias quitadas de forma segura
    DELETE FROM public."MATERIA_CUP"
    WHERE "ID_CUP" = p_id_cup
      AND NOT ("ID_MATERIA" = ANY(p_materias_ids));

    -- 3.c Insertar nuevas materias
    IF p_materias_ids IS NOT NULL THEN
        FOR i IN 1 .. array_length(p_materias_ids, 1) LOOP
            IF NOT EXISTS (SELECT 1 FROM public."MATERIA_CUP" WHERE "ID_CUP" = p_id_cup AND "ID_MATERIA" = p_materias_ids[i]) THEN
                INSERT INTO public."MATERIA_CUP" ("ID_CUP", "ID_MATERIA")
                VALUES (p_id_cup, p_materias_ids[i]);
            END IF;
        END LOOP;
    END IF;

    -- =======================================================
    -- 4. Recálculo Masivo de Aprobación basado en la REGLA DE NEGOCIO ESTRICTA
    -- =======================================================

    -- 4.a Actualizar las Clases Individuales comparando contra p_nota_minima
    UPDATE public."ESTUDIANTES_CLASE" ec
    SET "ESTADO" = CASE WHEN ec."NOTA_FINAL" >= p_nota_minima THEN \'APROBADO\'::varchar ELSE \'REPROBADO\'::varchar END
    FROM public."CLASE" c
    WHERE ec."ID_CLASE" = c."ID_CLASE"
      AND c."ID_CUP" = p_id_cup
      AND ec."NOTA_FINAL" IS NOT NULL;

    -- 4.b 🔴 CORRECCIÓN AQUÍ: Actualizar el estado global del estudiante en el CUP
    -- Evaluamos de manera combinada la existencia de aplazos e incompletos por estudiante
    WITH stats AS (
        SELECT 
            ec."ESTUDIANTE_CUP_ID",
            SUM(CASE WHEN ec."ESTADO" = \'REPROBADO\' THEN 1 ELSE 0 END) as reprobadas,
            SUM(CASE WHEN ec."NOTA_FINAL" IS NULL THEN 1 ELSE 0 END) as pendientes
        FROM public."ESTUDIANTES_CLASE" ec
        JOIN public."CLASE" c ON ec."ID_CLASE" = c."ID_CLASE"
        WHERE c."ID_CUP" = p_id_cup
        GROUP BY ec."ESTUDIANTE_CUP_ID"
    )
    UPDATE public."ESTUDIANTE_CUP" e
    SET "ESTADO" = CASE 
        -- Regla estricta: si reprobó al menos una materia, el estado general es REPROBADO inmediatamente
        WHEN s.reprobadas > 0 THEN \'REPROBADO\'::varchar
        -- Si no tiene reprobadas pero le faltan notas por registrar, se mantiene INSCRITO
        WHEN s.pendientes > 0 THEN \'INSCRITO\'::varchar
        -- Solo si aprobó TODAS las materias individuales pasa a estar APROBADO
        ELSE \'APROBADO\'::varchar
    END
    FROM stats s
    WHERE e."ID" = s."ESTUDIANTE_CUP_ID"
      AND e."ID_CUP" = p_id_cup;

    -- 4.c Caso especial para estudiantes con nota global directa sin clases (Garantizar consistencia)
    UPDATE public."ESTUDIANTE_CUP" e
    SET "ESTADO" = CASE WHEN e."NOTA_FINAL" >= p_nota_minima THEN \'APROBADO\'::varchar ELSE \'REPROBADO\'::varchar END
    WHERE e."ID_CUP" = p_id_cup
      AND e."NOTA_FINAL" IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM public."ESTUDIANTES_CLASE" ec 
          JOIN public."CLASE" c ON ec."ID_CLASE" = c."ID_CLASE"
          WHERE ec."ESTUDIANTE_CUP_ID" = e."ID"
      );

END;
$$;');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS public.p_actualizar_cup');
    }
};
