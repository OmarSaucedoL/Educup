<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ESTUDIANTE', function (Blueprint $table) {
            // Drop existing boolean column and recreate as unique varchar
            $table->dropColumn('TITULO_BACHILLER');
        });

        Schema::table('ESTUDIANTE', function (Blueprint $table) {
            $table->string('TITULO_BACHILLER')->nullable()->unique()->after('CORREO');
        });
    }

    public function down(): void
    {
        Schema::table('ESTUDIANTE', function (Blueprint $table) {
            $table->dropUnique(['TITULO_BACHILLER']);
            $table->dropColumn('TITULO_BACHILLER');
        });

        Schema::table('ESTUDIANTE', function (Blueprint $table) {
            $table->boolean('TITULO_BACHILLER')->after('CORREO');
        });
    }
};
