<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('BITACORA', function (Blueprint $table) {
            $table->id('ID_BITACORA');
            $table->foreignId('USUARIO_ID')->nullable()->constrained('USUARIO', 'ID')->onDelete('set null');
            $table->string('ACCION');
            $table->string('TABLA')->nullable();
            $table->unsignedBigInteger('REGISTRO_ID')->nullable();
            $table->text('DESCRIPCION');
            $table->string('IP_DIRECCION', 45)->nullable();
            $table->timestamp('FECHA_REGISTRO')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('BITACORA');
    }
};
