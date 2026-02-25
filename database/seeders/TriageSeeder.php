<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Species;
use App\Models\SymptomCategory;
use App\Models\Symptom;

class TriageSeeder extends Seeder
{
    public function run()
    {
        // 1. CREAR ESPECIES
        // Usamos firstOrCreate para evitar duplicados si corres el seeder varias veces
        $dog = Species::firstOrCreate(['slug' => 'dog'], ['name' => 'Perro']);
        $cat = Species::firstOrCreate(['slug' => 'cat'], ['name' => 'Gato']);

        // 2. CREAR CATEGORÍAS (ESPECÍFICAS POR ESPECIE)
        
        // --- PARA PERROS ---
        $catDigestivoDog = SymptomCategory::create(['species_id' => $dog->id, 'name' => 'Digestivo Canino', 'icon' => '🦴']);
        $catRespiratorioDog = SymptomCategory::create(['species_id' => $dog->id, 'name' => 'Respiratorio', 'icon' => '🫁']);
        
        // --- PARA GATOS ---
        $catDigestivoCat = SymptomCategory::create(['species_id' => $cat->id, 'name' => 'Digestivo Felino', 'icon' => '🐟']);
        $catPielCat = SymptomCategory::create(['species_id' => $cat->id, 'name' => 'Piel y Pelaje', 'icon' => '🧶']);

        // 3. CREAR SÍNTOMAS (Ahora ligados solo a la categoría)
        
        $sintomas = [
            // SÍNTOMAS DE PERRO (Digestivo)
            [
                'category_id' => $catDigestivoDog->id,
                'name' => 'Vómito con espuma blanca',
                'weight' => 6,
                'hint' => 'Posible gastritis o ayuno prolongado.',
            ],
            // SÍNTOMAS DE PERRO (Respiratorio)
            [
                'category_id' => $catRespiratorioDog->id,
                'name' => 'Tos seca (Tos de perro)',
                'weight' => 5,
                'hint' => 'Sospecha de Tos de las Perreras.',
            ],

            // SÍNTOMAS DE GATO (Digestivo)
            [
                'category_id' => $catDigestivoCat->id,
                'name' => 'Vómito de bolas de pelo',
                'weight' => 2,
                'hint' => 'Normal si es esporádico. Dar malta.',
            ],
            // SÍNTOMAS DE GATO (Piel)
            [
                'category_id' => $catPielCat->id,
                'name' => 'Alopecia (Calvas) por lamido',
                'weight' => 4,
                'hint' => 'Signo de estrés o alergia a pulgas.',
            ],
        ];

        foreach ($sintomas as $data) {
            Symptom::create([
                'symptom_category_id' => $data['category_id'],
                'name' => $data['name'],
                'weight' => $data['weight'],
                'medical_hint' => $data['hint'],
            ]);
        }
    }
}