<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Backfill any existing NULL values before enforcing NOT NULL
        \Illuminate\Support\Facades\DB::statement(
            'UPDATE "ESTUDIANTE" SET "TITULO_BACHILLER" = CONCAT(\'SIN_TITULO_\', "ID") WHERE "TITULO_BACHILLER" IS NULL'
        );

        Schema::table('ESTUDIANTE', function (Blueprint $table) {
            $table->string('TITULO_BACHILLER')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('ESTUDIANTE', function (Blueprint $table) {
            $table->string('TITULO_BACHILLER')->nullable()->change();
        });
    }
};
