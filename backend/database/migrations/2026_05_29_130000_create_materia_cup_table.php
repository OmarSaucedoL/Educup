<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('MATERIA_CUP', function (Blueprint $table) {
            $table->id('ID');
            $table->foreignId('ID_CUP')->constrained('CUP', 'ID_CUP')->onDelete('cascade');
            $table->foreignId('ID_MATERIA')->constrained('MATERIA', 'ID_MATERIA')->onDelete('cascade');
            
            $table->unique(['ID_CUP', 'ID_MATERIA']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('MATERIA_CUP');
    }
};
