<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SymptomCategory extends Model
{
    protected $guarded = [];

    // RELACIÓN 1: Pertenece a una Especie (Perro O Gato, no ambos)
    public function species()
    {
        return $this->belongsTo(Species::class);
    }

    // RELACIÓN 2: Tiene muchos síntomas
    public function symptoms()
    {
        return $this->hasMany(Symptom::class);
    }
}