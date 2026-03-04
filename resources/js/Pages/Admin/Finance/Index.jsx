import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function Index({ auth, finances, paymentMethods, banks, auditPin }) {
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Modal de Auditoría
    const [auditModalOpen, setAuditModalOpen] = useState(false);
    const [selectedTriage, setSelectedTriage] = useState(null);
    const [isFormLocked, setIsFormLocked] = useState(false); // 🔒 El Candado

    const { data, setData, post, processing, errors, reset } = useForm({
        payment_method_id: '',
        bank_id: '',
        operation_number: '',
        transaction_date: '',
        sender_name: ''
    });

    const filteredFinances = finances.filter((item) => {
        const matchSearch = (item.payment_code?.toLowerCase().includes(searchTerm.toLowerCase())) || (item.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchStatus = statusFilter === 'all' || item.payment_status === statusFilter;
        return matchSearch && matchStatus;
    });

    // --- ABRIR EL MODAL DE AUDITORÍA ---
    const openAuditModal = (triage) => {
        setSelectedTriage(triage);
        
        // Autocompletar datos inteligentes
        setData({
            payment_method_id: triage.payment_method_id || '',
            bank_id: triage.bank_id || '',
            operation_number: triage.operation_number || '',
            // Si no tiene fecha auditada, ponemos la fecha/hora actual
            transaction_date: triage.transaction_date ? triage.transaction_date.substring(0, 16) : new Date().toISOString().substring(0, 16),
            sender_name: triage.sender_name || triage.pet?.user?.name || ''
        });

        setIsFormLocked(triage.is_audited); // Si ya estaba auditado, entra bloqueado
        setAuditModalOpen(true);
    };

    // --- LÓGICA DEL PIN PARA DESBLOQUEAR ---
    const handleUnlock = () => {
        const pin = prompt('🔒 Ingrese el PIN de Auditoría para desbloquear este comprobante:');
        if (pin === auditPin) {
            setIsFormLocked(false);
        } else if (pin !== null) {
            alert('❌ PIN Incorrecto.');
        }
    };

    // --- GUARDAR AUDITORÍA ---
    const submitAudit = (e) => {
        e.preventDefault();
        post(route('admin.finance.approve', selectedTriage.id), {
            onSuccess: () => {
                setAuditModalOpen(false);
                reset();
            }
        });
    };

    // Determinar si el método de pago seleccionado requiere banco
    const selectedMethod = paymentMethods.find(m => m.id === parseInt(data.payment_method_id));
    const requiresBank = selectedMethod?.requires_bank || false;

    // Helpers visuales
    const getPaymentBadge = (status, is_audited) => {
        if (is_audited) return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-300">🔒 AUDITADO</span>;
        switch(status) {
            case 'paid': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">✅ PAGADO</span>;
            case 'debtor': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">🚨 DEUDOR</span>;
            case 'pending': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold animate-pulse">💸 EN REVISIÓN</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">⏳ PENDIENTE</span>;
        }
    };

    return (
        <AdminLayout user={auth.user} header="💰 Auditoría y Contabilidad">
            <Head title="Finanzas" />

            <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Buscar</label>
                    <input type="text" placeholder="Código o Paciente..." className="w-full rounded border-gray-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="w-48">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estado</label>
                    <select className="w-full rounded border-gray-300" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Todos</option>
                        <option value="paid">✅ Pagados</option>
                        <option value="pending">💸 En Revisión</option>
                        <option value="debtor">🚨 Deudores</option>
                    </select>
                </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-800 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase">ID / Paciente</th>
                            <th className="px-4 py-3 text-center text-xs font-bold uppercase">Monto (S/)</th>
                            <th className="px-4 py-3 text-center text-xs font-bold uppercase">Estado Contable</th>
                            <th className="px-4 py-3 text-right text-xs font-bold uppercase">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredFinances.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4">
                                    <div className="font-bold text-gray-800">{item.pet?.name}</div>
                                    <div className="text-xs text-indigo-600 font-mono">{item.payment_code || `SIN-COD-${item.id}`}</div>
                                </td>
                                <td className="px-4 py-4 text-center font-black text-lg text-gray-700">
                                    S/ {item.amount ? Number(item.amount).toFixed(2) : '0.00'}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    {getPaymentBadge(item.payment_status, item.is_audited)}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <button 
                                        onClick={() => openAuditModal(item)}
                                        className={`px-4 py-2 rounded shadow text-xs font-bold text-white transition-colors ${item.is_audited ? 'bg-gray-600 hover:bg-gray-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    >
                                        {item.is_audited ? '🔒 Ver Auditoría' : '📝 Auditar Voucher'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- EL SÚPER MODAL SPLIT-SCREEN --- */}
            <Modal show={auditModalOpen} onClose={() => setAuditModalOpen(false)} maxWidth="5xl">
                {selectedTriage && (
                    <div className="flex flex-col md:flex-row h-[85vh] bg-gray-50">
                        
                        {/* LADO IZQUIERDO: EL VOUCHER */}
                        <div className="w-full md:w-1/2 bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-y-auto">
                            <h3 className="text-white font-black text-xl mb-4 absolute top-6 left-6">📷 Voucher Adjunto</h3>
                            {selectedTriage.payment_proof_path ? (
                                <img src={`/storage/${selectedTriage.payment_proof_path}`} alt="Voucher" className="max-w-full h-auto rounded-xl shadow-2xl border-4 border-slate-700" />
                            ) : (
                                <div className="text-center text-slate-500">
                                    <span className="text-6xl block mb-4">📄</span>
                                    <p>El cliente no adjuntó comprobante.</p>
                                </div>
                            )}
                        </div>

                        {/* LADO DERECHO: FORMULARIO CONTABLE */}
                        <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800">Auditoría Contable</h2>
                                    <p className="text-sm text-indigo-600 font-bold">Monto esperado: S/ {selectedTriage.amount}</p>
                                </div>
                                <button onClick={() => setAuditModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
                            </div>

                            {/* Alerta de Candado */}
                            {isFormLocked && (
                                <div className="mb-6 bg-yellow-50 border border-yellow-300 p-4 rounded-xl flex justify-between items-center shadow-sm">
                                    <div className="flex items-center text-yellow-800">
                                        <span className="text-2xl mr-3">🔒</span>
                                        <div>
                                            <p className="font-bold text-sm">Voucher Auditado y Cerrado</p>
                                            <p className="text-xs">Los datos no pueden modificarse.</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleUnlock} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-3 py-1.5 rounded text-xs transition">
                                        🔑 Desbloquear
                                    </button>
                                </div>
                            )}

                            <form onSubmit={submitAudit} className="space-y-5">
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Fecha y Hora de Transacción" />
                                        <TextInput type="datetime-local" className="w-full mt-1 bg-gray-50" value={data.transaction_date} onChange={e => setData('transaction_date', e.target.value)} disabled={isFormLocked} required />
                                    </div>
                                    <div>
                                        <InputLabel value="Monto Depositado" />
                                        {/* Solo lectura por seguridad financiera, el sistema exige exactitud */}
                                        <TextInput type="text" className="w-full mt-1 bg-gray-200 text-gray-600 font-bold cursor-not-allowed" value={`S/ ${selectedTriage.amount}`} disabled />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Remitente (Nombre de quien deposita)" />
                                    <TextInput type="text" className="w-full mt-1" placeholder="Ej: Juan Perez" value={data.sender_name} onChange={e => setData('sender_name', e.target.value)} disabled={isFormLocked} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Método de Pago" />
                                        <select className={`w-full mt-1 rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${isFormLocked ? 'bg-gray-100' : ''}`} value={data.payment_method_id} onChange={e => setData('payment_method_id', e.target.value)} disabled={isFormLocked} required>
                                            <option value="">Seleccione...</option>
                                            {paymentMethods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                    </div>
                                    
                                    {/* CAMPO DINÁMICO: Solo aparece si el método pide banco */}
                                    {requiresBank && (
                                        <div className="animate-fade-in-up">
                                            <InputLabel value="Banco de Origen" />
                                            <select className={`w-full mt-1 rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${isFormLocked ? 'bg-gray-100' : ''}`} value={data.bank_id} onChange={e => setData('bank_id', e.target.value)} disabled={isFormLocked} required>
                                                <option value="">Seleccione banco...</option>
                                                {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputLabel value="Número de Operación / Referencia" className="text-indigo-700 font-bold" />
                                    <TextInput type="text" className="w-full mt-1 border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 font-mono font-bold" placeholder="Ej: 00012345678" value={data.operation_number} onChange={e => setData('operation_number', e.target.value)} disabled={isFormLocked} required />
                                </div>

                                <div className="pt-6 mt-6 border-t flex justify-end">
                                    {!isFormLocked && (
                                        <button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700 text-white font-black py-3 px-8 rounded-xl shadow-lg transition-colors w-full flex items-center justify-center">
                                            {processing ? 'GUARDANDO...' : '🔒 SELLAR Y AUDITAR VOUCHER'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}