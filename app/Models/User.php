<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // --- RELACIONES PARA EL PANEL DE ADMINISTRACIÓN ---

    /**
     * Relación con el perfil de Experto
     */
    public function expertProfile(): HasOne
    {
        return $this->hasOne(ExpertProfile::class);
    }

    /**
     * Relación con el perfil de Clínica
     */
    public function clinicProfile(): HasOne
    {
        return $this->hasOne(ClinicProfile::class);
    }

    /**
     * Relación con el perfil de Cliente
     */
    public function clientProfile(): HasOne
    {
        return $this->hasOne(ClientProfile::class);
    }
}
