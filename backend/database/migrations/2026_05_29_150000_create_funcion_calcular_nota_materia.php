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
            CREATE OR REPLACE FUNCTION f_calcular_nota_materia(
                p_estudiante_cup_id INT,
                p_clase_id INT
            )
            RETURNS NUMERIC
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_nota_total NUMERIC;
            BEGIN
                SELECT COALESCE(SUM(("CALIFICACION" * "PONDERACION") / 100.0), 0) INTO v_nota_total
                FROM "CALIFICACIONES"
                WHERE "ESTUDIANTE_CUP_ID" = p_estudiante_cup_id
                  AND "ID_CLASE" = p_clase_id;

                RETURN ROUND(v_nota_total, 2);
            END;
            $$;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS f_calcular_nota_materia(INT, INT);');
    }
};
