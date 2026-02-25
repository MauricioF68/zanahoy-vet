import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ShowCase({ auth, triage }) {
    const [timeLeft, setTimeLeft] = useState(60); // 60 segundos de espera
    
    // Polling Inteligente
    useEffect(() => {
        // Solo recargamos si no hay decisión tomada o falta pago
        const needsUpdate = !triage.user_decision || triage.status === 'pending_payment';
        
        if (needsUpdate) {
            const interval = setInterval(() => {
                router.reload({ only: ['triage'] });
            }, 3000); // Rápido (3s) para emergencias
            return () => clearInterval(interval);
        }
    }, [triage.user_decision, triage.status]);

    // Cuenta Regresiva (Solo para estado waiting_decision)
    useEffect(() => {
        if (triage.status === 'waiting_decision' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [triage.status, timeLeft]);

    const isCritical = triage.priority === 'critical';
    const waitingDecision = triage.status === 'waiting_decision';
    const waitingPayment = triage.status === 'pending_payment';
    const goneToClinic = triage.user_decision === 'goto_clinic';

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Atendiendo a ${triage.pet.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* ENCABEZADO */}
                    <div className={`bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6 border-l-8 ${isCritical ? 'border-red-600' : 'border-indigo-500'}`}>
                        <div className="p-6 flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mr-4">
                                    {triage.pet.type === 'dog' ? '🐶' : '🐱'}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-gray-900">{triage.pet.name}</h1>
                                    <p className="text-gray-500">{triage.pet.breed}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${isCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-green-100 text-green-700'}`}>
                                {triage.priority.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* COLUMNA DATOS */}
                        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow h-fit">
                            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">📋 Cuadro Clínico</h3>
                            <p className="text-gray-800 italic">"{triage.description}"</p>
                        </div>

                        {/* COLUMNA ACCIÓN (Máquina de Estados) */}
                        <div className="md:col-span-2 space-y-6">
                            
                            {/* ESCENARIO 1: ESPERANDO DECISIÓN (CRÍTICO) */}
                            {waitingDecision && (
                                <div className="bg-red-50 border-2 border-red-400 p-8 rounded-2xl text-center shadow-lg">
                                    {timeLeft > 0 ? (
                                        <>
                                            <div className="text-5xl font-mono font-black text-red-600 mb-2">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
                                            <h2 className="text-2xl font-bold text-red-800">Esperando al Cliente...</h2>
                                            <p className="text-red-700 mt-2">El dueño está viendo la alerta roja. Espera a que solicite conexión.</p>
                                            <div className="mt-4 flex justify-center">
                                                <span className="animate-ping h-4 w-4 rounded-full bg-red-500 opacity-75"></span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-4xl mb-4">💨</div>
                                            <h2 className="text-xl font-bold text-gray-700">Tiempo Agotado</h2>
                                            <p className="text-gray-500">Es probable que el cliente haya corrido a la clínica.</p>
                                            <a href={route('expert.dashboard')} className="mt-4 inline-block bg-gray-600 text-white px-6 py-2 rounded-lg font-bold">
                                                Liberar Caso
                                            </a>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ESCENARIO 2: SE FUE A CLÍNICA */}
                            {goneToClinic && (
                                <div className="bg-gray-100 border-2 border-gray-300 p-8 rounded-2xl text-center">
                                    <h2 className="text-xl font-bold text-gray-600">El cliente decidió ir a una clínica.</h2>
                                    <a href={route('expert.dashboard')} className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
                                        Volver al Radar
                                    </a>
                                </div>
                            )}

                            {/* ESCENARIO 3: ESPERANDO PAGO (NORMAL) */}
                            {waitingPayment && (
                                <div className="bg-yellow-50 border-2 border-yellow-400 p-8 rounded-2xl text-center">
                                    <h2 className="text-2xl font-bold text-yellow-800">Esperando Pago...</h2>
                                    <p className="text-yellow-700">El cliente está subiendo el comprobante.</p>
                                </div>
                            )}

                            {/* ESCENARIO 4: ÉXITO - VIDEOLLAMADA */}
                            {triage.meeting_link && !goneToClinic && (
                                <div className="bg-green-50 border-2 border-green-500 p-8 rounded-2xl text-center shadow-xl">
                                    <h2 className="text-3xl font-black text-green-800 mb-4">¡Conexión Confirmada!</h2>
                                    <a href={triage.meeting_link} target="_blank" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-lg transform transition hover:scale-105">
                                        INICIAR VIDEOLLAMADA
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}