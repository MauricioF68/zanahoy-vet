<?php

namespace Database\Seeders;

use App\Models\Specialty;
use Illuminate\Database\Seeder;

class SpecialtySeeder extends Seeder
{
    public function run(): void
    {
        $specialties = [
            ['name' => 'Cirugía General', 'description' => 'Procedimientos quirúrgicos básicos y avanzados.'],
            ['name' => 'Dermatología', 'description' => 'Cuidado de la piel y tratamiento de alergias.'],
            ['name' => 'Medicina Interna', 'description' => 'Diagnóstico y tratamiento de enfermedades internas.'],
            ['name' => 'Traumatología', 'description' => 'Atención de fracturas y problemas óseos.'],
            ['name' => 'Nutrición Veterinaria', 'description' => 'Dietas especializadas y control de peso.'],
            ['name' => 'Emergencias y Cuidados Críticos', 'description' => 'Atención inmediata de alto riesgo.'],
        ];

        foreach ($specialties as $specialty) {
            Specialty::create($specialty);
        }
    }
}