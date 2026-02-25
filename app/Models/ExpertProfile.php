<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpertProfile extends Model
{
    use HasFactory;

    /**
     * Los atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'user_id',
        'dni',
        'address',
        'latitude',
        'longitude',
        'offers_home_visit',
        'coverage_radius_km',
        'academic_level',
        'university',
        'current_cycle',
        'license_number',
        'bio',
    ];

    /**
     * Relación: Un perfil pertenece a un usuario.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function specialties()
    {
        return $this->belongsToMany(Specialty::class, 'expert_specialty');
    }
}