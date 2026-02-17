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
    public function approvePayment($id)
    {
        $triage = Triage::findOrFail($id);

        // Solo actuamos si está esperando pago
        if ($triage->status === 'pending_payment') {
            
            // 1. Generamos el Link de Jitsi Automático
            // Ej: https://meet.jit.si/zanahoy-case-15-xky7z
            $roomName = 'zanahoy-case-' . $triage->id . '-' . Str::random(5);
            $meetingLink = "https://meet.jit.si/" . $roomName;

            // 2. Actualizamos el estado
            $triage->update([
                'status' => 'waiting_expert', // Ahora los doctores lo pueden ver
                'meeting_link' => $meetingLink,
                'is_paid' => true // (Asumiendo que agregaremos este campo luego, o usamos el status)
            ]);
            
            // AQUÍ IRÍA LA LÓGICA DE NOTIFICACIÓN PUSH A LOS VETERINARIOS
            // Notification::send($experts, new NewCaseAvailable($triage));
        }

        return back()->with('message', 'Pago validado. El caso está visible para los expertos.');
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