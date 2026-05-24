<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('GRUPO', function (Blueprint $table) {
            $table->id('ID');
            $table->integer('EST_MIN')->default(20);
            $table->integer('EST_MAX')->default(70);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('GRUPO');
    }
};
