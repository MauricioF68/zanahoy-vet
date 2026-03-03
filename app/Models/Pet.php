<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'breed',
        'age_human_years',
        'is_profile_complete',
        'birth_date',
        'gender',
        'medical_notes',
        'photo_path',
    ];

    // Relación inversa: Una mascota pertenece a un usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function triages()
    {
        return $this->hasMany(Triage::class);
    }
}
