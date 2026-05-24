<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('PERMISOS_USUARIO', function (Blueprint $table) {
            $table->foreignId('USUARIO_ID')->constrained('USUARIO', 'ID')->onDelete('cascade');
            $table->foreignId('PERMISOS_ID')->constrained('PERMISOS', 'ID')->onDelete('cascade');
            
            $table->primary(['USUARIO_ID', 'PERMISOS_ID']);
            
            $table->string('ESTADO');
            $table->timestamp('FECHA_MOD');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('PERMISOS_USUARIO');
    }
};
