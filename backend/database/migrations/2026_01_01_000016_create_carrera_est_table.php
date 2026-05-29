<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('CARRERA_EST', function (Blueprint $table) {
            $table->foreignId('ID_ESTUDIANTE')->constrained('ESTUDIANTE', 'ID_ESTUDIANTE')->onDelete('cascade');
            $table->foreignId('ID_CARRERA')->constrained('CARRERA', 'ID_CARRERA')->onDelete('cascade');
            
            $table->primary(['ID_ESTUDIANTE', 'ID_CARRERA']);
            
            $table->integer('OPCION');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('CARRERA_EST');
    }
};
