<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('CALIFICACIONES', function (Blueprint $table) {
            $table->id('ID');
            $table->string('NOMBRE', 100);
            $table->decimal('PONDERACION', 5, 2);
            $table->foreignId('ESTUDIANTE_CUP_ID')->constrained('ESTUDIANTE_CUP', 'ID')->onDelete('cascade');
            $table->foreignId('CLASE_ID')->constrained('CLASE', 'ID')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('CALIFICACIONES');
    }
};
