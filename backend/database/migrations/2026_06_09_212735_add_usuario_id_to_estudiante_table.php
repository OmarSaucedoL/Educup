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
        Schema::table('ESTUDIANTE', function (Blueprint $table) {
            $table->unsignedBigInteger('USUARIO_ID')->nullable()->after('ESTADO');
            $table->foreign('USUARIO_ID')->references('ID')->on('USUARIO')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ESTUDIANTE', function (Blueprint $table) {
            $table->dropForeign(['USUARIO_ID']);
            $table->dropColumn('USUARIO_ID');
        });
    }
};
