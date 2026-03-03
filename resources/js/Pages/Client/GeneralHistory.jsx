import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import Modal from '@/Components/Modal';

export default function GeneralHistory({ auth, pets }) {
    
    const [activeTab, setActiveTab] = useState('all'); // 'all' o el ID de la mascota
    const [selectedDebt, setSelectedDebt] = useState(null); 

    const { data, setData, post, processing, errors } = useForm({
        triage_id: '',
        payment_proof: null
    });

    // Aplanar todos los historiales en una sola lista para la pestaña "Todos"
    const allHistories = pets.flatMap(pet => 
        pet.triages.map(triage => ({ ...triage, pet }))
    ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Filtrar según la pestaña seleccionada
    const displayedHistories = activeTab === 'all' 
        ? allHistories 
        : allHistories.filter(h => h.pet_id === activeTab);

    const openPaymentModal = (triageId) => {
        setData('triage_id', triageId);
        setSelectedDebt(triageId);
    };

    const submitPayment = (e) => {
        e.preventDefault();
        post(route('triage.payment'), {
            onSuccess: () => setSelectedDebt(null),
            forceFormData: true 
        });
    };

    return (
        <ClientLayout user={auth.user} header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight flex items-center">
                <span className="mr-2">📂</span> Historial Clínico Integral
            </h2>
        }>
            <Head title="Historial Clínico" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* --- FILTROS POR MASCOTA (TABS) --- */}
                    {pets.length > 0 && (
                        <div className="flex overflow-x-auto space-x-2 mb-8 pb-2 scrollbar-hide px-4 sm:px-0">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${activeTab === 'all' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                            >
                                🐾 Todos
                            </button>
                            {pets.map(pet => (
                                <button
                                    key={pet.id}
                                    onClick={() => setActiveTab(pet.id)}
                                    className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${activeTab === pet.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                                >
                                    {pet.type === 'dog' ? '🐶 ' : '🐱 '} {pet.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* --- LISTA DE TARJETAS --- */}
                    {displayedHistories.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-sm p-12 text-center border-2 border-dashed border-gray-200 mx-4 sm:mx-0">
                            <span className="text-6xl mb-4 block">🩺</span>
                            <h3 className="text-xl font-bold text-gray-700">Sin registros médicos</h3>
                            <p className="text-gray-500 mt-2">No se encontraron historiales clínicos para esta selección.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 px-4 sm:px-0">
                            {displayedHistories.map((triage) => {
                                const isLocked = triage.payment_status === 'debtor';
                                const isPendingValidation = triage.payment_status === 'pending' && triage.payment_proof_path;

                                return (
                                    <div key={triage.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${isLocked ? 'border-red-200' : 'border-gray-100 hover:shadow-md'}`}>
                                        
                                        {/* CABECERA */}
                                        <div className={`p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center ${isLocked ? 'bg-red-50' : 'bg-gray-50 border-b border-gray-100'}`}>
                                            <div className="flex items-center space-x-4">
                                                <div className="h-14 w-14 rounded-full bg-white shadow flex items-center justify-center text-2xl border border-gray-100">
                                                    {triage.pet.type === 'dog' ? '🐶' : '🐱'}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-800 flex items-center">
                                                        {triage.presumptive_diagnosis || "Consulta General"}
                                                        {isLocked && <span className="ml-2 text-red-500 text-lg">🔒</span>}
                                                    </h3>
                                                    <p className="text-sm font-bold text-indigo-600 mt-1">Paciente: {triage.pet.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        📅 {new Date(triage.created_at).toLocaleDateString('es-ES')} | 👨‍⚕️ Dr. {triage.expert?.name || 'Veterinario'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 sm:mt-0 bg-white border px-3 py-1 rounded-lg text-xs font-mono text-gray-500 shadow-sm">
                                                ID: {triage.payment_code}
                                            </div>
                                        </div>

                                        {/* CUERPO DEL INFORME */}
                                        <div className="p-6">
                                            {isLocked ? (
                                                <div className="relative rounded-xl overflow-hidden bg-white border border-gray-100 p-6">
                                                    <div className="filter blur-md select-none opacity-30 pointer-events-none">
                                                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus iusto impedit recusandae.</p>
                                                        <br/>
                                                        <p>Omeprazol 10mg - 1 pastilla. Reposo absoluto por 3 días seguidos.</p>
                                                    </div>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                                        <h3 className="text-xl font-black text-red-600 mb-2">Informe Retenido</h3>
                                                        <p className="text-sm text-gray-600 mb-4 max-w-sm">
                                                            Para ver la receta y las indicaciones del médico, regulariza el pago por atención de emergencia de <span className="font-bold text-red-600">S/ {triage.amount}</span>.
                                                        </p>
                                                        <button 
                                                            onClick={() => openPaymentModal(triage.id)}
                                                            className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-2 rounded-lg shadow-md transform transition hover:scale-105"
                                                        >
                                                            💸 SUBIR COMPROBANTE
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : isPendingValidation ? (
                                                <div className="text-center py-6 bg-orange-50 rounded-xl border border-orange-200">
                                                    <h3 className="text-lg font-bold text-orange-800">⏳ Validando Pago...</h3>
                                                    <p className="text-sm text-orange-600 mt-1">En breves minutos tu receta será desbloqueada.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                                        <h4 className="font-bold text-indigo-800 mb-2 text-sm">💊 Receta Médica</h4>
                                                        <p className="text-indigo-900 text-sm whitespace-pre-wrap">{triage.prescription}</p>
                                                    </div>
                                                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                                                        <h4 className="font-bold text-green-800 mb-2 text-sm">🏠 Cuidados Generales</h4>
                                                        <p className="text-green-900 text-sm whitespace-pre-wrap">{triage.medical_instructions}</p>
                                                    </div>
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

            {/* MODAL DE PAGO (Sin cambios) */}
            <Modal show={selectedDebt !== null} onClose={() => setSelectedDebt(null)}>
                <form onSubmit={submitPayment} className="p-6">
                    <h2 className="text-xl font-black text-gray-800 mb-4 border-b pb-2">Subir Comprobante 💸</h2>
                    <p className="text-sm text-gray-600 mb-4">Sube una foto de tu transferencia para desbloquear la receta.</p>
                    <input type="file" accept="image/*" onChange={e => setData('payment_proof', e.target.files[0])} className="w-full border rounded p-2 mb-2" required />
                    {errors.payment_proof && <span className="text-red-500 text-xs block mb-4">{errors.payment_proof}</span>}
                    <div className="mt-6 flex justify-end">
                        <button type="button" onClick={() => setSelectedDebt(null)} className="text-gray-500 font-bold mr-4">Cancelar</button>
                        <button type="submit" disabled={processing} className="bg-green-600 text-white font-bold px-4 py-2 rounded shadow disabled:opacity-50">ENVIAR</button>
                    </div>
                </form>
            </Modal>
        </ClientLayout>
    );
}