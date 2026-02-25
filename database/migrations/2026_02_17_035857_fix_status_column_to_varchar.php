<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // <--- IMPORTANTE IMPORTAR ESTO

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Forzamos a la base de datos a cambiar la columna 'status' a TEXTO (VARCHAR)
        // Esto permite guardar 'waiting_decision', 'derived_to_clinic', etc.
        DB::statement("ALTER TABLE triages MODIFY COLUMN status VARCHAR(255) NOT NULL DEFAULT 'pending_payment'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // (Opcional) Si quisieras volver atrás, tendrías que redefinir el ENUM
        // DB::statement("ALTER TABLE triages MODIFY COLUMN status ENUM('pending_payment', 'waiting_expert', 'in_progress', 'completed') NOT NULL DEFAULT 'pending_payment'");
    }
};