<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ESTUDIANTE', function (Blueprint $table) {
            $table->id('ID');
            $table->integer('CARNET')->unique();
            $table->string('NOMBRE');
            $table->string('APELLIDO');
            $table->date('FECHA_NAC');
            $table->string('DIRECCION');
            $table->string('TELEFONO');
            $table->string('CORREO')->unique();
            $table->boolean('TITULO_BACHILLER');
            $table->string('SEXO');
            $table->string('ESTADO')->default('INSCRITO');
            
            $table->foreignId('COLEGIO_ID')->constrained('COLEGIO', 'ID')->onDelete('restrict');
            $table->foreignId('CIUDAD_ID')->constrained('CIUDAD', 'ID')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ESTUDIANTE');
    }
};
