import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import toast from 'react-hot-toast'; // 👈 Importamos el toast para avisos en tiempo real

export default function TriageResult({ auth, triage }) {
    const [stopPolling, setStopPolling] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        triage_id: triage.id,
        payment_proof: null
    });

    const isMedium = triage.priority === 'medium';
    const hasUploaded = !!triage.payment_proof_path;

    useEffect(() => {
        if (hasUploaded && !triage.meeting_link && !stopPolling) {
            const safetyTimer = setTimeout(() => {
                setStopPolling(true);
                // Usamos toast elegante en vez de un texto feo
                toast.error("El tiempo de búsqueda se ha agotado. Si el doctor no responde, puedes cancelar la solicitud.", {
                    duration: 6000,
                    icon: '⏳'
                });
            }, 300000); // 5 min
            
            const heartbeat = setInterval(() => {
                router.reload({ only: ['triage'] });
            }, 5000); 
            
            return () => { clearTimeout(safetyTimer); clearInterval(heartbeat); };
        }
    }, [hasUploaded, triage.meeting_link, stopPolling]);

    const handleFileChange = (e) => setData('payment_proof', e.target.files[0]);

    const submitPayment = (e) => {
        e.preventDefault();
        post(route('triage.payment'), { preserveScroll: true });
    };

    // LÓGICA DE CANCELACIÓN (Con confirmación nativa pero limpia)
    const handleCancel = () => {
        if (confirm('¿Estás seguro que deseas cancelar esta solicitud?')) {
            router.post(route('triage.cancel', triage.id));
        }
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

                    <div className="bg-white rounded-3xl p-8 shadow-lg text-center border-2 border-dashed border-gray-200">
                        {triage.meeting_link ? (
                            <div className="animate-bounce-in">
                                <h3 className="text-2xl font-black text-gray-800">¡Experto Asignado! ✅</h3>
                                <a href={triage.meeting_link} target="_blank" className="mt-4 block w-full bg-orange-600 text-white text-xl font-bold py-4 rounded-xl hover:bg-orange-700 transition shadow-lg">
                                    ENTRAR A VIDEOLLAMADA
                                </a>
                            </div>
                        ) : hasUploaded ? (
                            <div>
                                <div className="flex justify-center mb-4"><span className="animate-spin text-3xl">⏳</span></div>
                                <h3 className="font-bold text-gray-800 text-xl">Verificando tu pago...</h3>
                                <p className="text-gray-500 mt-2">Esto suele tomar menos de 2 minutos.</p>
                                {stopPolling && <p className="text-sm text-red-500 mt-4 font-bold bg-red-50 p-3 rounded-xl">Tarda más de lo usual. Puedes esperar, recargar o cancelar.</p>}
                            </div>
                        ) : (
                            <div className="text-gray-400">
                                <p className="text-lg">🔒 El enlace de videollamada se habilitará cuando confirmemos tu pago.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* DERECHA: PAGO Y SUBIDA */}
                <div className="w-full md:w-1/2 bg-slate-900 p-8 flex flex-col justify-center items-center text-white relative">
                    {!hasUploaded ? (
                        <div className="w-full max-w-md text-center">
                            <h2 className="text-2xl font-bold text-orange-400 mb-6">1. Realiza el Pago</h2>
                            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto mb-6 shadow-2xl">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=YAPE-PLIN-ZANAHOY" alt="QR" className="w-full h-full rounded-xl"/>
                            </div>
                            <p className="font-mono text-2xl font-bold mb-8 tracking-wider">Yape/Plin: 999-000-000</p>

                            <h2 className="text-xl font-bold text-orange-400 mb-4">2. Sube la Captura</h2>
                            <form onSubmit={submitPayment} className="space-y-4">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-300 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer bg-slate-800 rounded-xl"
                                    accept="image/*"
                                />
                                {errors.payment_proof && <p className="text-red-400 text-sm font-bold">{errors.payment_proof}</p>}
                                
                                <button type="submit" disabled={processing || !data.payment_proof} className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:hover:bg-green-600 text-lg">
                                    {processing ? 'SUBIENDO...' : 'ENVIAR COMPROBANTE'}
                                </button>
                            </form>

                            {/* NUEVO BOTÓN CANCELAR (Diseño fantasma/outline) */}
                            <div className="mt-10 border-t border-slate-700 pt-6">
                                <button 
                                    onClick={handleCancel} 
                                    className="w-full border-2 border-slate-700 text-slate-400 font-bold py-3 rounded-xl hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all flex justify-center items-center"
                                >
                                    <span className="mr-2 text-xl">❌</span> Cancelar Solicitud
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="text-7xl mb-6">✅</div>
                            <h2 className="text-3xl font-black mb-2">¡Comprobante Enviado!</h2>
                            <p className="text-slate-400 text-lg">Mantente atento, tu experto se conectará pronto.</p>
                            
                            {/* BOTÓN CANCELAR MIENTRAS ESPERA */}
                            <button 
                                onClick={handleCancel} 
                                className="mt-12 border-2 border-slate-700 text-slate-400 font-bold py-3 px-8 rounded-xl hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all inline-flex justify-center items-center"
                            >
                                <span className="mr-2">❌</span> Cancelar Solicitud
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}