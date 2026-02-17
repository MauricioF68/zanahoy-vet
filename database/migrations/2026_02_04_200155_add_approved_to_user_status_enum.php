<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Transformamos el ENUM en STRING para que acepte 'approved' y otros estados futuros
            $table->string('status')->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Por si necesitamos volver atrás, regresamos al ENUM original
            $table->enum('status', ['pending', 'active', 'inactive', 'rejected'])->default('pending')->change();
        });
    }
};
