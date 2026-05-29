<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('CARRERA_CUP', function (Blueprint $table) {
            $table->id('ID');
            $table->foreignId('ID_CARRERA')->constrained('CARRERA', 'ID_CARRERA')->onDelete('cascade');
            $table->foreignId('ID_CUP')->constrained('CUP', 'ID_CUP')->onDelete('cascade');
            $table->integer('CUPOS');
            
            $table->unique(['ID_CARRERA', 'ID_CUP']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('CARRERA_CUP');
    }
};
