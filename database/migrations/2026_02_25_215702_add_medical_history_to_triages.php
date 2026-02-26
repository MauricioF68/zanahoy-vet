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
            // 1. El Titular (Lo único que verá el cliente si debe dinero)
            $table->string('presumptive_diagnosis')->nullable()->after('is_attended');
            
            // 2. Análisis del experto (Bloqueado si hay deuda)
            $table->text('anamnesis')->nullable()->after('presumptive_diagnosis');
            
            // 3. Medicamentos y dosis (Bloqueado si hay deuda)
            $table->text('prescription')->nullable()->after('anamnesis');
            
            // 4. Cuidados adicionales en casa (Bloqueado si hay deuda)
            $table->text('medical_instructions')->nullable()->after('prescription');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('triages', function (Blueprint $table) {
            $table->dropColumn([
                'presumptive_diagnosis',
                'anamnesis',
                'prescription',
                'medical_instructions'
            ]);
        });
    }
};