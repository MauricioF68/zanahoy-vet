<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SymptomCombo;
use App\Models\Species;
use App\Models\Symptom;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SymptomComboController extends Controller
{
    public function index()
    {
        // 1. Traemos los combos con su especie y síntomas
        $combos = SymptomCombo::with(['species', 'symptoms'])->latest()->get();

        // 2. Traemos las especies para las pestañas
        $speciesList = Species::where('is_active', true)->get();

        // 3. Traemos TODOS los síntomas (con su categoría para saber de qué especie son)
        // Esto servirá para armar los checkboxes en el formulario
        $symptoms = Symptom::with('category')->get();

        return Inertia::render('Admin/SymptomCombos/Index', [
            'combos' => $combos,
            'speciesList' => $speciesList,
            'symptoms' => $symptoms
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'species_id' => 'required|exists:species,id',
            'priority' => 'required|in:critical,medium,low',
            'system_diagnosis' => 'nullable|string',
            'symptoms' => 'required|array|min:2', // Un combo mínimo necesita 2 síntomas
            'symptoms.*' => 'exists:symptoms,id'
        ]);

        // 1. Crear la cabecera del combo
        $combo = SymptomCombo::create($request->only('name', 'species_id', 'priority', 'system_diagnosis'));

        // 2. Guardar el detalle (los síntomas seleccionados) en la tabla pivote
        $combo->symptoms()->attach($request->symptoms);

        return redirect()->back()->with('message', 'Combo Médico creado correctamente.');
    }

    public function update(Request $request, $id)
    {
        $combo = SymptomCombo::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:150',
            'species_id' => 'required|exists:species,id',
            'priority' => 'required|in:critical,medium,low',
            'system_diagnosis' => 'nullable|string',
            'symptoms' => 'required|array|min:2',
            'symptoms.*' => 'exists:symptoms,id'
        ]);

        // 1. Actualizar la cabecera
        $combo->update($request->only('name', 'species_id', 'priority', 'system_diagnosis'));

        // 2. Sincronizar los síntomas (Borra los viejos y pone los nuevos)
        $combo->symptoms()->sync($request->symptoms);

        return redirect()->back()->with('message', 'Combo Médico actualizado.');
    }

    public function destroy($id)
    {
        $combo = SymptomCombo::findOrFail($id);
        $combo->delete();
        
        return redirect()->back()->with('message', 'Combo Médico eliminado.');
    }
}