import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import Modal from '@/Components/Modal';

export default function PetHistory({ auth, pet, history }) {
    
    const [selectedDebt, setSelectedDebt] = useState(null); // Para el modal de pago
    const { data, setData, post, processing, errors } = useForm({
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
            onSuccess: () => setSelectedDebt(null),
            forceFormData: true // Importante para subir imágenes
        });
    };

    return (
        <ClientLayout user={auth.user} header={
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight flex items-center">
                    <span className="mr-2">📂</span> Historial Clínico: <span className="font-black ml-2 text-indigo-600">{pet.name}</span>
                </h2>
                <Link href={route('dashboard')} className="text-sm font-bold text-gray-500 hover:text-indigo-600">
                    &larr; Volver a Mis Mascotas
                </Link>
            </div>
        }>
            <Head title={`Historial - ${pet.name}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {history.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-sm p-12 text-center border-2 border-dashed border-gray-200">
                            <span className="text-6xl mb-4 block">🩺</span>
                            <h3 className="text-xl font-bold text-gray-700">Sin historial médico</h3>
                            <p className="text-gray-500 mt-2">Aún no hay consultas finalizadas para {pet.name}.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {history.map((triage) => {
                                // EVALUAMOS EL CANDADO
                                const isLocked = triage.payment_status === 'debtor';
                                const isPendingValidation = triage.payment_status === 'pending' && triage.payment_proof_path;

                                return (
                                    <div key={triage.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 relative">
                                        
                                        {/* CABECERA DE LA CONSULTA */}
                                        <div className="bg-slate-800 p-4 sm:p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                            <div>
                                                <div className="text-sm font-bold text-slate-400 mb-1">
                                                    {new Date(triage.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                                <h3 className="text-2xl font-black text-orange-400">
                                                    Diagnóstico: {triage.presumptive_diagnosis || "Consulta General"}
                                                </h3>
                                                <p className="text-sm text-slate-300 mt-1 flex items-center">
                                                    <span className="mr-2">👨‍⚕️</span> Atendido por: <span className="font-bold ml-1">{triage.expert?.name || 'Doctor de Turno'}</span>
                                                </p>
                                            </div>
                                            <div className="mt-4 sm:mt-0 font-mono text-sm bg-slate-700 px-3 py-1 rounded text-slate-300">
                                                ID: {triage.payment_code}
                                            </div>
                                        </div>

                                        {/* CONTENIDO DEL INFORME (Con o sin candado) */}
                                        <div className="p-6">
                                            {isLocked ? (
                                                <div className="relative">
                                                    {/* Fondo Borroso */}
                                                    <div className="filter blur-sm select-none opacity-40 pointer-events-none">
                                                        <div className="mb-4">
                                                            <h4 className="font-bold text-gray-800">Receta Médica</h4>
                                                            <p className="text-gray-600 bg-gray-50 p-4 rounded">Medicamento Lorem Ipsum 10mg - 1 pastilla cada 12 horas...</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800">Cuidados Especiales</h4>
                                                            <p className="text-gray-600 bg-gray-50 p-4 rounded">Dieta estricta, reposo absoluto por 3 días...</p>
                                                        </div>
                                                    </div>

                                                    {/* EL CANDADO GIGANTE (Overlay) */}
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl z-10 p-6 text-center">
                                                        <span className="text-5xl mb-4 drop-shadow-lg">🔒</span>
                                                        <h3 className="text-2xl font-black text-gray-800 mb-2">Informe Bloqueado</h3>
                                                        <p className="text-gray-600 font-medium mb-4 max-w-md">
                                                            Tu mascota fue estabilizada con éxito. Para ver la receta completa y las indicaciones médicas, debes regularizar tu pago de <span className="font-black text-red-600">S/ {triage.amount}</span>.
                                                        </p>
                                                        <button 
                                                            onClick={() => openPaymentModal(triage.id)}
                                                            className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3 rounded-xl shadow-lg transform transition hover:scale-105"
                                                        >
                                                            💸 SUBIR COMPROBANTE DE PAGO
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : isPendingValidation ? (
                                                <div className="text-center py-12 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200">
                                                    <span className="text-5xl mb-4 block">⏳</span>
                                                    <h3 className="text-xl font-bold text-orange-800">Validando Pago...</h3>
                                                    <p className="text-orange-600 mt-2">Hemos recibido tu comprobante. En breves minutos el sistema desbloqueará tu receta médica.</p>
                                                </div>
                                            ) : (
                                                /* VISTA DESBLOQUEADA (El premio por pagar) */
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                                                        <h4 className="font-black text-indigo-800 mb-3 flex items-center">
                                                            <span className="mr-2 text-xl">💊</span> Receta Médica
                                                        </h4>
                                                        <p className="text-indigo-900 whitespace-pre-wrap leading-relaxed">
                                                            {triage.prescription || "Sin medicamentos recetados."}
                                                        </p>
                                                    </div>
                                                    <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                                                        <h4 className="font-black text-green-800 mb-3 flex items-center">
                                                            <span className="mr-2 text-xl">🏠</span> Cuidados y Recomendaciones
                                                        </h4>
                                                        <p className="text-green-900 whitespace-pre-wrap leading-relaxed">
                                                            {triage.medical_instructions || "Sin cuidados adicionales registrados."}
                                                        </p>
                                                    </div>
                                                    {triage.anamnesis && (
                                                        <div className="col-span-1 md:col-span-2 mt-4 bg-gray-50 p-4 rounded-lg text-sm text-gray-600 border border-gray-200">
                                                            <span className="font-bold block mb-1">Observaciones Clínicas (Anamnesis):</span>
                                                            {triage.anamnesis}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL PARA SUBIR VOUCHER */}
            <Modal show={selectedDebt !== null} onClose={() => setSelectedDebt(null)}>
                <form onSubmit={submitPayment} className="p-6">
                    <h2 className="text-2xl font-black text-gray-800 mb-4 border-b pb-2">Subir Comprobante 💸</h2>
                    <p className="text-gray-600 mb-6">Por favor, sube una foto o captura de pantalla de tu transferencia para desbloquear tu informe.</p>
                    
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => setData('payment_proof', e.target.files[0])}
                        className="w-full border border-gray-300 rounded p-2 mb-2"
                        required
                    />
                    {errors.payment_proof && <span className="text-red-500 text-sm block mb-4">{errors.payment_proof}</span>}

                    <div className="mt-8 flex justify-end">
                        <button type="button" onClick={() => setSelectedDebt(null)} className="text-gray-500 font-bold mr-4">Cancelar</button>
                        <button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-2 rounded-lg shadow disabled:opacity-50">
                            {processing ? 'Subiendo...' : 'ENVIAR PARA VALIDACIÓN'}
                        </button>
                    </div>
                </form>
            </Modal>

        </ClientLayout>
    );
}