<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Ejecutar el Seeder del ADMIN
        $this->call(AdminUserSeeder::class);

        // 2. Ejecutar el Seeder de TRIAJE (Especies, Categorías, Síntomas)
        $this->call(TriageSeeder::class);

        // 3. Crear un USUARIO CLIENTE de prueba (Opcional, para pruebas rápidas)
        User::firstOrCreate(
            ['email' => 'cliente@zanahoy.com'],
            [
                'name' => 'Cliente Prueba',
                'password' => Hash::make('12345678'),
                'role' => 'client',
                'email_verified_at' => now(),
            ]
        );

        // Si tienes otros seeders (como SpecialtySeeder), agrégalos aquí:
        $this->call(SpecialtySeeder::class);  
        $this->call(AdminUserSeeder::class);           
        $this->call(TriageSeeder::class);
        $this->call(ExpertSeeder::class);
    }
}