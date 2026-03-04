<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Triage;
use App\Models\PaymentMethod;
use App\Models\Bank;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index()
    {
        $finances = Triage::with(['pet.user', 'expert'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Traemos los catálogos y el PIN que configuraste en tu ERP
        $methods = PaymentMethod::where('is_active', true)->orderBy('name')->get();
        $banks = Bank::where('is_active', true)->orderBy('name')->get();
        $auditPin = Setting::where('key', 'pin_auditoria')->value('value') ?? '1234';

        return Inertia::render('Admin/Finance/Index', [
            'finances' => $finances,
            'paymentMethods' => $methods,
            'banks' => $banks,
            'auditPin' => $auditPin
        ]);
    }

    public function approvePayment(Request $request, $id)
    {
        $triage = Triage::findOrFail($id);

        // Validamos la información contable
        $request->validate([
            'payment_method_id' => 'required|exists:payment_methods,id',
            'operation_number' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'sender_name' => 'required|string|max:255',
            'bank_id' => 'nullable|exists:banks,id',
        ]);

        // Guardamos la auditoría
        $triage->update([
            'payment_method_id' => $request->payment_method_id,
            'bank_id' => $request->bank_id,
            'operation_number' => $request->operation_number,
            'transaction_date' => $request->transaction_date,
            'sender_name' => $request->sender_name,
            'is_audited' => true,
            'payment_status' => 'paid', // Confirmamos en caja
            'is_paid' => true
        ]);

        return back()->with('message', 'Voucher auditado y bloqueado en contabilidad exitosamente.');
    }
}