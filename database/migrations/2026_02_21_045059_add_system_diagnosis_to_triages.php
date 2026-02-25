<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('triages', function (Blueprint $table) {
            // Agregamos el campo después de la descripción
            $table->text('system_diagnosis')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('triages', function (Blueprint $table) {
            $table->dropColumn('system_diagnosis');
        });
    }
};