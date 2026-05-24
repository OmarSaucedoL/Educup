<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('CARRERA_EST', function (Blueprint $table) {
            $table->foreignId('ESTUDIANTE_ID')->constrained('ESTUDIANTE', 'ID')->onDelete('cascade');
            $table->foreignId('CARRERA_ID')->constrained('CARRERA', 'ID')->onDelete('cascade');
            
            $table->primary(['ESTUDIANTE_ID', 'CARRERA_ID']);
            
            $table->integer('OPCION');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('CARRERA_EST');
    }
};
