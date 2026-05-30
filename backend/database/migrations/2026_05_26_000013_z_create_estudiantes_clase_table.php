<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ESTUDIANTES_CLASE', function (Blueprint $table) {
            $table->id('ID');
            $table->foreignId('ESTUDIANTE_CUP_ID')->constrained('ESTUDIANTE_CUP', 'ID')->onDelete('cascade');
            $table->foreignId('ID_CLASE')->constrained('CLASE', 'ID_CLASE')->onDelete('cascade');
            $table->decimal('NOTA_FINAL', 5, 2)->nullable();
            $table->enum('ESTADO', ['APROBADO', 'REPROBADO', 'CURSANDO'])->default('CURSANDO');
            $table->timestamp('FECHA_CREACION')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ESTUDIANTES_CLASE');
    }
};
