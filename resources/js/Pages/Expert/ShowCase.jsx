import React, { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function ShowCase({ auth, triage }) {
    const [timeLeft, setTimeLeft] = useState(60); 
    
    // Formulario del Historial Médico
    const { data, setData, post, processing, errors } = useForm({
        presumptive_diagnosis: '',
        anamnesis: '',
        prescription: '',
        medical_instructions: ''
    });
    
    useEffect(() => {
        const needsUpdate = triage.status === 'waiting_decision' || triage.status === 'pending_payment';
        
        if (needsUpdate) {
            const interval = setInterval(() => {
                router.reload({ only: ['triage'] });
            }, 3000); 
            return () => clearInterval(interval);
        }
    }, [triage.status])

    useEffect(() => {
        if (triage.status === 'waiting_decision' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [triage.status, timeLeft]);

    const handleCloseCase = (e) => {
        e.preventDefault();
        if(confirm('¿Seguro que deseas finalizar la consulta y emitir este informe?')) {
            post(route('expert.case.close', triage.id));
        }
    };

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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* COLUMNA IZQUIERDA: DATOS Y CONEXIÓN */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow h-fit">
                                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">📋 Cuadro Clínico del Dueño</h3>
                                <p className="text-gray-800 italic">"{triage.description || "Sin descripción adicional"}"</p>

                                {triage.system_diagnosis && (
                                    <div className="mt-6 bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg shadow-sm">
                                        <h4 className="text-red-800 font-black text-sm uppercase flex items-center mb-1">
                                            <span className="mr-2 text-lg">🚨</span> Alerta del Sistema
                                        </h4>
                                        <p className="text-red-700 text-sm font-medium leading-relaxed">
                                            {triage.system_diagnosis}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* ESTADOS DE ESPERA */}
                            {waitingDecision && (
                                <div className="bg-red-50 border-2 border-red-400 p-6 rounded-xl text-center shadow">
                                    {timeLeft > 0 ? (
                                        <>
                                            <div className="text-4xl font-mono font-black text-red-600 mb-2">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
                                            <h2 className="text-lg font-bold text-red-800">Esperando al Cliente...</h2>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-lg font-bold text-gray-700">Tiempo Agotado</h2>
                                            <a href={route('expert.dashboard')} className="mt-4 inline-block bg-gray-600 text-white px-4 py-2 rounded-lg font-bold">Liberar Caso</a>
                                        </>
                                    )}
                                </div>
                            )}

                            {goneToClinic && (
                                <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-xl text-center">
                                    <h2 className="text-lg font-bold text-gray-600">El cliente decidió ir a clínica presencial.</h2>
                                    <a href={route('expert.dashboard')} className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Volver al Radar</a>
                                </div>
                            )}

                            {waitingPayment && (
                                <div className="bg-yellow-50 border-2 border-yellow-400 p-6 rounded-xl text-center">
                                    <h2 className="text-lg font-bold text-yellow-800">Esperando Pago...</h2>
                                    <p className="text-sm text-yellow-700">El cliente está subiendo su voucher.</p>
                                </div>
                            )}
                        </div>

                        {/* COLUMNA DERECHA: CONSULTORIO EN VIVO */}
                        <div className="lg:col-span-2">
                            {triage.meeting_link && !goneToClinic && (
                                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                                    
                                    {/* BOTÓN JITSI */}
                                    <div className="bg-slate-800 p-6 flex flex-col items-center justify-center text-center">
                                        <h2 className="text-xl font-bold text-white mb-4">Sala Médica Abierta</h2>
                                        <a href={triage.meeting_link} target="_blank" rel="noopener noreferrer" className="bg-indigo-500 hover:bg-indigo-600 text-white font-black py-3 px-8 rounded-lg text-lg shadow-lg transform transition hover:scale-105 flex items-center">
                                            <span className="mr-2 text-2xl">📹</span> INICIAR VIDEOLLAMADA
                                        </a>
                                        <p className="text-slate-400 text-xs mt-3">Abre la llamada en otra pestaña y llena el informe aquí abajo.</p>
                                    </div>

                                    {/* FORMULARIO DE HISTORIA CLÍNICA */}
                                    <div className="p-6 bg-gray-50 border-t">
                                        <h3 className="font-black text-gray-800 text-lg mb-4 flex items-center">
                                            <span className="mr-2">📝</span> Informe Médico (Se guardará al finalizar)
                                        </h3>

                                        <form onSubmit={handleCloseCase} className="space-y-4">
                                            <div>
                                                <InputLabel value="Diagnóstico Presuntivo (El Titular) *" />
                                                <TextInput 
                                                    className="w-full mt-1 font-bold text-indigo-900 bg-white" 
                                                    placeholder="Ej: Gastroenteritis aguda" 
                                                    value={data.presumptive_diagnosis}
                                                    onChange={e => setData('presumptive_diagnosis', e.target.value)}
                                                    required 
                                                />
                                                {errors.presumptive_diagnosis && <span className="text-red-500 text-xs">{errors.presumptive_diagnosis}</span>}
                                            </div>

                                            <div>
                                                <InputLabel value="Anamnesis / Observaciones (Oculto si hay deuda)" />
                                                <textarea 
                                                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 text-sm bg-white" 
                                                    rows="3" placeholder="Anotaciones de lo observado en la consulta..."
                                                    value={data.anamnesis} onChange={e => setData('anamnesis', e.target.value)}
                                                ></textarea>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <InputLabel value="Receta Médica 💊 (Oculto si hay deuda)" />
                                                    <textarea 
                                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 text-sm bg-white" 
                                                        rows="4" placeholder="Ej: Omeprazol 10mg - 1 pastilla cada 24h"
                                                        value={data.prescription} onChange={e => setData('prescription', e.target.value)}
                                                    ></textarea>
                                                </div>
                                                <div>
                                                    <InputLabel value="Cuidados Generales 🏠 (Oculto si hay deuda)" />
                                                    <textarea 
                                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 text-sm bg-white" 
                                                        rows="4" placeholder="Ej: Dieta blanda por 3 días, reposo absoluto."
                                                        value={data.medical_instructions} onChange={e => setData('medical_instructions', e.target.value)}
                                                    ></textarea>
                                                </div>
                                            </div>

                                            <div className="pt-6 mt-6 border-t flex justify-end">
                                                <button 
                                                    type="submit" 
                                                    disabled={processing}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-black py-3 px-8 rounded-lg shadow-lg flex items-center transition-colors disabled:opacity-50"
                                                >
                                                    {processing ? 'GUARDANDO...' : '✔️ GUARDAR Y DAR DE ALTA'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}