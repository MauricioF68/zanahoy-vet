<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\ExpertRegisterController;
use App\Http\Controllers\Auth\ClinicRegisterController;
use App\Http\Controllers\Auth\ClientRegisterController;
use App\Http\Controllers\Auth\FinishRegistrationController;
use App\Http\Controllers\Admin\RequestController;
use App\Http\Controllers\Client\DashboardController; // Importación unificada
use App\Http\Controllers\Admin\SpeciesController;
use App\Http\Controllers\Expert\ExpertProfileController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome'); 
});

/** ---------------- Registro por Pasos ---------------- */
Route::get('/register/select', function () {
    return Inertia::render('Auth/SelectRole');
})->name('register.select');

// Experto
Route::get('/register/expert', function () {
    return Inertia::render('Auth/RegisterExpert', [
        'specialties' => \App\Models\Specialty::where('is_active', true)->get()
    ]);
})->name('register.expert');
Route::post('/register/expert', [ExpertRegisterController::class, 'store'])->name('register.expert.store');

// Clínica
Route::get('/register/clinic', function () {
    return Inertia::render('Auth/RegisterClinic');
})->name('register.clinic');
Route::post('/register/clinic', [ClinicRegisterController::class, 'store'])->name('register.clinic.store');

// Cliente
Route::get('/register/client', function () {
    return Inertia::render('Auth/RegisterClient');
})->name('register.client');
Route::post('/register/client', [ClientRegisterController::class, 'store'])->name('register.client.store');

