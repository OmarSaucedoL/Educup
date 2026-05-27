<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('OPCION_CARRERA', function (Blueprint $table) {
            $table->id('ID');
            $table->foreignId('ESTUDIANTE_CUP_ID')->constrained('ESTUDIANTE_CUP', 'ID')->onDelete('cascade');
            $table->foreignId('CARRERA_CUP_ID')->constrained('CARRERA_CUP', 'ID')->onDelete('cascade');
            $table->integer('OPCION'); // 1 = Primera Opción, 2 = Segunda Opción

            $table->unique(['ESTUDIANTE_CUP_ID', 'CARRERA_CUP_ID']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('OPCION_CARRERA');
    }
};
