<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = ['name', 'requires_bank', 'is_active'];
}