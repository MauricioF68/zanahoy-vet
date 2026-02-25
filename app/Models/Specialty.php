<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Specialty extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'is_active'];

    // Relación con los perfiles de expertos
    public function expertProfiles()
    {
        return $this->belongsToMany(ExpertProfile::class, 'expert_specialty');
    }
}