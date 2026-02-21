<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ExpertProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FinishRegistrationController extends Controller
{
    public function show($id)
    {
        $user = User::findOrFail($id);
        if ($user->status !== 'approved') {
            return redirect('/')->with('error', 'Enlace no válido.');
        }

        return Inertia::render('Auth/FinishRegistration', [
            'user_id' => $user->id,
            'userName' => $user->name,
            'email' => $user->email,
            'role'     => $user->role
        ]);
    }

    // --- NUEVO MÉTODO: Validación en tiempo real ---
    public function checkDni(Request $request)
    {
        $user = User::findOrFail($request->user_id);
        $isValid = false;

        if ($user->role === 'expert') {
            $isValid = ExpertProfile::where('user_id', $user->id)
                                    ->where('dni', $request->dni)
                                    ->exists();
        } elseif ($user->role === 'clinic') {
            // Buscamos por RUC en la tabla de clínicas
            $isValid = \App\Models\ClinicProfile::where('user_id', $user->id)
                                                ->where('ruc', $request->dni) // Reutilizamos el campo 'dni' del request como RUC
                                                ->exists();
        }

        return response()->json(['valid' => $isValid]);
    }

    public function store(Request $request)
    {
        $user = User::findOrFail($request->user_id);
        
        // Reglas dinámicas según el rol
        $documentLabel = $user->role === 'expert' ? 'DNI' : 'RUC';
        $documentSize = $user->role === 'expert' ? 8 : 11;

        $request->validate([
            'user_id'  => 'required|exists:users,id',
            'dni'      => "required|string|size:$documentSize",
            'password' => 'required|string|min:8|confirmed',
        ], [
            'dni.size' => "El $documentLabel debe tener exactamente $documentSize dígitos.",
        ]);

        // Verificación final de seguridad
        if ($user->role === 'expert') {
            $profile = ExpertProfile::where('user_id', $user->id)->where('dni', $request->dni)->first();
        } else {
            $profile = \App\Models\ClinicProfile::where('user_id', $user->id)->where('ruc', $request->dni)->first();
        }

        if (!$profile) {
            return back()->withErrors(['dni' => "Verificación de $documentLabel fallida."]);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'status'   => 'active',
        ]);

        Auth::login($user);
        return redirect()->route('dashboard');
    }
}