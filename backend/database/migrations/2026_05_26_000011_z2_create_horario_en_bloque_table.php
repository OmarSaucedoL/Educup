<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('HORARIO_EN_BLOQUE', function (Blueprint $table) {
            $table->id('ID');
            $table->foreignId('HORARIO_ID')->constrained('HORARIO', 'ID')->onDelete('cascade');
            $table->foreignId('ID_BLOQUE_HORARIO')->constrained('BLOQUE_HORARIO', 'ID_BLOQUE_HORARIO')->onDelete('cascade');
            $table->string('CARGA_HORARIA', 50)->nullable();

            $table->unique(['HORARIO_ID', 'ID_BLOQUE_HORARIO']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('HORARIO_EN_BLOQUE');
    }
};
