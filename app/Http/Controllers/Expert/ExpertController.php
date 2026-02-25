<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Triage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExpertController extends Controller
{
    /**
     * EL RADAR: Muestra casos disponibles (Sin experto asignado)
     */
    public function index()
    {
        $availableCases = Triage::with(['pet', 'user'])
            ->whereNull('expert_id')
            // AQUI AGREGAMOS 'waiting_decision'
            ->whereIn('status', ['pending_payment', 'waiting_expert', 'waiting_decision'])
            ->where(function($q) {
                $q->whereNull('user_decision')
                  ->orWhere('user_decision', '!=', 'goto_clinic');
            })
            ->orderByRaw("FIELD(priority, 'critical', 'medium', 'low')")
            ->latest()
            ->get();

        return Inertia::render('Expert/Dashboard', [
            'availableCases' => $availableCases
        ]);
    }

    /**
     * TOMAR CASO: El momento de la verdad
     */
    public function acceptCase($id)
    {
        // Usamos una transacción para evitar conflictos si 2 doctores clickean a la vez
        return DB::transaction(function () use ($id) {
            
            // Bloqueamos la fila para lectura hasta que terminemos (Lock For Update)
            $triage = Triage::lockForUpdate()->find($id);

            if (!$triage) {
                return back()->with('error', 'El caso ya no existe.');
            }

            // Verificamos si alguien nos ganó por un milisegundo
            if ($triage->expert_id !== null) {
                return back()->with('error', '¡Lo sentimos! Otro experto tomó este caso hace un instante.');
            }

            // Si está libre, nos lo asignamos
            $triage->update([
                'expert_id' => Auth::id(),
                // Nota: No cambiamos el status aún. 
                // Si estaba 'pending_payment', sigue así pero ahora es NUESTRO.
                // Si estaba 'waiting_expert', sigue así y ya veremos el link.
            ]);

            return redirect()->route('expert.case.show', $triage->id)
                ->with('message', 'Caso aceptado exitosamente.');
        });
    }

    /**
     * AREA DE TRABAJO: Donde ocurre la magia (Lo haremos en el siguiente paso)
     */
    public function showCase($id)
    {
        $triage = Triage::with(['pet.user'])->findOrFail($id);

        // Seguridad: Solo el experto dueño puede ver esto
        if ($triage->expert_id !== Auth::id()) {
            abort(403, 'No tienes permiso para ver este caso.');
        }

        return Inertia::render('Expert/ShowCase', [
            'triage' => $triage
        ]);
    }
}