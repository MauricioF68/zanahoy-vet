<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ExpertSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // EXPERTO 1: Dr. House
        User::create([
            'name' => 'Dr. Gregory House',
            'email' => 'experto1@experto.com',
            'password' => Hash::make('experto'),
            'role' => 'expert',
            'status' => 'approved', // Ya aprobado
            'email_verified_at' => now(), // Email verificado
            'phone' => '999999991'
            
        ]);

        // EXPERTO 2: Dra. Meredith Grey
        User::create([
            'name' => 'Dra. Meredith Grey',
            'email' => 'experto2@experto.com',
            'password' => Hash::make('experto'),
            'role' => 'expert',
            'status' => 'approved', // Ya aprobado
            'email_verified_at' => now(),
            'phone' => '999999992'
            
        ]);

        $this->command->info('¡Dos expertos creados exitosamente!');
    }
}