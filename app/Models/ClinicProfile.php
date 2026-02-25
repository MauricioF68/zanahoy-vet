<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ruc',
        'address',
        'commercial_name',
        'has_hospitalization',
        'emergency_services',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}