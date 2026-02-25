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
        // Cambiamos la columna a String para tener flexibilidad de estados
        // OJO: Esto es seguro porque MySQL permite convertir ENUM a VARCHAR
        Schema::table('triages', function (Blueprint $table) {
            $table->string('status')->change(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('triages', function (Blueprint $table) {
            //
        });
    }
};
