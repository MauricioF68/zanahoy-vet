<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('triages', function (Blueprint $table) {
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete();
            $table->foreignId('bank_id')->nullable()->constrained('banks')->nullOnDelete();
            $table->string('operation_number')->nullable();
            $table->dateTime('transaction_date')->nullable();
            $table->string('sender_name')->nullable();
            $table->boolean('is_audited')->default(false); // 🔒 El candado
        });
    }

    public function down(): void
    {
        Schema::table('triages', function (Blueprint $table) {
            $table->dropForeign(['payment_method_id']);
            $table->dropForeign(['bank_id']);
            $table->dropColumn(['payment_method_id', 'bank_id', 'operation_number', 'transaction_date', 'sender_name', 'is_audited']);
        });
    }
};