<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClinicProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ClinicRegisterController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validación de los datos de la clínica
        $request->validate([
            'name' => 'required|string|max:255', // Nombre del representante
            'commercial_name' => 'required|string|max:255', // Nombre de la veterinaria
            'email' => 'required|string|email|max:255|unique:users',
            'ruc' => 'required|string|size:11|unique:clinic_profiles', // RUC en Perú tiene 11 dígitos
            'phone' => 'nullable|string|max:20',
            'address' => 'required|string|max:500',
            'has_hospitalization' => 'required|boolean',
        ]);

        // 2. Ejecutar el guardado en bloque
        DB::transaction(function () use ($request) {
            
            // Creamos el usuario con rol 'clinic'
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make('clinica123'), // Password temporal
                'phone' => $request->phone,
                'role' => 'clinic',
                'status' => 'pending',
            ]);

            // Creamos el perfil de la clínica
            ClinicProfile::create([
                'user_id' => $user->id,
                'ruc' => $request->ruc,
                'commercial_name' => $request->commercial_name,
                'address' => $request->address,
                'has_hospitalization' => $request->has_hospitalization,
                'emergency_services' => $request->emergency_services,
            ]);
        });

        return redirect()->route('register.select')->with('message', 'Registro de clínica enviado. Pendiente de aprobación.');
    }
}