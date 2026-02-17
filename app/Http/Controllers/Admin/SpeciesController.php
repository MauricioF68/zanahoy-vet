<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Species;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class SpeciesController extends Controller
{
    /**
     * Mostrar lista de especies
     */
    public function index()
    {
        $species = Species::all(); // Obtenemos todas las especies
        
        return Inertia::render('Admin/Species/Index', [
            'species' => $species
        ]);
    }

    /**
     * Guardar nueva especie
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:species,name',
        ]);

        Species::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name), // "Hámster Dorado" -> "hamster-dorado"
            'is_active' => true
        ]);

        return redirect()->back()->with('message', 'Especie creada correctamente.');
    }

    /**
     * Actualizar especie existente
     */
    public function update(Request $request, $id)
    {
        $species = Species::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:50|unique:species,name,' . $id,
        ]);

        $species->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        return redirect()->back()->with('message', 'Especie actualizada.');
    }

    /**
     * Eliminar (o desactivar) especie
     */
    public function destroy($id)
    {
        $species = Species::findOrFail($id);
        $species->delete(); // Esto la borra de la BD
        
        return redirect()->back()->with('message', 'Especie eliminada.');
    }
}