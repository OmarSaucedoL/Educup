<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('CLASE', function (Blueprint $table) {
            $table->id('ID_CLASE');
            
            $table->foreignId('DOCENTE_CUP_ID')->constrained('DOCENTE_CUP', 'ID')->onDelete('cascade');
            $table->foreignId('ID_BLOQUE_HORARIO')->constrained('BLOQUE_HORARIO', 'ID_BLOQUE_HORARIO')->onDelete('cascade');
            $table->foreignId('ID_MATERIA')->constrained('MATERIA', 'ID_MATERIA')->onDelete('restrict');
            $table->foreignId('ID_GRUPO')->constrained('GRUPO', 'ID_GRUPO')->onDelete('restrict');
            $table->foreignId('ID_AULA')->constrained('AULA', 'ID_AULA')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('CLASE');
    }
};
