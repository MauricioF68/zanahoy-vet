<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClientProfile; // Importamos el nuevo modelo
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // Importante para la transacción

class ClientRegisterController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validación de entrada
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        // 2. Usamos una transacción para crear User + Profile
        DB::transaction(function () use ($request) {
            
            // Creamos el registro base en la tabla 'users'
            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'client',
                'status'   => 'active',
            ]);

            // Creamos el perfil vinculado (vacío por ahora) en 'client_profiles'
            ClientProfile::create([
                'user_id' => $user->id,
                // Los demás campos quedan como NULL por ahora (DNI, address, etc.)
            ]);

            // Iniciamos sesión automáticamente una vez creado todo
            Auth::login($user);
        });

        // 3. Redirigimos al Dashboard
        return redirect()->route('dashboard');
    }
}