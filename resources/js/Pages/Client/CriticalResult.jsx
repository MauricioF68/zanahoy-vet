import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function CriticalResult({ auth, triage }) {
    const [stopPolling, setStopPolling] = useState(false);
    const { data, setData, post, processing } = useForm({
        triage_id: triage.id,
        decision: ''
    });

    // LÓGICA DE POLLING INTELIGENTE (Latidos)
    useEffect(() => {
        // Solo hacemos polling si el usuario eligió acompañamiento Y aun no hay link
        if (triage.user_decision === 'request_accompaniment' && !triage.meeting_link && !stopPolling) {
            
            // 1. Temporizador de Seguridad (5 Minutos) -> Apaga el sistema
            const safetyTimer = setTimeout(() => {
                setStopPolling(true);
                alert("Ha pasado tiempo sin respuesta. Por favor recarga si sigues esperando.");
            }, 300000); // 300,000 ms = 5 minutos

            // 2. El Latido (Cada 4 segundos)
            const heartbeat = setInterval(() => {
                router.reload({ only: ['triage'] });
            }, 4000);

            return () => {
                clearTimeout(safetyTimer);
                clearInterval(heartbeat);
            };
        }
    }, [triage.user_decision, triage.meeting_link, stopPolling]);

    const handleDecision = (decision) => {
        setData('decision', decision);
        post(route('triage.decision'), {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="¡EMERGENCIA!" />
            
            {/* Si ya decidió IR A CLÍNICA */}
            {triage.user_decision === 'goto_clinic' && (
                <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg">
                        <h1 className="text-3xl font-black text-gray-800 mb-4">¡Buena decisión! 🏥</h1>
                        <p className="text-lg text-gray-600 mb-6">
                            Dirígete a la clínica más cercana. Hemos cerrado este caso para no distraer a los expertos.
                        </p>
                        <div className="bg-orange-50 p-4 rounded-xl text-left text-sm text-orange-800">
                            <strong>Tips de traslado:</strong>
                            <ul className="list-disc ml-5 mt-2 space-y-1">
                                <li>Mantén la calma, tu mascota siente tu estrés.</li>
                                <li>No le des agua ni comida si está vomitando.</li>
                                <li>Envuélvelo en una manta ligera.</li>
                            </ul>
                        </div>
                        <a href="/dashboard" className="mt-8 block w-full bg-gray-800 text-white py-3 rounded-xl font-bold">Volver al Inicio</a>
                    </div>
                </div>
            )}

            {/* Si NO ha decidido O eligió ACOMPAÑAMIENTO */}
            {triage.user_decision !== 'goto_clinic' && (
                <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-4 text-center text-white">
                    
                    <div className="animate-pulse mb-6 bg-white rounded-full p-4">
                         <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black uppercase mb-2 tracking-tighter">¡Atención Inmediata!</h1>
                    <p className="text-xl font-bold max-w-2xl mb-8 bg-red-800 bg-opacity-50 p-4 rounded-xl">
                        Los síntomas de {triage.pet.name} son críticos.
                    </p>

                    {/* FASE 1: TOMA DE DECISIÓN */}
                    {!triage.user_decision && (
                        <div className="bg-white text-gray-900 rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
                            <h3 className="text-2xl font-black mb-6">¿Qué deseas hacer?</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                    onClick={() => handleDecision('goto_clinic')}
                                    disabled={processing}
                                    className="p-6 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition flex flex-col items-center group"
                                >
                                    <span className="text-4xl mb-2 group-hover:scale-110 transition">🚗</span>
                                    <span className="font-bold text-lg text-gray-800">Ir a Clínica YA</span>
                                    <span className="text-xs text-gray-500 mt-1">Saldré ahora mismo</span>
                                </button>

                                <button 
                                    onClick={() => handleDecision('request_accompaniment')}
                                    disabled={processing}
                                    className="p-6 bg-red-50 border-2 border-red-100 rounded-2xl hover:bg-red-100 transition flex flex-col items-center group relative overflow-hidden"
                                >
                                    <span className="text-4xl mb-2 group-hover:scale-110 transition">👨‍⚕️</span>
                                    <span className="font-bold text-lg text-red-700">Necesito Ayuda Virtual</span>
                                    <span className="text-xs text-red-500 mt-1">Guiadme mientras voy</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* FASE 2: ESPERANDO EXPERTO (Polling Activo) */}
                    {triage.user_decision === 'request_accompaniment' && (
                        <div className="bg-white text-gray-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                            <h3 className="text-2xl font-black mb-2">Solicitando Experto...</h3>
                            
                            {triage.meeting_link ? (
                                <div className="mt-4 animate-bounce-in">
                                    <p className="text-green-600 font-bold mb-4">¡Conexión establecida!</p>
                                    <a href={triage.meeting_link} target="_blank" className="block w-full bg-red-600 text-white text-2xl font-black py-5 rounded-2xl hover:bg-red-700 animate-pulse shadow-xl">
                                        📹 ENTRAR AHORA
                                    </a>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-4 mt-6">
                                    <div className="relative">
                                        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                                        <div className="relative inline-flex rounded-full h-16 w-16 bg-red-100 items-center justify-center">
                                            <span className="text-2xl">📡</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 font-medium">
                                        {stopPolling ? "Parece que tarda un poco..." : "Buscando al veterinario más cercano..."}
                                    </p>
                                    {stopPolling && (
                                        <button onClick={() => window.location.reload()} className="text-sm underline text-red-600">
                                            Recargar página
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}