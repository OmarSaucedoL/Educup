<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('CUP', function (Blueprint $table) {
            $table->id('ID');
            $table->integer('ANIO');
            $table->string('SEMESTRE');
            $table->decimal('NOTA_MINIMA', 8, 2);
            $table->integer('CUPOS');
            $table->date('FECHA_INICIO');
            $table->date('FECHA_FIN');
            
            $table->foreignId('USUARIO_ID')->constrained('USUARIO', 'ID')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('CUP');
    }
};
