<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        // Creamos el Admin usando firstOrCreate para que no de error si ya existe
        User::firstOrCreate(
            ['email' => 'admin@admin.com'], // Buscamos por este email
            [
                'name' => 'Admin Principal Prueba',
                'password' => Hash::make('admin'), // Contraseña: admin123
                'role' => 'admin', // <--- IMPORTANTE: Este rol define el acceso
                'email_verified_at' => now(),
            ]
        );
    }
}