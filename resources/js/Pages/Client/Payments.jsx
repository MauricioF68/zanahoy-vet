import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import Modal from '@/Components/Modal';

export default function Payments({ auth, inValidation, paidHistory }) {
    
    // Estado para controlar qué foto de comprobante se muestra en el modal
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    return (
        <ClientLayout user={auth.user} header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight flex items-center">
                <span className="mr-2">💳</span> Mis Pagos
            </h2>
        }>
            <Head title="Mis Pagos" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* --- SECCIÓN 1: EN VALIDACIÓN --- */}
                    {inValidation && inValidation.length > 0 && (
                        <div className="px-4 sm:px-0">
                            <h3 className="text-lg font-black text-gray-700 mb-4 flex items-center">
                                <span className="mr-2 text-orange-500">⏳</span> Comprobantes en Validación
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {inValidation.map(triage => (
                                    <div key={triage.id} className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-xl shadow-sm flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-orange-800 text-lg">S/ {triage.amount}</h4>
                                            <p className="text-sm text-orange-600 font-medium">Paciente: {triage.pet.name}</p>
                                            <p className="text-xs text-orange-500 mt-1">ID: {triage.payment_code}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-orange-200 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">En Revisión</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- SECCIÓN 2: HISTORIAL DE PAGOS APROBADOS --- */}
                    <div className="px-4 sm:px-0">
                        <h3 className="text-lg font-black text-gray-700 mb-4 flex items-center">
                            <span className="mr-2 text-green-500">✅</span> Historial de Pagos
                        </h3>
                        
                        {paidHistory && paidHistory.length > 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                                <th className="p-4 font-bold">Fecha / ID</th>
                                                <th className="p-4 font-bold">Paciente</th>
                                                <th className="p-4 font-bold">Monto</th>
                                                <th className="p-4 font-bold text-center">Comprobante</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {paidHistory.map(triage => (
                                                <tr key={triage.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-800">
                                                            {new Date(triage.created_at).toLocaleDateString('es-ES')}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono mt-1">
                                                            {triage.payment_code}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xl">{triage.pet.type === 'dog' ? '🐶' : '🐱'}</span>
                                                            <span className="font-bold text-gray-700">{triage.pet.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="font-black text-gray-800">S/ {triage.amount}</span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {triage.payment_proof_path ? (
                                                            <button 
                                                                onClick={() => setSelectedReceipt(`/storage/${triage.payment_proof_path}`)}
                                                                className="text-indigo-600 hover:text-indigo-800 font-bold text-sm bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center mx-auto"
                                                            >
                                                                <span className="mr-1">👁️</span> Ver Foto
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs italic">Sin foto</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <span className="text-5xl block mb-4 filter grayscale opacity-50">🧾</span>
                                <h3 className="text-lg font-bold text-gray-600">No hay pagos registrados</h3>
                                <p className="text-gray-400 text-sm mt-1">Aquí aparecerán tus pagos validados por la clínica.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* --- MODAL PARA VER EL COMPROBANTE --- */}
            <Modal show={selectedReceipt !== null} onClose={() => setSelectedReceipt(null)} maxWidth="md">
                <div className="p-6 bg-white">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-xl font-black text-gray-800">Tu Comprobante</h3>
                        <button onClick={() => setSelectedReceipt(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl">
                            &times;
                        </button>
                    </div>
                    
                    <div className="bg-gray-100 rounded-lg p-2 flex justify-center items-center min-h-[300px]">
                        {selectedReceipt ? (
                            <img 
                                src={selectedReceipt} 
                                alt="Comprobante de Pago" 
                                className="max-w-full h-auto rounded shadow-sm object-contain max-h-[60vh]"
                            />
                        ) : (
                            <p className="text-gray-400">Imagen no disponible</p>
                        )}
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={() => setSelectedReceipt(null)} 
                            className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </Modal>

        </ClientLayout>
    );
}