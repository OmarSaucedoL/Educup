<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('USUARIO', function (Blueprint $table) {
            $table->id('ID');
            $table->string('USERNAME')->unique();
            $table->string('CONTRASENIA');
            $table->integer('CARNET')->unique() ;
            $table->string('NOMBRE');
            $table->string('APELLIDO');
            $table->string('CORREO')->unique();
            $table->string('ESTADO');
            $table->timestamp('FECHA_CREACION');
            $table->string('REMEMBER_TOKEN', 100)->nullable();
            
            $table->foreignId('ROL_ID')->constrained('ROL', 'ID')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('USUARIO');
    }
};
