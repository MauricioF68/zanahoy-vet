<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Pet;
use App\Models\Triage;
use App\Models\Species;
use App\Models\Symptom;
use App\Models\SymptomCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class DashboardController extends Controller
{
    /**
     * Muestra el Dashboard principal del cliente.
     */
    /**
     * Muestra el Dashboard principal del cliente.
     */
    public function index()
    {
        $user = Auth::user();

        // 1. Mascotas del usuario (¡AHORA CARGANDO SU HISTORIAL MÉDICO!)
        $pets = Pet::with(['triages' => function($query) {
            $query->orderBy('created_at', 'desc'); // Traemos las consultas más recientes primero
        }])
        ->where('user_id', $user->id)
        ->latest()
        ->get();

        // 2. Lista de Especies (Para el select de "Nueva Mascota")
        $speciesList = Species::where('is_active', true)->get();
        
        // 3. Categorías y Síntomas (El menú completo)
        $symptomCategories = SymptomCategory::with(['species', 'symptoms' => function($query) {
            $query->where('is_active', true);
        }])->get();

        return Inertia::render('Client/Dashboard', [
            'pets' => $pets,
            'userName' => $user->name,
            'speciesList' => $speciesList,
            'symptomCategories' => $symptomCategories,
            'flash' => [
                'message' => session('message')
            ]
        ]);
    }

    /**
     * Registro rápido de mascota.
     */
    public function storeQuickPet(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50',
            'type' => 'required|string',
            'breed' => 'required|string|max:50',
            'age_human_years' => 'required|string|max:20',
        ]);

        Pet::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'type' => $request->type,
            'breed' => $request->breed,
            'age_human_years' => $request->age_human_years,
            'is_profile_complete' => false,
        ]);

        return Redirect::back()->with('message', 'Mascota registrada. Continúa seleccionando los síntomas.');
    }

    /**
     * Procesar el Triaje.
     */
    /**
     * Procesar el Triaje (CON IA DE COMBOS)
     */
    /**
     * Procesar el Triaje (CON IA DE COMBOS + FINANZAS AUTOMÁTICAS)
     */
    public function storeTriage(Request $request)
    {
        $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'symptoms' => 'required|array|min:1',
            'description' => 'nullable|string'
        ]);
        
        $pet = Pet::findOrFail($request->pet_id);
        $userSymptoms = $request->symptoms; 

        // 1. CÁLCULO CLÁSICO
        $selectedSymptoms = Symptom::whereIn('id', $userSymptoms)->get();
        $totalWeight = $selectedSymptoms->sum('weight');

        // 2. EL CEREBRO DE COMBOS
        $matchedCombo = null;
        $systemDiagnosis = null;

        $species = Species::where('slug', $pet->type)->orWhere('name', $pet->type)->first();

        if ($species) {
            $combos = \App\Models\SymptomCombo::with('symptoms')
                        ->where('species_id', $species->id)
                        ->orderByRaw("FIELD(priority, 'critical', 'medium', 'low')") 
                        ->get();

            foreach ($combos as $combo) {
                $comboSymptomIds = $combo->symptoms->pluck('id')->toArray();
                $intersection = array_intersect($comboSymptomIds, $userSymptoms);
                
                if (count($intersection) === count($comboSymptomIds) && count($comboSymptomIds) > 0) {
                    $matchedCombo = $combo;
                    $systemDiagnosis = $combo->system_diagnosis;
                    break; 
                }
            }
        }

        // 3. DEFINIR PRIORIDAD Y ESTADO FINAL
        if ($matchedCombo) {
            $priority = $matchedCombo->priority;
        } else {
            if ($totalWeight >= 15) {
                $priority = 'critical';
            } elseif ($totalWeight >= 6) {
                $priority = 'medium';
            } else {
                $priority = 'low';
            }
        }

        if ($priority === 'critical') {
            $status = 'waiting_decision'; 
        } else {
            $status = 'pending_payment';
        }

        // --- 💰 NUEVO: LÓGICA DE PRECIOS AUTOMÁTICA ---
        // Puedes cambiar estos montos según tu modelo de negocio
        $amount = ($priority === 'critical') ? 50.00 : 30.00;

        // 4. GUARDAR EL TRIAJE
        $triage = Triage::create([
            'user_id' => Auth::id(),
            'pet_id' => $request->pet_id,
            'symptoms' => json_encode($userSymptoms),
            'description' => $request->description,
            'priority' => $priority,
            'status' => $status,
            'system_diagnosis' => $systemDiagnosis,
            'amount' => $amount // Guardamos el precio
        ]);

        // --- 🧾 NUEVO: GENERAR CÓDIGO ÚNICO (Ej: FAC-00015) ---
        // Usamos str_pad para que siempre tenga 5 ceros a la izquierda
        $paymentCode = 'FAC-' . str_pad($triage->id, 5, '0', STR_PAD_LEFT);
        $triage->update(['payment_code' => $paymentCode]);

        // 5. REDIRECCIÓN
        if ($priority === 'critical') {
            return redirect()->route('triage.critical', $triage->id);
        } else {
            return redirect()->route('triage.show', $triage->id);
        }
    }

    /**
     * VISTA: Resultado Normal (Verde/Amarillo - Paga primero)
     * ESTA ERA LA QUE FALTABA
     */
    public function showTriage(Triage $triage)
    {
        if ($triage->user_id !== Auth::id()) abort(403);
        $triage->load('pet');

        return Inertia::render('Client/TriageResult', ['triage' => $triage]);
    }

    /**
     * VISTA: Resultado Crítico (Rojo - Videollamada directa)
     */
    public function showCriticalTriage(Triage $triage)
    {
        if ($triage->user_id !== Auth::id()) abort(403);
        $triage->load('pet');

        return Inertia::render('Client/CriticalResult', ['triage' => $triage]);
    }

    public function saveDecision(Request $request)
    {
        $request->validate([
            'triage_id' => 'required|exists:triages,id',
            'decision' => 'required|in:goto_clinic,request_accompaniment'
        ]);

        $triage = Triage::where('id', $request->triage_id)
                        ->where('user_id', Auth::id())
                        ->firstOrFail();

        // 1. Si elige clínica
        if ($request->decision === 'goto_clinic') {
            $triage->update([
                'user_decision' => 'goto_clinic',
                'status' => 'derived_to_clinic' // Estado final
            ]);
        } 
        // 2. Si pide ayuda virtual
        else {
            // GENERAMOS EL LINK AQUÍ MISMO
            $roomName = 'zanahoy-case-' . $triage->id . '-' . \Illuminate\Support\Str::random(5);
            $meetingLink = "https://meet.jit.si/" . $roomName;

            $triage->update([
                'user_decision' => 'request_accompaniment',
                'status' => 'in_progress', // ¡Listo para entrar!
                'meeting_link' => $meetingLink
            ]);
        }

        return back();
    }

    /**
     * Subir Comprobante de Pago
     */
    /**
     * Subir Comprobante de Pago (Y cambiar estado a En Revisión)
     */
    public function uploadPayment(Request $request)
    {
        $request->validate([
            'triage_id' => 'required|exists:triages,id',
            'payment_proof' => 'required|image|max:5120', // Max 5MB
        ]);

        $triage = Triage::where('id', $request->triage_id)
                        ->where('user_id', Auth::id())
                        ->firstOrFail();

        if ($request->hasFile('payment_proof')) {
            $path = $request->file('payment_proof')->store('payments', 'public');
            
            $triage->update([
                'payment_proof_path' => $path,
                'payment_status' => 'pending' // ⬅️ MAGIA: Esto activa el mensaje de "Validando Pago" en el frontend
            ]);
        }

        return back()->with('message', 'Comprobante subido. Esperando validación...');
    }

    /**
     * HISTORIAL CLÍNICO GENERAL (Vista con Pestañas)
     */
    public function generalHistory()
    {
        $user = Auth::user();

        // Traemos todas las mascotas del usuario con sus historiales médicos cerrados
        $pets = Pet::with(['triages' => function($query) {
            $query->where('is_attended', true)
                  ->orderBy('created_at', 'desc')
                  ->with('expert'); // Traemos al doctor también
        }])
        ->where('user_id', $user->id)
        ->get();

        return Inertia::render('Client/GeneralHistory', [
            'pets' => $pets
        ]);
    }

    /**
     * MÓDULO DE PAGOS: Estado de cuenta del cliente
     */
    public function myPayments()
    {
        $user = Auth::user();

        // Traemos todos los triajes del cliente (que generaron cobro)
        $allTriages = Triage::with('pet')
            ->where('user_id', $user->id)
            ->whereNotNull('payment_status') // Solo los que pasaron por caja
            ->orderBy('created_at', 'desc')
            ->get();

        // Separamos en 3 cajas perfectas para el Frontend
        $pendingPayments = $allTriages->where('payment_status', 'debtor')->values();
        
        $inValidation = $allTriages->where('payment_status', 'pending')
                                   ->whereNotNull('payment_proof_path')
                                   ->values();
                                   
        $paidHistory = $allTriages->where('payment_status', 'paid')->values();

        return Inertia::render('Client/Payments', [
            'pendingPayments' => $pendingPayments,
            'inValidation' => $inValidation,
            'paidHistory' => $paidHistory
        ]);
    }


}