import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import toast from 'react-hot-toast'; // 👈 Importamos el toast para avisos en tiempo real

export default function CriticalResult({ auth, triage }) {
    const [stopPolling, setStopPolling] = useState(false);
    const { data, setData, post, processing } = useForm({
        triage_id: triage.id,
        decision: ''
    });

    useEffect(() => {
        if (triage.user_decision === 'request_accompaniment' && !triage.meeting_link && !stopPolling) {
            const safetyTimer = setTimeout(() => {
                setStopPolling(true);
                // Adiós al alert feo, hola Toast elegante
                toast.error("El radar no encuentra un experto disponible en este momento. Por favor, recarga la página o dirígete a la clínica más cercana.", {
                    duration: 8000,
                    icon: '🚨'
                });
            }, 300000); 

            const heartbeat = setInterval(() => {
                router.reload({ only: ['triage'] });
            }, 4000);

            return () => { clearTimeout(safetyTimer); clearInterval(heartbeat); };
        }
    }, [triage.user_decision, triage.meeting_link, stopPolling]);

    const handleDecision = (decision) => {
        setData('decision', decision);
        post(route('triage.decision'), { preserveScroll: true });
    };

    const handleCancel = () => {
        if (confirm('¿Estás seguro que deseas abortar esta emergencia?')) {
            router.post(route('triage.cancel', triage.id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="¡EMERGENCIA CRÍTICA!" />
            
            {triage.user_decision === 'goto_clinic' && (
                <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg border-t-8 border-orange-500">
                        <h1 className="text-4xl font-black text-slate-800 mb-4">¡Buena decisión! 🏥</h1>
                        <p className="text-lg text-slate-600 mb-6 font-medium">Dirígete a la clínica veterinaria más cercana. Hemos cerrado este caso en la plataforma para no distraer a los expertos.</p>
                        
                        <div className="bg-orange-50 p-6 rounded-2xl text-left text-sm text-orange-900 border border-orange-100">
                            <strong className="text-base uppercase tracking-wider text-orange-700">Tips vitales de traslado:</strong>
                            <ul className="list-disc ml-5 mt-3 space-y-2 font-medium">
                                <li>Mantén la calma, tu mascota siente tu estrés.</li>
                                <li>No le des agua ni comida si está vomitando o asfixiándose.</li>
                                <li>Envuélvelo en una manta ligera para mantener su temperatura.</li>
                            </ul>
                        </div>
                        <a href="/dashboard" className="mt-8 block w-full bg-slate-800 hover:bg-slate-900 transition-colors text-white py-4 rounded-xl font-black text-lg shadow-lg">Entendido, Volver al Inicio</a>
                    </div>
                </div>
            )}

            {triage.user_decision !== 'goto_clinic' && (
                <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-4 text-center text-white relative">
                    
                    <div className="animate-pulse mb-6 bg-white rounded-full p-5 shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                         <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black uppercase mb-3 tracking-tighter drop-shadow-md">¡Atención Inmediata!</h1>
                    <p className="text-xl md:text-2xl font-bold max-w-2xl mb-10 bg-red-900/40 border border-red-500/30 p-4 md:p-6 rounded-2xl backdrop-blur-sm">
                        Los síntomas de <span className="text-yellow-300">{triage.pet.name}</span> son críticos.
                    </p>

                    {!triage.user_decision && (
                        <div className="bg-white text-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl">
                            <h3 className="text-2xl font-black mb-6">¿Qué deseas hacer ahora mismo?</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button onClick={() => handleDecision('goto_clinic')} disabled={processing} className="p-6 border-2 border-slate-200 rounded-2xl hover:border-orange-500 hover:bg-orange-50 hover:shadow-lg transition-all flex flex-col items-center group">
                                    <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🚗</span>
                                    <span className="font-black text-xl text-slate-800">Ir a Clínica YA</span>
                                    <span className="text-sm text-slate-500 mt-1 font-medium">Saldré en este momento</span>
                                </button>

                                <button onClick={() => handleDecision('request_accompaniment')} disabled={processing} className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl hover:border-red-500 hover:bg-red-100 hover:shadow-lg transition-all flex flex-col items-center group relative overflow-hidden">
                                    <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">👨‍⚕️</span>
                                    <span className="font-black text-xl text-red-700">Ayuda Virtual</span>
                                    <span className="text-sm text-red-600 mt-1 font-medium">Guiadme en el camino</span>
                                </button>
                            </div>

                            {/* BOTÓN CANCELAR REDISEÑADO */}
                            <div className="mt-8 border-t border-slate-100 pt-6">
                                <button 
                                    onClick={handleCancel} 
                                    className="w-full border-2 border-red-100 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all flex justify-center items-center"
                                >
                                    <span className="mr-2 text-xl">❌</span> Abortar y Cancelar Solicitud
                                </button>
                            </div>
                        </div>
                    )}

                    {triage.user_decision === 'request_accompaniment' && (
                        <div className="bg-white text-slate-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                            <h3 className="text-2xl font-black mb-2 text-center">Buscando Especialista...</h3>
                            
                            {triage.meeting_link ? (
                                <div className="mt-6 animate-in zoom-in duration-300">
                                    <div className="bg-green-100 text-green-800 p-4 rounded-xl font-bold mb-6 text-center border border-green-200">
                                        ¡Conexión de emergencia establecida! ✅
                                    </div>
                                    <a href={triage.meeting_link} target="_blank" className="block w-full bg-red-600 text-white text-2xl font-black py-5 rounded-2xl hover:bg-red-700 text-center animate-pulse shadow-xl shadow-red-500/30">
                                        📹 ENTRAR A LA SALA AHORA
                                    </a>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-6 mt-8">
                                    <div className="relative">
                                        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></div>
                                        <div className="relative inline-flex rounded-full h-20 w-20 bg-red-50 border-4 border-red-100 items-center justify-center">
                                            <span className="text-4xl">📡</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-slate-600 font-bold text-lg">
                                            {stopPolling ? "Parece que todos están ocupados..." : "Enviando alerta a veterinarios cercanos..."}
                                        </p>
                                        <p className="text-slate-400 text-sm mt-1">Por favor, no cierres esta ventana.</p>
                                    </div>
                                    
                                    {/* BOTÓN CANCELAR MIENTRAS ESPERA (Rediseñado) */}
                                    <div className="w-full border-t border-slate-100 pt-6 mt-4">
                                        <button 
                                            onClick={handleCancel} 
                                            className="w-full border-2 border-red-100 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all flex justify-center items-center"
                                        >
                                            <span className="mr-2 text-xl">❌</span> Abortar Solicitud
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}