<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ESTUDIANTE_CUP', function (Blueprint $table) {
            $table->foreignId('ESTUDIANTE_ID')->constrained('ESTUDIANTE', 'ID')->onDelete('cascade');
            $table->foreignId('CUP_ID')->constrained('CUP', 'ID')->onDelete('cascade');
            
            $table->date('FECHA')->useCurrent();
            $table->string('ESTADO', 30)->default('INSCRITO'); // INSCRITO, ABANDONO, REPROBADO, APROBADO

            $table->primary(['ESTUDIANTE_ID', 'CUP_ID']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ESTUDIANTE_CUP');
    }
};