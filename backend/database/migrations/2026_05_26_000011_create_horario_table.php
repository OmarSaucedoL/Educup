<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('HORARIO', function (Blueprint $table) {
            $table->id('ID');
            $table->string('DIA', 20); // 'LUNES', 'MARTES', etc.
            $table->time('HORA_INI');  // Ej: 07:30:00
            $table->time('HORA_FIN');  // Ej: 12:00:00
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('HORARIO');
    }
};