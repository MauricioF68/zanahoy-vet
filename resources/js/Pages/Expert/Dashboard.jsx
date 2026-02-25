import React, { useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard({ auth, availableCases }) {
    const { post, processing } = useForm();

    // POLLING: Actualizar el radar cada 5 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['availableCases'] });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleAccept = (id) => {
        post(route('expert.case.accept', id));
    };

    // Helper para etiquetas
    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Panel de Expertos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-black text-gray-800 flex items-center">
                            <span className="mr-2 animate-pulse text-green-500">●</span> 
                            Radar de Casos Disponibles
                        </h1>
                        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                            Actualizando en tiempo real...
                        </span>
                    </div>

                    {availableCases.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12 text-center">
                            <div className="text-6xl mb-4">☕</div>
                            <h3 className="text-lg font-medium text-gray-900">Todo tranquilo por ahora</h3>
                            <p className="text-gray-500">No hay casos pendientes. Aprovecha para descansar.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableCases.map((triage) => (
                                <div key={triage.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                    
                                    {/* Encabezado con Gravedad */}
                                    <div className={`px-6 py-3 border-b flex justify-between items-center ${getPriorityColor(triage.priority)}`}>
                                        <span className="font-bold uppercase text-xs tracking-wider">{triage.priority}</span>
                                        <span className="text-xs font-mono">{new Date(triage.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>

                                    <div className="p-6">
                                        {/* Info Mascota */}
                                        <div className="flex items-center mb-4">
                                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl mr-4">
                                                {triage.pet.type === 'dog' ? '🐶' : triage.pet.type === 'cat' ? '🐱' : '🐾'}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">{triage.pet.name}</h3>
                                                <p className="text-sm text-gray-500">{triage.pet.breed} • {triage.pet.age_human_years} años</p>
                                            </div>
                                        </div>

                                        {/* Síntomas (Resumen) */}
                                        <div className="mb-6">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Síntomas / Motivo</p>
                                            <div className="text-gray-700 font-medium line-clamp-2 min-h-[3rem]">
                                                {/* Aquí deberíamos decodificar el JSON de síntomas, por ahora mostramos descripción */}
                                                {triage.description || "Sin descripción detallada..."}
                                            </div>
                                        </div>

                                        {/* Botón de Acción */}
                                        <button 
                                            onClick={() => handleAccept(triage.id)}
                                            disabled={processing}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center"
                                        >
                                            {processing ? (
                                                <span className="animate-spin mr-2">⏳</span>
                                            ) : (
                                                <span className="mr-2">⚡</span>
                                            )}
                                            TOMAR CASO
                                        </button>
                                        
                                        {triage.status === 'pending_payment' && (
                                            <p className="text-center text-xs text-orange-500 mt-3 font-medium">
                                                💰 Cliente aún no paga (Resérvalo)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}