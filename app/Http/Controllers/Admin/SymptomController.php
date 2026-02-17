<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Symptom;
use App\Models\SymptomCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SymptomController extends Controller
{
    /**
     * Listar Síntomas
     */
    public function index()
    {
        // 1. Traemos los síntomas con toda su cadena familiar (Categoría y Especie)
        $symptoms = Symptom::with('category.species')
            ->orderBy('id', 'desc')
            ->get();

        // 2. Traemos las categorías organizadas para el formulario
        // Las ordenamos por especie para que salgan agrupadas visualmente
        $categories = SymptomCategory::with('species')->get();
        $speciesList = \App\Models\Species::where('is_active', true)->get();

            return Inertia::render('Admin/Symptoms/Index', [
                'symptoms' => $symptoms,
                'categories' => $categories,
                'speciesList' => $speciesList // <--- Enviamos esto para las pestañas
            ]);
    }

    /**
     * Guardar Síntoma
     */
    public function store(Request $request)
    {
        $request->validate([
            'symptom_category_id' => 'required|exists:symptom_categories,id',
            'name' => 'required|string|max:100',
            'weight' => 'required|integer|min:1|max:20', // Peso del 1 al 20
            'medical_hint' => 'nullable|string|max:255',
        ]);

        Symptom::create($request->all());

        return redirect()->back()->with('message', 'Síntoma creado correctamente.');
    }

    /**
     * Actualizar Síntoma
     */
    public function update(Request $request, $id)
    {
        $symptom = Symptom::findOrFail($id);

        $request->validate([
            'symptom_category_id' => 'required|exists:symptom_categories,id',
            'name' => 'required|string|max:100',
            'weight' => 'required|integer|min:1|max:20',
            'medical_hint' => 'nullable|string|max:255',
        ]);

        $symptom->update($request->all());

        return redirect()->back()->with('message', 'Síntoma actualizado.');
    }

    /**
     * Eliminar Síntoma
     */
    public function destroy($id)
    {
        $symptom = Symptom::findOrFail($id);
        $symptom->delete();
        
        return redirect()->back()->with('message', 'Síntoma eliminado.');
    }
}