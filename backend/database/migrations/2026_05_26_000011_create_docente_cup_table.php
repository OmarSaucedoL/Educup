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
            $table->foreignId('DOCENTE_CODIGO')->constrained('DOCENTE', 'CODIGO')->onDelete('cascade');
            $table->foreignId('CUP_ID')->constrained('CUP', 'ID')->onDelete('cascade');
            $table->date('FECHA_CREACION')->useCurrent();

            $table->unique(['DOCENTE_CODIGO', 'CUP_ID']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('DOCENTE_CUP');
    }
};
