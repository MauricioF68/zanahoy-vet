import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import Modal from '@/Components/Modal';

// 👇 NOTA: Ahora recibimos 'pendingPayments' como prop
export default function Payments({ auth, pendingPayments, inValidation, paidHistory }) {
    
    // Estado para ver fotos de historial
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    
    // Estados y Formulario para pagar deudas
    const [selectedDebt, setSelectedDebt] = useState(null); 
    const { data, setData, post, processing, errors, reset } = useForm({
        triage_id: '',
        payment_proof: null
    });

    const openPaymentModal = (triageId) => {
        setData('triage_id', triageId);
        setSelectedDebt(triageId);
    };

    const submitPayment = (e) => {
        e.preventDefault();
        post(route('triage.payment'), {
            onSuccess: () => {
                setSelectedDebt(null);
                reset();
            },
            forceFormData: true 
        });
    };

    // Calcular deuda total para el encabezado
    const totalDebt = pendingPayments ? pendingPayments.reduce((sum, triage) => sum + parseFloat(triage.amount), 0) : 0;

    return (
        <ClientLayout user={auth.user} header={
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight flex items-center">
                    <span className="mr-2">💳</span> Mis Pagos
                </h2>
                {totalDebt > 0 && (
                    <span className="bg-red-100 text-red-800 font-black px-4 py-1 rounded-full border border-red-200 shadow-sm animate-pulse">
                        Deuda Total: S/ {totalDebt.toFixed(2)}
                    </span>
                )}
            </div>
        }>
            <Head title="Mis Pagos" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* --- SECCIÓN 1: DEUDAS PENDIENTES (¡LO NUEVO!) --- */}
                    {pendingPayments && pendingPayments.length > 0 && (
                        <div className="px-4 sm:px-0">
                            <h3 className="text-xl font-black text-red-600 mb-4 flex items-center">
                                <span className="mr-2">🚨</span> Acción Requerida: Pagos Pendientes
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingPayments.map(triage => (
                                    <div key={triage.id} className="bg-white border-2 border-red-400 rounded-2xl shadow-lg overflow-hidden transform transition hover:-translate-y-1">
                                        <div className="bg-red-500 text-white p-4 text-center">
                                            <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Emergencia Atendida</p>
                                            <h4 className="text-3xl font-black">S/ {triage.amount}</h4>
                                        </div>
                                        <div className="p-5 bg-white">
                                            <p className="text-gray-600 font-medium mb-1">
                                                Paciente: <span className="font-bold text-gray-800">{triage.pet.name}</span>
                                            </p>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Fecha: {new Date(triage.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                            <button 
                                                onClick={() => openPaymentModal(triage.id)}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-md transition-colors flex items-center justify-center"
                                            >
                                                <span className="mr-2">💸</span> REGULARIZAR PAGO
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- SECCIÓN 2: EN VALIDACIÓN --- */}
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

                    {/* --- SECCIÓN 3: HISTORIAL DE PAGOS APROBADOS --- */}
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

            {/* --- MODAL 1: VER COMPROBANTE --- */}
            <Modal show={selectedReceipt !== null} onClose={() => setSelectedReceipt(null)} maxWidth="md">
                <div className="p-6 bg-white">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-xl font-black text-gray-800">Tu Comprobante</h3>
                        <button onClick={() => setSelectedReceipt(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 flex justify-center items-center min-h-[300px]">
                        {selectedReceipt ? (
                            <img src={selectedReceipt} alt="Comprobante" className="max-w-full h-auto rounded shadow-sm object-contain max-h-[60vh]" />
                        ) : (
                            <p className="text-gray-400">Imagen no disponible</p>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={() => setSelectedReceipt(null)} className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cerrar</button>
                    </div>
                </div>
            </Modal>

            {/* --- MODAL 2: PAGAR DEUDA --- */}
            <Modal show={selectedDebt !== null} onClose={() => setSelectedDebt(null)} maxWidth="md">
                <form onSubmit={submitPayment} className="p-6 bg-white">
                    <h2 className="text-2xl font-black text-gray-800 mb-4 border-b pb-2">Subir Comprobante 💸</h2>
                    <p className="text-gray-600 mb-6">Sube la captura de tu transferencia para regularizar tu pago y desbloquear la receta médica de tu mascota.</p>
                    
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => setData('payment_proof', e.target.files[0])}
                        className="w-full border border-gray-300 rounded p-2 mb-2 focus:ring-red-500 focus:border-red-500"
                        required
                    />
                    {errors.payment_proof && <span className="text-red-500 text-sm block mb-4">{errors.payment_proof}</span>}

                    <div className="mt-8 flex justify-end items-center">
                        <button type="button" onClick={() => setSelectedDebt(null)} className="text-gray-500 font-bold mr-4 hover:text-gray-700">Cancelar</button>
                        <button type="submit" disabled={processing} className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-lg shadow-lg disabled:opacity-50 transition-colors">
                            {processing ? 'Subiendo...' : 'ENVIAR COMPROBANTE'}
                        </button>
                    </div>
                </form>
            </Modal>

        </ClientLayout>
    );
}