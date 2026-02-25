<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $url;

    public function __construct(User $user)
    {
        $this->user = $user;
        // Creamos una URL firmada que expire en 24 horas por seguridad
        $this->url = url("/finish-registration/{$user->id}"); 
    }

    public function build()
    {
        return $this->subject('¡Felicidades! Tu solicitud en Zanahoy ha sido aprobada')
                    ->html("
                        <div style='font-family: sans-serif; padding: 20px; color: #333;'>
                            <h2 style='color: #ea580c;'>¡Hola, {$this->user->name}!</h2>
                            <p>Nos alegra informarte que tu solicitud para unirte a <strong>Zanahoy</strong> como " . ($this->user->role == 'expert' ? 'Veterinario' : 'Clínica') . " ha sido aprobada.</p>
                            <p>Para activar tu cuenta y establecer tu contraseña, haz clic en el siguiente botón:</p>
                            <a href='{$this->url}' style='display: inline-block; padding: 12px 25px; background-color: #ea580c; color: white; text-decoration: none; border-radius: 10px; font-weight: bold;'>Completar mi Registro</a>
                            <p style='margin-top: 20px; font-size: 0.8em; color: #666;'>Este enlace expirará en 24 horas.</p>
                        </div>
                    ");
    }
}