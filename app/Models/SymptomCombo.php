<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SymptomCombo extends Model
{
    protected $guarded = []; // Permite guardado masivo

    // Un combo pertenece a una especie específica
    public function species()
    {
        return $this->belongsTo(Species::class);
    }

    // Un combo tiene muchos síntomas (Relación muchos a muchos)
    public function symptoms()
    {
        return $this->belongsToMany(Symptom::class, 'combo_symptom');
    }
}