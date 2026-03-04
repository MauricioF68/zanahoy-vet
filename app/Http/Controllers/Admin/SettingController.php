<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\PaymentMethod;
use App\Models\Bank;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        // 1. Traemos los ajustes globales y los convertimos en un formato fácil para React (llave => valor)
        $settings = Setting::pluck('value', 'key')->toArray();

        // 2. Traemos los catálogos
        $paymentMethods = PaymentMethod::orderBy('name')->get();
        $banks = Bank::orderBy('name')->get();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'paymentMethods' => $paymentMethods,
            'banks' => $banks
        ]);
    }

    // Aquí guardaremos los ajustes generales (Precio y PIN)
    // Aquí guardaremos los ajustes generales (Precio, Honorarios y PIN)
    public function updateGeneral(Request $request)
    {
        $data = $request->validate([
            'consulta_precio' => 'required|numeric|min:0',
            'honorario_experto' => 'required|numeric|min:0', // 💰 NUEVO: Pago del doctor
            'pin_auditoria' => 'required|string|min:4',
        ]);

        // Asegurarnos de que no le paguemos al doctor más de lo que cobramos
        if ($data['honorario_experto'] > $data['consulta_precio']) {
            return back()->withErrors(['honorario_experto' => 'El honorario del doctor no puede ser mayor al precio de la consulta.']);
        }

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return back()->with('message', 'Ajustes de tarifas guardados correctamente.');
    }

    // Guardar Cuentas y Fotos de QR
    public function updateAccounts(Request $request)
    {
        // Guardamos los textos (números de cuenta, CCI, etc.)
        $textData = $request->except(['_token', 'yape_qr', 'plin_qr']);
        foreach ($textData as $key => $value) {
            if (!is_null($value)) {
                Setting::updateOrCreate(['key' => $key], ['value' => $value]);
            }
        }

        // Guardamos la imagen del QR de Yape
        if ($request->hasFile('yape_qr')) {
            $path = $request->file('yape_qr')->store('qrs', 'public');
            Setting::updateOrCreate(['key' => 'yape_qr_path'], ['value' => $path]);
        }

        // Guardamos la imagen del QR de Plin
        if ($request->hasFile('plin_qr')) {
            $path = $request->file('plin_qr')->store('qrs', 'public');
            Setting::updateOrCreate(['key' => 'plin_qr_path'], ['value' => $path]);
        }

        return back()->with('message', 'Cuentas y códigos QR actualizados.');
    }

    // Guardar un nuevo Método de Pago (Ej: Yape, Transferencia)
    public function storeMethod(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        
        PaymentMethod::create([
            'name' => $request->name,
            // Convertimos el valor del checkbox a booleano (true/false)
            'requires_bank' => $request->boolean('requires_bank') 
        ]);

        return back()->with('message', 'Método de pago agregado al catálogo.');
    }

    // Guardar un nuevo Banco (Ej: BCP, BBVA)
    public function storeBank(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        
        Bank::create(['name' => $request->name]);

        return back()->with('message', 'Banco agregado al catálogo.');
    }

    // --- ACTUALIZAR Y ELIMINAR MÉTODOS DE PAGO ---
    public function updateMethod(Request $request, PaymentMethod $paymentMethod)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $paymentMethod->update([
            'name' => $request->name,
            'requires_bank' => $request->boolean('requires_bank')
        ]);
        return back()->with('message', 'Método de pago actualizado.');
    }

    public function destroyMethod(PaymentMethod $paymentMethod)
    {
        $paymentMethod->delete();
        return back()->with('message', 'Método de pago eliminado.');
    }

    // --- ACTUALIZAR Y ELIMINAR BANCOS ---
    public function updateBank(Request $request, Bank $bank)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $bank->update(['name' => $request->name]);
        return back()->with('message', 'Banco actualizado.');
    }

    public function destroyBank(Bank $bank)
    {
        $bank->delete();
        return back()->with('message', 'Banco eliminado.');
    }
}