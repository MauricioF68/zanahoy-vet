<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Triage extends Model
{
    use HasFactory;

    protected $guarded = []; // Permite guardar todos los campos sin restricciones

    // Relación 1: El Triaje pertenece a un Cliente (User)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación 2: El Triaje es de una Mascota
    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    // Relación 3: El Triaje es atendido por un Experto (User) -> ESTA FALTABA
    public function expert()
    {
        return $this->belongsTo(User::class, 'expert_id');
    }
}