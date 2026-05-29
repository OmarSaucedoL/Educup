<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('DOCENTE', function (Blueprint $table) {
            $table->unsignedBigInteger('CODIGO_DOCENTE');
            $table->primary('CODIGO_DOCENTE');
            
            $table->foreign('CODIGO_DOCENTE')->references('ID')->on('USUARIO')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('DOCENTE');
    }
};
