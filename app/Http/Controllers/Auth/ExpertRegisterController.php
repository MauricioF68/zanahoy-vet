<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ExpertProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ExpertRegisterController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validación de los datos que vienen del formulario React
        $request->validate([
            'name' => 'required|string|max:255',
            'dni' => 'required|string|size:8',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'academic_level' => 'required|in:estudiante,bachiller,titulado',
            'university' => 'required|string|max:255',
            'current_cycle' => 'required_if:academic_level,estudiante|nullable|integer|between:1,12',
            'license_number' => 'required_if:academic_level,titulado|nullable|string|max:50',
            'selected_specialties' => 'required|array|min:1',
        ]);

        // 2. Iniciamos una transacción. Si algo falla, la BD vuelve a su estado anterior.
        DB::transaction(function () use ($request) {
            
            // Creamos el registro en la tabla 'users'
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make('secret123'), // Contraseña temporal
                'phone' => $request->phone,
                'role' => 'expert',
                'status' => 'pending', // El admin lo debe activar después
            ]);

            // Creamos el perfil vinculado a ese usuario
            $profile = ExpertProfile::create([
                'user_id' => $user->id,
                'dni' => $request->dni,
                'address' => 'Dirección por definir en mapa', 
                'academic_level' => $request->academic_level,
                'university' => $request->university,
                'current_cycle' => $request->current_cycle,
                'license_number' => $request->license_number,
                'bio' => $request->bio,
            ]);

            // Guardamos las especialidades en la tabla intermedia (pivote)
            $profile->specialties()->attach($request->selected_specialties);
        });

        // 3. Redirigimos con un mensaje de éxito
        return redirect()->route('register.select')->with('message', '¡Solicitud enviada! Revisaremos tus datos pronto.');
    }
}