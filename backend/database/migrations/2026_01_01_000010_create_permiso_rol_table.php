<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('PERMISO_ROL', function (Blueprint $table) {
            $table->foreignId('ROL_ID')->constrained('ROL', 'ID')->onDelete('cascade');
            $table->foreignId('PERMISOS_ID')->constrained('PERMISOS', 'ID')->onDelete('cascade');
            
            $table->primary(['ROL_ID', 'PERMISOS_ID']);
            
            $table->string('ESTADO');
            $table->timestamp('FECHA_MOD');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('PERMISO_ROL');
    }
};
