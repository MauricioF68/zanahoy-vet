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
            ->whereIn('status', ['pending_payment', 'waiting_expert', 'waiting_decision', 'in_progress'])
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

   public function acceptCase($id)
    {
        $resultado = DB::transaction(function () use ($id) {
            
            $triage = Triage::lockForUpdate()->find($id);

            if (!$triage) {
                return ['error' => 'El caso ya no existe.'];
            }

            if ($triage->expert_id !== null) {
                return ['error' => '¡Lo sentimos! Otro experto tomó este caso.'];
            }

            // --- CORRECCIÓN: Generar Jitsi si no existe (Para casos normales) ---
            $meetingLink = $triage->meeting_link;
            if (!$meetingLink) {
                $roomName = 'zanahoy-case-' . $triage->id . '-' . \Illuminate\Support\Str::random(5);
                $meetingLink = "https://meet.jit.si/" . $roomName;
            }

            // Asignamos el experto, el link de Jitsi y cambiamos el estado
            $triage->update([
                'expert_id' => Auth::id(),
                'status' => 'in_progress', // ¡CLAVE PARA DETENER LA RECARGA!
                'meeting_link' => $meetingLink
            ]);

            return ['success' => true, 'triage_id' => $triage->id];
        });

        // ... (El resto de la función queda igual con sus returns)
        if (isset($resultado['error'])) {
            return back()->with('error', $resultado['error']);
        }

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

    /**
     * CERRAR CASO: Guardar historial médico y aplicar reglas financieras
     */
    public function closeCase(Request $request, $id)
    {           
        $triage = Triage::findOrFail($id);

        // Seguridad: Solo el experto dueño puede cerrar esto
        if ($triage->expert_id !== Auth::id()) {
            abort(403, 'No tienes permiso para modificar este caso.');
        }

        // Validamos que al menos ponga el diagnóstico principal
        $request->validate([
            'presumptive_diagnosis' => 'required|string|max:255',
            'anamnesis' => 'nullable|string',
            'prescription' => 'nullable|string',
            'medical_instructions' => 'nullable|string',
        ]);

        // --- 💰 LA REGLA DE ORO FINANCIERA ---
        $newPaymentStatus = $triage->payment_status;
        
        // Si el pago seguía "pendiente" (porque era una emergencia crítica que pasó directo)
        // al momento de dar el alta, el cliente oficialmente se convierte en "deudor".
        if ($triage->payment_status === 'pending') {
            $newPaymentStatus = 'debtor';
        }

        // Guardamos todo en la base de datos
        $triage->update([
            'presumptive_diagnosis' => $request->presumptive_diagnosis,
            'anamnesis' => $request->anamnesis,
            'prescription' => $request->prescription,
            'medical_instructions' => $request->medical_instructions,
            'status' => 'completed', // El caso sale de emergencias
            'is_attended' => true,   // Confirmamos que el médico lo vio
            'payment_status' => $newPaymentStatus // Aplicamos el candado si aplica
        ]);

        return redirect()->route('expert.dashboard')->with('message', '¡Caso finalizado! El historial clínico ha sido guardado con éxito.');
    }
}