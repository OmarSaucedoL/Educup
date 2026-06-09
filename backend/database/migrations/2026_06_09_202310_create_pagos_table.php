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
        Schema::create('PAGO', function (Blueprint $table) {
            $table->id('ID_PAGO');
            $table->foreignId('ESTUDIANTE_CUP_ID')->constrained('ESTUDIANTE_CUP', 'ID')->onDelete('cascade');
            $table->string('PAYPAL_ORDER_ID', 100)->unique();
            $table->decimal('MONTO', 8, 2);
            $table->string('ESTADO', 50)->default('COMPLETADO');
            $table->dateTime('FECHA_PAGO')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PAGO');
    }
};
