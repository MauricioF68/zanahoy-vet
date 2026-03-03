<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Ej: 'precio_consulta', 'pin_auditoria', 'yape_qr'
            $table->text('value')->nullable(); // El valor (S/ 50.00, 1234, o la ruta de la imagen)
            $table->string('description')->nullable(); // Para que el admin sepa qué es
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};