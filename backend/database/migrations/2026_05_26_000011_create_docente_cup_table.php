<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('DOCENTE_CUP', function (Blueprint $table) {
            $table->id('ID');
            $table->foreignId('CODIGO_DOCENTE')->constrained('DOCENTE', 'CODIGO_DOCENTE')->onDelete('cascade');
            $table->foreignId('ID_CUP')->constrained('CUP', 'ID_CUP')->onDelete('cascade');
            $table->date('FECHA_CREACION')->useCurrent();

            $table->unique(['CODIGO_DOCENTE', 'ID_CUP']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('DOCENTE_CUP');
    }
};
