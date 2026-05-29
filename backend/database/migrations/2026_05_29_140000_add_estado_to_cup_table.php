<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('CUP', function (Blueprint $table) {
            $table->string('ESTADO')->default('INSCRIPCIONES');
        });
    }

    public function down(): void
    {
        Schema::table('CUP', function (Blueprint $table) {
            $table->dropColumn('ESTADO');
        });
    }
};
