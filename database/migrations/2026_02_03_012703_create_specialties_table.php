<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('specialties', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Ej: Dermatología, Cirugía
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true); // Para que el admin pueda "desactivar" una especialidad
            $table->timestamps();
        });

        // Tabla intermedia para conectar Expertos con Especialidades (Muchos a Muchos)
        Schema::create('expert_specialty', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_profile_id')->constrained()->onDelete('cascade');
            $table->foreignId('specialty_id')->constrained()->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expert_specialty');
        Schema::dropIfExists('specialties');
    }
};