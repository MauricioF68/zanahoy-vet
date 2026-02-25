<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('triages', function (Blueprint $table) {
            // Para saber si el usuario eligió "Ir a clínica" o "Acompañamiento"
            if (!Schema::hasColumn('triages', 'user_decision')) {
                $table->string('user_decision')->nullable()->after('priority'); 
            }
            // Para la foto del voucher
            if (!Schema::hasColumn('triages', 'payment_proof_path')) {
                $table->string('payment_proof_path')->nullable()->after('meeting_link');
            }
        });
    }

    public function down(): void
    {
        Schema::table('triages', function (Blueprint $table) {
            $table->dropColumn(['user_decision', 'payment_proof_path']);
        });
    }
};