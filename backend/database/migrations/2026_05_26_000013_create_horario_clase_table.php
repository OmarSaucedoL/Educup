<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('HORARIO_CLASE', function (Blueprint $table) {
            $table->foreignId('HORARIO_ID')->constrained('HORARIO', 'ID')->onDelete('cascade');
            $table->foreignId('CLASE_ID')->constrained('CLASE', 'ID')->onDelete('cascade');

            $table->primary(['HORARIO_ID', 'CLASE_ID']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('HORARIO_CLASE');
    }
};