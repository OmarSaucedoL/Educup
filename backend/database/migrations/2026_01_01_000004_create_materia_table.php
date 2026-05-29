<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('MATERIA', function (Blueprint $table) {
            $table->id('ID_MATERIA');
            $table->string('NOMBRE');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('MATERIA');
    }
};
