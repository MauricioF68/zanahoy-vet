<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserApprovedMail;

class RequestController extends Controller
{
    public function index()
    {
        // Obtenemos expertos y clínicas que están pendientes
        $requests = User::where('status', 'pending')
            ->whereIn('role', ['expert', 'clinic'])
            ->with(['expertProfile', 'clinicProfile']) // Cargamos sus perfiles
            ->latest()
            ->get();

        return Inertia::render('Admin/Requests/Index', [
            'requests' => $requests
        ]);
    }

    public function approve($id)
    {
        $user = User::findOrFail($id);
        
        // 1. Cambiamos el estado
        $user->update(['status' => 'approved']); 

        // 2. Enviamos el correo
        Mail::to($user->email)->send(new UserApprovedMail($user));

        return back()->with('message', '¡Solicitud aprobada y correo enviado con éxito!');
    }
}