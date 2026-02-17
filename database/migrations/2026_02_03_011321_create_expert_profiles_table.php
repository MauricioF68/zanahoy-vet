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
    Schema::create('expert_profiles', function (Blueprint $table) {
        $table->id();
        // Relación con el usuario
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // Ubicación para visitas domiciliarias
        $table->string('address');
        $table->decimal('latitude', 10, 8)->nullable();
        $table->decimal('longitude', 11, 8)->nullable();
        $table->boolean('offers_home_visit')->default(false);
        $table->decimal('coverage_radius_km', 5, 2)->default(5.00);

        // Nivel Académico
        $table->enum('academic_level', ['estudiante', 'bachiller', 'titulado']);
        $table->string('university');
        $table->integer('current_cycle')->nullable(); // Solo para estudiantes
        $table->string('license_number')->nullable(); // Solo para titulados
        
        // Información adicional
        $table->text('bio')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expert_profiles');
    }
};
