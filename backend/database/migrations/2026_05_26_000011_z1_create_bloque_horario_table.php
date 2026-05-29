<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('BLOQUE_HORARIO', function (Blueprint $table) {
            $table->id('ID_BLOQUE_HORARIO');
            $table->string('TURNO', 50); // MAÑANA, TARDE, NOCHE
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('BLOQUE_HORARIO');
    }
};
