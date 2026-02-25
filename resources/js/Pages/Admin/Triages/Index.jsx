import React, { useEffect, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react'; // Importar router
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal'; // Asegúrate de tener este componente o usa uno simple

export default function Index({ auth, triages }) {
    const { post, processing } = useForm();
    const [selectedImage, setSelectedImage] = useState(null); // Para el modal de la foto

    // POLLING ADMIN: Actualizar tabla cada 10 segundos para ver nuevos casos/pagos
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['triages'], preserveScroll: true });
        }, 10000); 
        return () => clearInterval(interval);
    }, []);

    const handleApprovePayment = (id) => {
        if (confirm('¿Imagen correcta? Validar pago.')) {
            post(route('admin.triages.approve_payment', id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="Torre de Control">
            <Head title="Gestión de Casos" />

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                {/* ... (Encabezado de tabla igual que antes) ... */}
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora/Paciente</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Gravedad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pago</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {triages.map((triage) => (
                            <tr key={triage.id} className={triage.priority === 'critical' ? 'bg-red-50' : ''}>
                                {/* ... Columnas de Info ... */}
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold">{triage.pet.name}</div>
                                    <div className="text-xs text-gray-500 mb-1">
                                        {new Date(triage.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                    </div>
                                    
                                    {/* ALERTA DE LA IA EN EL ADMIN */}
                                    {triage.system_diagnosis && (
                                        <div 
                                            className="mt-2 text-xs font-bold text-red-700 bg-red-50 p-1.5 rounded border border-red-200 line-clamp-2" 
                                            title={triage.system_diagnosis}
                                        >
                                            🤖 IA: {triage.system_diagnosis}
                                        </div>
                                    )}
                                </td>
                                
                                <td className="px-6 py-4 text-center">
                                    {/* Badges de gravedad (mismo código anterior) */}
                                    <span className={`px-2 py-1 text-xs font-bold rounded ${triage.priority === 'critical' ? 'bg-red-600 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {triage.priority.toUpperCase()}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-sm">
                                    {triage.status}
                                    {triage.user_decision === 'goto_clinic' && <div className="text-red-600 font-bold text-xs">🚗 Fue a Clínica</div>}
                                </td>

                                {/* COLUMNA DE PAGO (NUEVA) */}
                                <td className="px-6 py-4 text-center">
                                    {triage.payment_proof_path ? (
                                        <button 
                                            onClick={() => setSelectedImage(`/storage/${triage.payment_proof_path}`)}
                                            className="text-blue-600 underline font-bold text-xs hover:text-blue-800"
                                        >
                                            🖼️ Ver Foto
                                        </button>
                                    ) : (
                                        <span className="text-gray-300 text-xs">Sin foto</span>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-right">
                                    {triage.status === 'pending_payment' && (
                                        <button 
                                            onClick={() => handleApprovePayment(triage.id)}
                                            // Desactivado si NO hay foto (opcional, según tu lógica)
                                            disabled={processing || !triage.payment_proof_path} 
                                            className={`font-bold py-1 px-3 rounded shadow text-white ${!triage.payment_proof_path ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                                        >
                                            $$ Validar
                                        </button>
                                    )}
                                    {triage.meeting_link && (
                                        <a href={triage.meeting_link} target="_blank" className="text-indigo-600 underline font-bold">Jitsi</a>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL PARA VER FOTO */}
            <Modal show={!!selectedImage} onClose={() => setSelectedImage(null)}>
                <div className="p-4">
                    <h3 className="text-lg font-bold mb-4">Comprobante de Pago</h3>
                    {selectedImage && <img src={selectedImage} alt="Comprobante" className="w-full rounded-lg" />}
                    <div className="mt-4 flex justify-end">
                        <button onClick={() => setSelectedImage(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Cerrar</button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}