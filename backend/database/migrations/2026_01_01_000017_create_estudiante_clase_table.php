<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ESTUDIANTE_CLASE', function (Blueprint $table) {
            $table->foreignId('ESTUDIANTE_ID')->constrained('ESTUDIANTE', 'ID')->onDelete('cascade');
            $table->foreignId('CLASE_ID')->constrained('CLASE', 'ID')->onDelete('cascade');
            
            $table->primary(['ESTUDIANTE_ID', 'CLASE_ID']);
            
            $table->decimal('NOTA1', 5, 2)->nullable();
            $table->decimal('NOTA2', 5, 2)->nullable();
            $table->decimal('NOTA3', 5, 2)->nullable();
            $table->decimal('NOTA_PROM', 5, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ESTUDIANTE_CLASE');
    }
};
