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
            $table->foreignId('CARRERA_ID')->constrained('CARRERA', 'ID')->onDelete('cascade');
            $table->foreignId('CUP_ID')->constrained('CUP', 'ID')->onDelete('cascade');
            $table->integer('CUPOS');
            
            $table->unique(['CARRERA_ID', 'CUP_ID']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('CARRERA_CUP');
    }
};
