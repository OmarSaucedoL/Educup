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
        Schema::table('CLASE', function (Blueprint $table) {
            $table->foreignId('DOCENTE_CUP_ID')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('CLASE', function (Blueprint $table) {
            $table->foreignId('DOCENTE_CUP_ID')->nullable(false)->change();
        });
    }
};
