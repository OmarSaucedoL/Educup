<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ESTUDIANTE_CUP', function (Blueprint $table) {
            $table->id('ID');
            $table->foreignId('ID_ESTUDIANTE')->constrained('ESTUDIANTE', 'ID_ESTUDIANTE')->onDelete('cascade');
            $table->foreignId('ID_CUP')->constrained('CUP', 'ID_CUP')->onDelete('cascade');
            
            $table->date('FECHA')->useCurrent();
            $table->string('ESTADO', 30)->default('INSCRITO'); // INSCRITO, ABANDONO, REPROBADO, APROBADO
            $table->decimal('NOTA_FINAL', 5, 2)->nullable();
            $table->string('CARRERA', 150)->nullable();

            $table->unique(['ID_ESTUDIANTE', 'ID_CUP']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ESTUDIANTE_CUP');
    }
};