<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Symptom extends Model
{
    protected $guarded = [];

    public function category()
    {
        return $this->belongsTo(SymptomCategory::class, 'symptom_category_id');
    }

    public function combos()
    {
        return $this->belongsToMany(SymptomCombo::class, 'combo_symptom');
    }
    
}