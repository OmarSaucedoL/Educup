<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('CLASE', function (Blueprint $table) {
            $table->id('ID');
            
            $table->foreignId('DOCENTE_CUP_ID')->constrained('DOCENTE_CUP', 'ID')->onDelete('cascade');
            $table->foreignId('MATERIA_ID')->constrained('MATERIA', 'ID')->onDelete('restrict');
            $table->foreignId('GRUPO_ID')->constrained('GRUPO', 'ID')->onDelete('restrict');
            $table->foreignId('AULA_ID')->constrained('AULA', 'ID')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('CLASE');
    }
};
