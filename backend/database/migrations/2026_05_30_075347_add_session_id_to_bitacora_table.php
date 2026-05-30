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
        Schema::table('BITACORA', function (Blueprint $table) {
            $table->string('SESSION_ID')->nullable()->after('USUARIO_ID');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('BITACORA', function (Blueprint $table) {
            $table->dropColumn('SESSION_ID');
        });
    }
};
