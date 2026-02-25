<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla principal del Combo
        Schema::create('symptom_combos', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ej: Alerta Parvovirus
            $table->foreignId('species_id')->constrained()->cascadeOnDelete(); // Perro o Gato
            $table->string('priority'); // critical, medium, low (La gravedad que va a forzar)
            $table->text('system_diagnosis')->nullable(); // El mensaje secreto para el médico
            $table->timestamps();
        });

        // 2. Tabla pivote (Para unir 1 combo con muchos síntomas)
        Schema::create('combo_symptom', function (Blueprint $table) {
            $table->id();
            $table->foreignId('symptom_combo_id')->constrained()->cascadeOnDelete();
            $table->foreignId('symptom_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('combo_symptom');
        Schema::dropIfExists('symptom_combos');
    }
};