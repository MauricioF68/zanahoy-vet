import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function TriageResult({ auth, triage }) {
    const [stopPolling, setStopPolling] = useState(false);
    
    // Formulario para subir imagen
    const { data, setData, post, processing, errors } = useForm({
        triage_id: triage.id,
        payment_proof: null
    });

    const isMedium = triage.priority === 'medium';
    const hasUploaded = !!triage.payment_proof_path;

    // POLLING: Solo si ya subió foto Y aun no tiene link
    useEffect(() => {
        if (hasUploaded && !triage.meeting_link && !stopPolling) {
            
            const safetyTimer = setTimeout(() => setStopPolling(true), 300000); // 5 min
            
            const heartbeat = setInterval(() => {
                router.reload({ only: ['triage'] });
            }, 5000); // Cada 5 segundos

            return () => { clearTimeout(safetyTimer); clearInterval(heartbeat); };
        }
    }, [hasUploaded, triage.meeting_link, stopPolling]);

    const handleFileChange = (e) => {
        setData('payment_proof', e.target.files[0]);
    };

    const submitPayment = (e) => {
        e.preventDefault();
        post(route('triage.payment'), {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Estado del Caso" />
            <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                
                {/* IZQUIERDA: ESTADO */}
                <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
                    <div className={`rounded-3xl shadow-xl p-8 mb-8 border-l-8 ${isMedium ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500'}`}>
                        <h2 className={`text-3xl font-black mb-2 ${isMedium ? 'text-yellow-700' : 'text-green-700'}`}>
                            {isMedium ? '⚠️ URGENCIA MODERADA' : '💚 RIESGO BAJO'}
                        </h2>
                        <p className="text-gray-600 text-lg">Paciente: <strong>{triage.pet.name}</strong></p>
                    </div>

                    {/* ZONA DE LINK (Aparece al validar) */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg text-center border-2 border-dashed border-gray-200">
                        {triage.meeting_link ? (
                            <div className="animate-bounce-in">
                                <h3 className="text-2xl font-black text-gray-800">¡Experto Asignado! ✅</h3>
                                <a href={triage.meeting_link} target="_blank" className="mt-4 block w-full bg-orange-600 text-white text-xl font-bold py-4 rounded-xl hover:bg-orange-700 transition">
                                    ENTRAR A VIDEOLLAMADA
                                </a>
                            </div>
                        ) : hasUploaded ? (
                            <div>
                                <div className="flex justify-center mb-4"><span className="animate-spin text-3xl">⏳</span></div>
                                <h3 className="font-bold text-gray-800">Verificando tu pago...</h3>
                                <p className="text-sm text-gray-500">Esto suele tomar menos de 2 minutos.</p>
                                {stopPolling && <p className="text-xs text-red-500 mt-2">Tarda más de lo usual. Recarga la página.</p>}
                            </div>
                        ) : (
                            <div className="text-gray-400">
                                <p>🔒 El enlace se habilitará cuando confirmemos tu pago.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* DERECHA: PAGO Y SUBIDA */}
                <div className="w-full md:w-1/2 bg-gray-900 p-8 flex flex-col justify-center items-center text-white">
                    {!hasUploaded ? (
                        <div className="w-full max-w-md text-center">
                            <h2 className="text-2xl font-bold text-orange-400 mb-6">1. Realiza el Pago</h2>
                            <div className="bg-white p-4 rounded-xl w-48 h-48 mx-auto mb-6">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=YAPE-PLIN-ZANAHOY" alt="QR" className="w-full h-full"/>
                            </div>
                            <p className="font-mono text-xl mb-8">Yape/Plin: 999-000-000</p>

                            <h2 className="text-xl font-bold text-orange-400 mb-4">2. Sube la Captura</h2>
                            <form onSubmit={submitPayment} className="space-y-4">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                                    accept="image/*"
                                />
                                {errors.payment_proof && <p className="text-red-400 text-sm">{errors.payment_proof}</p>}
                                
                                <button 
                                    type="submit" 
                                    disabled={processing || !data.payment_proof}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                                >
                                    {processing ? 'Subiendo...' : 'ENVIAR COMPROBANTE'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="text-6xl mb-4">✅</div>
                            <h2 className="text-3xl font-bold">¡Comprobante Enviado!</h2>
                            <p className="text-gray-400 mt-2">Mantente atento, tu experto se conectará pronto.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}