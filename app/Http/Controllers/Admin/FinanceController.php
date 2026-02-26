<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Triage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceController extends Controller
{
    /**
     * Muestra el Panel del ERP Financiero
     */
    public function index()
    {
        // Traemos TODOS los casos con sus relaciones.
        // Los ordenamos desde el más reciente al más antiguo.
        $finances = Triage::with(['pet.user', 'expert'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Finance/Index', [
            'finances' => $finances
        ]);
    }

    /**
     * Aprobar un pago (Cambiar estado financiero a 'paid')
     */
    public function approvePayment($id)
    {
        $triage = Triage::findOrFail($id);

        // Solo cambiamos el estado netamente financiero.
        // No tocamos el estado médico (eso se queda en la Torre de Control)
        $triage->update([
            'payment_status' => 'paid'
        ]);

        return back()->with('message', 'Pago validado y registrado en contabilidad exitosamente.');
    }
}