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
    /**
     * TOMAR CASO: El momento de la verdad (VERSIÓN CORREGIDA)
     */
    public function acceptCase($id)
    {
        // 1. Hacemos la operación de Base de Datos y capturamos el resultado
        $resultado = DB::transaction(function () use ($id) {
            
            $triage = Triage::lockForUpdate()->find($id);

            if (!$triage) {
                return ['error' => 'El caso ya no existe.'];
            }

            if ($triage->expert_id !== null) {
                return ['error' => '¡Lo sentimos! Otro experto tomó este caso.'];
            }

            // Asignamos el experto
            $triage->update([
                'expert_id' => Auth::id(),
            ]);

            return ['success' => true, 'triage_id' => $triage->id];
        });

        // 2. Si hubo error, recargamos con el mensaje
        if (isset($resultado['error'])) {
            return back()->with('error', $resultado['error']);
        }

        // 3. Si fue éxito, REDIRIGIMOS (Fuera de la transacción de BD)
        return redirect()->route('expert.case.show', $resultado['triage_id'])
            ->with('message', 'Caso aceptado exitosamente.');
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