<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('DOCENTE_CUP_MAT', function (Blueprint $table) {
            $table->id('ID');
            $table->foreignId('DOCENTE_CUP_ID')->constrained('DOCENTE_CUP', 'ID')->onDelete('cascade');
            $table->foreignId('MATERIA_ID')->constrained('MATERIA', 'ID_MATERIA')->onDelete('cascade');
            
            $table->unique(['DOCENTE_CUP_ID', 'MATERIA_ID']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('DOCENTE_CUP_MAT');
    }
};
