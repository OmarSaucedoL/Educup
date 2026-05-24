<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('RESULTADO', function (Blueprint $table) {
            $table->id('ID');
            $table->foreignId('ESTUDIANTE_ID')->constrained('ESTUDIANTE', 'ID')->onDelete('cascade');
            $table->decimal('NOTA_FINAL', 5, 2);
            $table->string('CARRERA');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('RESULTADO');
    }
};
