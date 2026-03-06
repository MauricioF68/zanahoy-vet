<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ClientProfileController extends Controller
{
    /**
     * Muestra el formulario para editar el perfil del cliente.
     */
    public function edit()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->load('clientProfile'); 

        return Inertia::render('Client/Profile', [
            'user' => $user,
        ]);
    }

    /**
     * Actualiza la información del perfil en la BD.
     */
    public function update(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $existingProfile = $user->clientProfile;

        // 1. Validamos los datos 
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            // El DNI solo se valida si NO existe previamente
            'dni' => $existingProfile && $existingProfile->dni ? 'nullable' : 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        // 2. Actualizamos la tabla users
        $user->update([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);

        // 3. Preparamos los datos del perfil
        $profileData = [
            'address' => $request->address,
            'emergency_contact' => $request->emergency_contact,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ];

        // 🔒 REGLA DE INMUTABILIDAD DEL DNI: 
        // Solo guardamos el DNI si el usuario no tenía uno antes.
        if (!$existingProfile || empty($existingProfile->dni)) {
            $profileData['dni'] = $request->dni;
        }

        // 4. Actualizamos o Creamos la tabla client_profiles
        $user->clientProfile()->updateOrCreate(
            ['user_id' => $user->id], 
            $profileData
        );

        return back()->with('message', '¡Tu perfil ha sido actualizado con éxito!');
    }
}