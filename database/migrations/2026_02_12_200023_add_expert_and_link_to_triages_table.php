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
        Schema::table('triages', function (Blueprint $table) {
            
            // 1. Agregar expert_id (Solo si NO existe previamente)
            if (!Schema::hasColumn('triages', 'expert_id')) {
                $table->foreignId('expert_id')->nullable()->after('pet_id')->constrained('users');
            }

            // 2. Agregar meeting_link (Solo si NO existe - Esto evitará tu error)
            if (!Schema::hasColumn('triages', 'meeting_link')) {
                $table->string('meeting_link')->nullable()->after('status');
            }

            // 3. Agregar is_paid (Solo si NO existe)
            if (!Schema::hasColumn('triages', 'is_paid')) {
                $table->boolean('is_paid')->default(false)->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('triages', function (Blueprint $table) {
            
            // Borramos expert_id si existe
            if (Schema::hasColumn('triages', 'expert_id')) {
                $table->dropForeign(['expert_id']);
                $table->dropColumn('expert_id');
            }

            // Borramos is_paid si existe
            if (Schema::hasColumn('triages', 'is_paid')) {
                $table->dropColumn('is_paid');
            }

            // NOTA: No borramos meeting_link aquí porque pertenece a tu tabla original
        });
    }
};