<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('CARRERA', function (Blueprint $table) {
            $table->id('ID_CARRERA');
            $table->string('NOMBRE', 150);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('CARRERA');
    }
};
