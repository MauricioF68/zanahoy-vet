<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Triage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class TriageController extends Controller
{
    /**
     * LA TORRE DE CONTROL (Bandeja de Entrada)
     */
    public function index()
    {
        // Traemos los triajes con toda la información necesaria
        // Ordenamos: Primero los Críticos, luego los recientes
        $triages = Triage::with(['pet.user', 'expert'])
            ->orderByRaw("FIELD(priority, 'critical', 'medium', 'low')") // Prioridad visual
            ->latest()
            ->get();

        return Inertia::render('Admin/Triages/Index', [
            'triages' => $triages
        ]);
    }

    /**
     * ACCIÓN 1: VALIDAR PAGO (Para casos Verdes/Amarillos)
     * Al aprobar, generamos el link y buscamos experto.
     */
    /**
     * ACCIÓN 1: VALIDAR PAGO (Para casos Verdes/Amarillos)
     * Al aprobar, generamos el link y buscamos experto.
     */
    /**
     * ACCIÓN 1: VALIDAR PAGO (Para casos Verdes/Amarillos)
     * Al aprobar, generamos el link y evaluamos si ya había experto.
     */
    /**
     * ACCIÓN 1: VALIDAR PAGO (Para abrir sala OR para desbloquear historial)
     */
    public function approvePayment($id)
    {
        $triage = Triage::findOrFail($id);

        // ESCENARIO A: Pago ANTES de la consulta (Genera Link de Videollamada)
        if ($triage->status === 'pending_payment') {
            
            $roomName = 'zanahoy-case-' . $triage->id . '-' . \Illuminate\Support\Str::random(5);
            $meetingLink = "https://meet.jit.si/" . $roomName;
            $newStatus = $triage->expert_id ? 'in_progress' : 'waiting_expert';

            $triage->update([
                'status' => $newStatus,
                'meeting_link' => $meetingLink,
                'is_paid' => true,
                'payment_status' => 'paid' 
            ]);
        }
        // ESCENARIO B: Pago DESPUÉS de la consulta (Quita el Candado del Historial)
        else if ($triage->status === 'completed' && $triage->payment_status === 'pending') {
            
            $triage->update([
                'is_paid' => true,
                'payment_status' => 'paid' // ⬅️ Esto destruye el candado al instante
            ]);
        }

        return back()->with('message', 'Pago validado. El sistema ha sido actualizado.');
    }

    /**
     * ACCIÓN 2: VER DETALLES (Opcional, para ver síntomas)
     */
    public function show($id)
    {
        // Por ahora lo manejaremos en el modal del Index, 
        // pero dejo esto por si queremos una página de detalle exclusiva.
    }
}