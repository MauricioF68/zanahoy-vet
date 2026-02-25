<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Species extends Model
{
    protected $guarded = [];

    // CAMBIO: Una especie tiene muchas Categorías de Síntomas
    public function categories()
    {
        return $this->hasMany(SymptomCategory::class);
    }
    
    // (Opcional) Podemos acceder a los síntomas a través de las categorías
    public function symptoms()
    {
        return $this->hasManyThrough(Symptom::class, SymptomCategory::class);
    }
}