import React, { useEffect, useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/ExpertLayout';

export default function Dashboard({ auth, availableCases }) {
    const { post, processing } = useForm();
    const { flash } = usePage().props;

    // Estado local para simular si el doctor está "En Guardia" (Para futuras funciones)
    const [isOnDuty, setIsOnDuty] = useState(true);

    // --- POLLING ORIGINAL (NO TOCADO) ---
    useEffect(() => {
        if (processing || !isOnDuty) return; 

        const interval = setInterval(() => {
            router.reload({ only: ['availableCases'], preserveState: true, preserveScroll: true });
        }, 5000);
        
        return () => clearInterval(interval);
    }, [processing, isOnDuty]);

    const handleAccept = (id) => {
        post(route('expert.case.accept', id));
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    return (
        <ExpertLayout user={auth.user} header="Consultorio Virtual">
            <Head title="Panel de Expertos" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* --- NUEVO: PANEL DE MÉTRICAS RÁPIDAS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between border border-slate-100 border-l-4 border-l-indigo-500">
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Estado Actual</p>
                            <h3 className="text-xl font-black text-slate-800 flex items-center">
                                {isOnDuty ? (
                                    <><span className="text-green-500 mr-2 text-2xl animate-pulse">●</span> En Guardia</>
                                ) : (
                                    <><span className="text-red-500 mr-2 text-2xl">●</span> Fuera de Turno</>
                                )}
                            </h3>
                        </div>
                        <button 
                            onClick={() => setIsOnDuty(!isOnDuty)}
                            className={`p-3 rounded-xl transition-colors ${isOnDuty ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            title={isOnDuty ? "Pausar Radar" : "Iniciar Guardia"}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between border border-slate-100">
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pacientes en Espera</p>
                            <h3 className="text-3xl font-black text-slate-800">{availableCases.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 text-2xl">
                            ⏳
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between border border-slate-100">
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tu Billetera (Mes)</p>
                            {/* Este valor será dinámico cuando hagamos el módulo de finanzas, por ahora es un placeholder para motivar */}
                            <h3 className="text-xl font-black text-slate-800">Ver Detalles ➔</h3>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-2xl">
                            💰
                        </div>
                    </div>
                </div>

                {/* --- EL RADAR ORIGINAL --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                    
                    <div className="flex justify-between items-center mb-8 border-b pb-4">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center">
                            {isOnDuty ? <span className="mr-3 animate-pulse text-red-500">📡</span> : <span className="mr-3 text-slate-400">📡</span>} 
                            Radar de Emergencias
                        </h2>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            {processing ? 'Asignando caso...' : !isOnDuty ? 'Radar Pausado' : 'Actualizando en vivo...'}
                        </span>
                    </div>

                    {!isOnDuty ? (
                        <div className="py-16 text-center">
                            <span className="text-6xl block mb-4 grayscale opacity-50">☕</span>
                            <h3 className="text-xl font-bold text-slate-700">Estás fuera de turno</h3>
                            <p className="text-slate-500 mt-2 max-w-md mx-auto">Activa el interruptor de "En Guardia" en la parte superior para empezar a recibir notificaciones de pacientes.</p>
                        </div>
                    ) : availableCases.length === 0 ? (
                        <div className="py-16 text-center">
                            <span className="text-6xl block mb-4 animate-bounce">👀</span>
                            <h3 className="text-xl font-bold text-slate-700">La sala de espera está vacía</h3>
                            <p className="text-slate-500 mt-2">Todo tranquilo por ahora. El radar te avisará cuando ingrese un nuevo paciente.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableCases.map((triage) => (
                                <div key={triage.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
                                    
                                    <div className={`px-6 py-3 border-b flex justify-between items-center ${getPriorityColor(triage.priority)}`}>
                                        <span className="font-black uppercase text-xs tracking-wider">{triage.priority}</span>
                                        <span className="text-xs font-mono font-bold">{new Date(triage.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>

                                    <div className="p-6 flex-grow flex flex-col">
                                        <div className="flex items-center mb-6">
                                            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-3xl mr-4 shadow-inner">
                                                {triage.pet.type === 'dog' ? '🐶' : triage.pet.type === 'cat' ? '🐱' : '🐾'}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800">{triage.pet.name}</h3>
                                                <p className="text-sm font-medium text-slate-500">{triage.pet.breed}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6 flex-grow">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Cuadro Clínico Inicial</p>
                                            <div className="text-slate-700 font-medium text-sm line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100 h-[4.5rem]">
                                                {triage.description || "El cliente no proporcionó detalles."}
                                            </div>

                                            {triage.system_diagnosis && (
                                                <div className="mt-3 bg-red-50 border border-red-200 p-3 rounded-lg text-xs text-red-700 font-bold flex items-start">
                                                    <span className="mr-2 text-base">🤖</span> 
                                                    <span className="leading-tight">{triage.system_diagnosis}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            <button 
                                                onClick={() => handleAccept(triage.id)}
                                                disabled={processing}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center disabled:opacity-50"
                                            >
                                                {processing ? (
                                                    <><span className="animate-spin mr-2">⏳</span> Asignando...</>
                                                ) : (
                                                    <><span className="mr-2 text-lg">⚡</span> ATENDER PACIENTE</>
                                                )}
                                            </button>
                                            
                                            {triage.status === 'pending_payment' && (
                                                <div className="mt-3 bg-orange-50 border border-orange-200 text-center py-2 rounded-lg">
                                                    <p className="text-xs text-orange-600 font-bold">
                                                        💰 Falta pagar (Toma el caso para reservarlo)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ExpertLayout>
    );
}