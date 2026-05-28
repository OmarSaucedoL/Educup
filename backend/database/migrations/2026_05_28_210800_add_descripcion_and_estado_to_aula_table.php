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
        Schema::table('AULA', function (Blueprint $table) {
            $table->string('DESCRIPCION')->nullable();
            $table->string('ESTADO')->default('ACTIVO');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('AULA', function (Blueprint $table) {
            $table->dropColumn(['DESCRIPCION', 'ESTADO']);
        });
    }
};
