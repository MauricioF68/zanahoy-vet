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
    public function index()
    {
        $user = Auth::user();

        // 1. Mascotas del usuario
        $pets = Pet::where('user_id', $user->id)->latest()->get();

        // 2. Lista de Especies (Para el select de "Nueva Mascota")
        // Es vital enviar el 'slug' (dog, cat) y el 'id' para hacer el match
        $speciesList = Species::where('is_active', true)->get();
        
        // 3. Categorías y Síntomas (El menú completo)
        // Cargamos la relación 'species' para saber de quién es cada categoría
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
    public function storeTriage(Request $request)
    {
        $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'symptoms' => 'required|array|min:1',
            'description' => 'nullable|string'
        ]);
        
        // ... (Cálculo de pesos igual que antes) ...
        $selectedSymptoms = Symptom::whereIn('id', $request->symptoms)->get();
        $totalWeight = $selectedSymptoms->sum('weight');
        $isCriticalCombo = false; 

        // LÓGICA DE ESTADOS NUEVA
        if ($isCriticalCombo || $totalWeight >= 15) {
            $priority = 'critical';
            // CAMBIO: No esperamos experto aun, esperamos decisión del dueño
            $status = 'waiting_decision'; 
        } elseif ($totalWeight >= 6) {
            $priority = 'medium';
            $status = 'pending_payment';
        } else {
            $priority = 'low';
            $status = 'pending_payment';
        }

        $triage = Triage::create([
            'user_id' => Auth::id(),
            'pet_id' => $request->pet_id,
            'symptoms' => json_encode($request->symptoms),
            'description' => $request->description,
            'priority' => $priority,
            'status' => $status
        ]);

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
                'payment_proof_path' => $path
                // No cambiamos status aun, el admin debe validar.
            ]);
        }

        return back()->with('message', 'Comprobante subido. Esperando validación...');
    }


}