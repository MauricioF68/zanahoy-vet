<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SymptomCategory;
use App\Models\Species; // <--- Importante: Usamos el modelo Species
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Listar Categorías
     */
    public function index()
    {
        // 1. Cargamos las categorías CON su especie (para mostrar "Digestivo - Perro")
        // Usamos 'with' para optimizar la consulta
        $categories = SymptomCategory::with('species')->get(); 
        
        // 2. Cargamos la lista de especies (para el select del formulario de crear)
        $speciesList = Species::where('is_active', true)->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'speciesList' => $speciesList // <--- Enviamos esto a React
        ]);
    }

    /**
     * Guardar nueva Categoría
     */
    public function store(Request $request)
    {
        $request->validate([
            'species_id' => 'required|exists:species,id', // <--- Validación clave
            'name' => 'required|string|max:50',
            'icon' => 'nullable|string|max:50', // Ej: Emoji
        ]);

        SymptomCategory::create([
            'species_id' => $request->species_id,
            'name' => $request->name,
            'icon' => $request->icon,
        ]);

        return redirect()->back()->with('message', 'Categoría creada correctamente.');
    }

    /**
     * Actualizar Categoría
     */
    public function update(Request $request, $id)
    {
        $category = SymptomCategory::findOrFail($id);
        
        $request->validate([
            'species_id' => 'required|exists:species,id',
            'name' => 'required|string|max:50',
            'icon' => 'nullable|string|max:50',
        ]);

        $category->update([
            'species_id' => $request->species_id,
            'name' => $request->name,
            'icon' => $request->icon,
        ]);

        return redirect()->back()->with('message', 'Categoría actualizada.');
    }

    /**
     * Eliminar Categoría
     */
    public function destroy($id)
    {
        $category = SymptomCategory::findOrFail($id);
        $category->delete();
        
        return redirect()->back()->with('message', 'Categoría eliminada.');
    }
}