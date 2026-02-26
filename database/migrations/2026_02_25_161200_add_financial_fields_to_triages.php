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
            // 1. Código de Factura/Pago (Único para cada consulta)
            $table->string('payment_code')->nullable()->unique()->after('id');
            
            // 2. Monto a cobrar (Decimal para monedas: Ej. 50.00)
            $table->decimal('amount', 8, 2)->nullable()->after('priority');
            
            // 3. Estado netamente financiero (Separado del estado médico)
            // Estados posibles: pending (esperando), uploaded (voucher subido), paid (pagado), debtor (moroso)
            $table->string('payment_status')->default('pending')->after('status');
            
            // 4. ¿Fue atendido por el doctor? (Para saber si retener la receta o no)
            $table->boolean('is_attended')->default(false)->after('expert_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('triages', function (Blueprint $table) {
            $table->dropColumn(['payment_code', 'amount', 'payment_status', 'is_attended']);
        });
    }
};