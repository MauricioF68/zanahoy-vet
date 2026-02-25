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
    /**
     * Procesar el Triaje (CON IA DE COMBOS)
     */
    public function storeTriage(Request $request)
    {
        $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'symptoms' => 'required|array|min:1',
            'description' => 'nullable|string'
        ]);
        
        $pet = Pet::findOrFail($request->pet_id);
        $userSymptoms = $request->symptoms; // Array con los IDs que marcó el cliente

        // 1. CÁLCULO CLÁSICO (Por suma de pesos)
        $selectedSymptoms = Symptom::whereIn('id', $userSymptoms)->get();
        $totalWeight = $selectedSymptoms->sum('weight');

        // 2. EL CEREBRO DE COMBOS (Buscamos coincidencias)
        $matchedCombo = null;
        $systemDiagnosis = null;

        // Buscamos a qué especie pertenece la mascota (perro, gato, etc.)
        // Asumiendo que guardaste 'dog' o 'cat' en el campo type de la mascota
        $species = Species::where('slug', $pet->type)->orWhere('name', $pet->type)->first();

        if ($species) {
            // Traemos los combos de esta especie, ordenados por gravedad (Crítico primero)
            $combos = \App\Models\SymptomCombo::with('symptoms')
                        ->where('species_id', $species->id)
                        ->orderByRaw("FIELD(priority, 'critical', 'medium', 'low')") 
                        ->get();

            foreach ($combos as $combo) {
                // Sacamos solo los IDs de los síntomas que requiere este combo
                $comboSymptomIds = $combo->symptoms->pluck('id')->toArray();
                
                // MAGIA INCLUSIVA: Comparamos si TODOS los síntomas del combo están dentro de lo que marcó el usuario
                $intersection = array_intersect($comboSymptomIds, $userSymptoms);
                
                // Si la cantidad de coincidencias es igual a la cantidad que pide el combo... ¡HAY MATCH!
                if (count($intersection) === count($comboSymptomIds) && count($comboSymptomIds) > 0) {
                    $matchedCombo = $combo;
                    $systemDiagnosis = $combo->system_diagnosis;
                    break; // Detenemos la búsqueda, nos quedamos con el combo más grave que coincidió
                }
            }
        }

        // 3. DEFINIR PRIORIDAD Y ESTADO FINAL (El Combo tiene la última palabra)
        if ($matchedCombo) {
            // ¡GANA EL COMBO! Sobrescribimos la matemática
            $priority = $matchedCombo->priority;
        } else {
            // SI NO HAY COMBO, usamos la suma normal
            if ($totalWeight >= 15) {
                $priority = 'critical';
            } elseif ($totalWeight >= 6) {
                $priority = 'medium';
            } else {
                $priority = 'low';
            }
        }

        // 4. ASIGNAR EL ESTADO CORRECTO SEGÚN LA PRIORIDAD
        if ($priority === 'critical') {
            $status = 'waiting_decision'; 
        } else {
            $status = 'pending_payment';
        }

        // 5. GUARDAR EL TRIAJE EN LA BASE DE DATOS
        $triage = Triage::create([
            'user_id' => Auth::id(),
            'pet_id' => $request->pet_id,
            'symptoms' => json_encode($userSymptoms),
            'description' => $request->description,
            'priority' => $priority,
            'status' => $status,
            'system_diagnosis' => $systemDiagnosis // GUARDAMOS EL DIAGNÓSTICO OCULTO AQUÍ 🕵️‍♂️
        ]);

        // 6. REDIRECCIÓN INTELIGENTE
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