/** ---------------- Activación de Cuenta (DNI/RUC) ---------------- */
Route::get('/finish-registration/{id}', [FinishRegistrationController::class, 'show'])->name('register.finish.show');
Route::post('/finish-registration', [FinishRegistrationController::class, 'store'])->name('register.finish.store');
Route::post('/finish-registration/check-dni', [FinishRegistrationController::class, 'checkDni'])->name('register.check.dni');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    
    // DASHBOARD PRINCIPAL (Aquí unificamos la ruta)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // REGISTRO RÁPIDO DE MASCOTA (Lo que acabamos de crear)
    Route::post('/dashboard/quick-pet', [DashboardController::class, 'storeQuickPet'])->name('pet.store.quick');

    // Subir comprobante de pago
    Route::post('/triage/payment', [DashboardController::class, 'uploadPayment'])->name('triage.payment');
    
    // Guardar decisión crítica (Ir a clínica vs Acompañamiento)
    Route::post('/triage/decision', [DashboardController::class, 'saveDecision'])->name('triage.decision');

    Route::post('/triage/{id}/cancel', [DashboardController::class, 'cancelTriage'])->name('triage.cancel');

    // REGISTRO DE TRIAJE 
    Route::post('/dashboard/triage', [DashboardController::class, 'storeTriage'])->name('triage.store');
    Route::get('/triage/result/{triage}', [DashboardController::class, 'showTriage'])->name('triage.show');
    Route::get('/triage/critical/{triage}', [DashboardController::class, 'showCriticalTriage'])->name('triage.critical');

    // Perfil de Usuario
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // HISTORIAL MÉDICO DE LA MASCOTA    
    Route::get('/historial-clinico', [DashboardController::class, 'generalHistory'])->name('client.history');

    // MÓDULO DE PAGOS DEL CLIENTE
    Route::get('/mis-pagos', [DashboardController::class, 'myPayments'])->name('client.payments');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth'])->group(function () {

    // 1. Dashboard Principal (Resumen)
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

    // 2. Gestión de Especies (CRUD Completo)
    Route::get('/species', [SpeciesController::class, 'index'])->name('admin.species.index');
    Route::post('/species', [SpeciesController::class, 'store'])->name('admin.species.store');
    Route::put('/species/{id}', [SpeciesController::class, 'update'])->name('admin.species.update');
    Route::delete('/species/{id}', [SpeciesController::class, 'destroy'])->name('admin.species.destroy');

    // 3. Solicitudes
    Route::get('/requests', [RequestController::class, 'index'])->name('admin.requests.index');
    Route::post('/requests/{id}/approve', [RequestController::class, 'approve'])->name('admin.requests.approve');
    Route::post('/requests/{id}/reject', [RequestController::class, 'reject'])->name('admin.requests.reject');

    // 4. Gestión de Categorías
    Route::get('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('admin.categories.index');
    Route::post('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('admin.categories.store');
    Route::put('/categories/{id}', [\App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('admin.categories.update');
    Route::delete('/categories/{id}', [\App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('admin.categories.destroy');

    // 5. Gestión de Síntomas (El Cerebro)
    Route::get('/symptoms', [\App\Http\Controllers\Admin\SymptomController::class, 'index'])->name('admin.symptoms.index');
    Route::post('/symptoms', [\App\Http\Controllers\Admin\SymptomController::class, 'store'])->name('admin.symptoms.store');
    Route::put('/symptoms/{id}', [\App\Http\Controllers\Admin\SymptomController::class, 'update'])->name('admin.symptoms.update');
    Route::delete('/symptoms/{id}', [\App\Http\Controllers\Admin\SymptomController::class, 'destroy'])->name('admin.symptoms.destroy');

    // 5.5 Gestión de Combos Médicos (La Inteligencia Artificial)
    Route::get('/symptom-combos', [\App\Http\Controllers\Admin\SymptomComboController::class, 'index'])->name('admin.symptom-combos.index');
    Route::post('/symptom-combos', [\App\Http\Controllers\Admin\SymptomComboController::class, 'store'])->name('admin.symptom-combos.store');
    Route::put('/symptom-combos/{id}', [\App\Http\Controllers\Admin\SymptomComboController::class, 'update'])->name('admin.symptom-combos.update');
    Route::delete('/symptom-combos/{id}', [\App\Http\Controllers\Admin\SymptomComboController::class, 'destroy'])->name('admin.symptom-combos.destroy');
   

    // 6. Gestión de Triajes (Torre de Control Médica)
    Route::get('/triages', [\App\Http\Controllers\Admin\TriageController::class, 'index'])->name('admin.triages.index');
    Route::post('/triages/{id}/approve-payment', [\App\Http\Controllers\Admin\TriageController::class, 'approvePayment'])->name('admin.triages.approve_payment');

    // 7. MÓDULO DE FINANZAS Y PAGOS (ERP) 💰
    Route::get('/finance', [\App\Http\Controllers\Admin\FinanceController::class, 'index'])->name('admin.finance.index');
    Route::post('/finance/{id}/approve', [\App\Http\Controllers\Admin\FinanceController::class, 'approvePayment'])->name('admin.finance.approve');

    // MÓDULO DE REGLAS Y CONFIGURACIÓN (ERP)
    Route::get('/configuracion', [App\Http\Controllers\Admin\SettingController::class, 'index'])->name('admin.settings.index');
    Route::post('/configuracion/general', [App\Http\Controllers\Admin\SettingController::class, 'updateGeneral'])->name('admin.settings.update_general');

    Route::post('/configuracion/cuentas', [App\Http\Controllers\Admin\SettingController::class, 'updateAccounts'])->name('admin.settings.update_accounts');
    Route::post('/configuracion/metodos', [App\Http\Controllers\Admin\SettingController::class, 'storeMethod'])->name('admin.settings.store_method');
    Route::post('/configuracion/bancos', [App\Http\Controllers\Admin\SettingController::class, 'storeBank'])->name('admin.settings.store_bank');

    // Actualizar y Eliminar Métodos
    Route::put('/configuracion/metodos/{paymentMethod}', [App\Http\Controllers\Admin\SettingController::class, 'updateMethod'])->name('admin.settings.update_method');
    Route::delete('/configuracion/metodos/{paymentMethod}', [App\Http\Controllers\Admin\SettingController::class, 'destroyMethod'])->name('admin.settings.destroy_method');

    // Actualizar y Eliminar Bancos
    Route::put('/configuracion/bancos/{bank}', [App\Http\Controllers\Admin\SettingController::class, 'updateBank'])->name('admin.settings.update_bank');
    Route::delete('/configuracion/bancos/{bank}', [App\Http\Controllers\Admin\SettingController::class, 'destroyBank'])->name('admin.settings.destroy_bank');

});


/*
|--------------------------------------------------------------------------
| Expert Routes (Veterinarios)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('expert')->name('expert.')->group(function () {
    
    // El Dashboard (Radar)
    Route::get('/dashboard', [\App\Http\Controllers\Expert\ExpertController::class, 'index'])->name('dashboard');
    
    // Acción de aceptar
    Route::post('/cases/{id}/accept', [\App\Http\Controllers\Expert\ExpertController::class, 'acceptCase'])->name('case.accept');
    
    // Área de trabajo (Detalle del caso)
    Route::get('/cases/{id}', [\App\Http\Controllers\Expert\ExpertController::class, 'showCase'])->name('case.show');

    // NUEVO: Cerrar caso y guardar historial
    Route::post('/cases/{id}/close', [\App\Http\Controllers\Expert\ExpertController::class, 'closeCase'])->name('case.close');

    // --- MÓDULO: MIS PACIENTES (CRM MÉDICO) ---
    Route::get('/patients', [\App\Http\Controllers\Expert\ExpertController::class, 'patients'])->name('patients.index');
    Route::get('/patients/{pet}', [\App\Http\Controllers\Expert\ExpertController::class, 'showPatient'])->name('patients.show');
    Route::get('/patients/{pet}/pdf', [\App\Http\Controllers\Expert\ExpertController::class, 'downloadPatientPdf'])->name('patients.pdf');

    // --- MÓDULO: MIS HONORARIOS (BILLETERA DEL EXPERTO) ---
    Route::get('/finances', [\App\Http\Controllers\Expert\ExpertController::class, 'finances'])->name('finances.index');

    // Perfil del Experto
    Route::get('/profile', [\App\Http\Controllers\Expert\ExpertProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [\App\Http\Controllers\Expert\ExpertProfileController::class, 'update'])->name('profile.update');

    
});

require __DIR__.'/auth.php';