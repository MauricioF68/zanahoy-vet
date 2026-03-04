<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Specialty;

class ExpertProfileController extends Controller
{
    /**
     * Muestra el formulario con los datos actuales del experto.
     */
    public function edit(Request $request)
    {
        // Traemos al usuario logueado, pero cargamos su perfil y sus especialidades
        $user = $request->user()->load(['expertProfile.specialties']);
        
        // También necesitamos enviar TODAS las especialidades activas para que pueda elegir nuevas
        $allSpecialties = Specialty::where('is_active', true)->get();

        return Inertia::render('Expert/Profile/Edit', [
            'user' => $user,
            'allSpecialties' => $allSpecialties,
            // Extraemos solo los IDs de las especialidades que ya tiene para el checkbox
            'currentSpecialtyIds' => $user->expertProfile->specialties->pluck('id')->toArray(),
        ]);
    }

    /**
     * Actualiza la tabla users y la tabla expert_profiles.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        // 1. Validamos todos los campos
        $validated = $request->validate([
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'academic_level' => 'required|in:estudiante,bachiller,titulado',
            'university' => 'required|string|max:255',
            'current_cycle' => 'required_if:academic_level,estudiante|nullable|integer|between:1,12',
            'license_number' => 'required_if:academic_level,titulado|nullable|string|max:50',
            'bio' => 'nullable|string|max:1000',
            'selected_specialties' => 'required|array|min:1',
        ]);

        // 2. Transacción segura para actualizar ambas tablas
        DB::transaction(function () use ($user, $validated) {
            
            // Actualizamos el teléfono en la tabla users
            $user->update([
                'phone' => $validated['phone'],
            ]);

            // Actualizamos los datos médicos en expert_profiles
            $user->expertProfile()->update([
                'address' => $validated['address'],
                'academic_level' => $validated['academic_level'],
                'university' => $validated['university'],
                'current_cycle' => $validated['academic_level'] === 'estudiante' ? $validated['current_cycle'] : null,
                'license_number' => $validated['academic_level'] === 'titulado' ? $validated['license_number'] : null,
                'bio' => $validated['bio'],
            ]);

            // Sincronizamos (reemplazamos) las especialidades en la tabla intermedia
            $user->expertProfile->specialties()->sync($validated['selected_specialties']);
        });

        // 3. Regresamos con el mensaje de éxito (que leerá flash.message en React)
        return back()->with('message', 'Tu perfil profesional ha sido actualizado correctamente.');
    }
}