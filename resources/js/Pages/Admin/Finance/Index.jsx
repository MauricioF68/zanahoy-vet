import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';

export default function Index({ auth, finances }) {
    const { post, processing } = useForm();
    
    // ESTADOS PARA LOS FILTROS 🎛️
    const [searchTerm, setSearchTerm] = useState(''); // Busca por Código o Paciente
    const [statusFilter, setStatusFilter] = useState('all'); // Filtro de pago
    const [attendedFilter, setAttendedFilter] = useState('all'); // Filtro de atención
    
    const [selectedImage, setSelectedImage] = useState(null); // Para ver el voucher

    // LÓGICA DE FILTRADO (Se aplica en tiempo real)
    const filteredFinances = finances.filter((item) => {
        // 1. Filtro de Texto (Código de Factura o Nombre de Mascota)
        const matchSearch = 
            (item.payment_code?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
            
        // 2. Filtro de Estado de Pago
        const matchStatus = statusFilter === 'all' || item.payment_status === statusFilter;
        
        // 3. Filtro de Atención
        const matchAttended = 
            attendedFilter === 'all' || 
            (attendedFilter === 'yes' && item.is_attended) ||
            (attendedFilter === 'no' && !item.is_attended);

        return matchSearch && matchStatus && matchAttended;
    });

    // Acción de Aprobar Pago
    const handleApprove = (id) => {
        if (confirm('¿Confirmas que el dinero ya está en la cuenta del banco? Esta acción no se puede deshacer.')) {
            post(route('admin.finance.approve', id));
        }
    };

    // Helpers visuales
    const getPaymentBadge = (status) => {
        switch(status) {
            case 'paid': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">✅ PAGADO</span>;
            case 'debtor': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">🚨 DEUDOR</span>;
            case 'uploaded': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold animate-pulse">💸 POR VALIDAR</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">⏳ PENDIENTE</span>;
        }
    };

    return (
        <AdminLayout user={auth.user} header="💰 Módulo de Finanzas y Pagos">
            <Head title="Finanzas" />

            {/* --- PANEL DE FILTROS --- */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Buscar (Código o Paciente)</label>
                    <input 
                        type="text" 
                        placeholder="Ej: FAC-00015 o Firulais..." 
                        className="w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="w-full md:w-48">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estado de Pago</label>
                    <select 
                        className="w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="paid">✅ Pagados</option>
                        <option value="debtor">🚨 Deudores</option>
                        <option value="uploaded">💸 Por Validar</option>
                        <option value="pending">⏳ Pendientes</option>
                    </select>
                </div>

                <div className="w-full md:w-48">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">¿Atendido?</label>
                    <select 
                        className="w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={attendedFilter} onChange={(e) => setAttendedFilter(e.target.value)}
                    >
                        <option value="all">Todos</option>
                        <option value="yes">✅ Sí (Finalizados)</option>
                        <option value="no">❌ No (En espera)</option>
                    </select>
                </div>
            </div>

            {/* --- LA SÚPER TABLA ERP --- */}
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-800 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase">Fecha / Código</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase">Paciente</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase">Médico</th>
                            <th className="px-4 py-3 text-center text-xs font-bold uppercase">Monto (S/)</th>
                            <th className="px-4 py-3 text-center text-xs font-bold uppercase">Estado Pago</th>
                            <th className="px-4 py-3 text-center text-xs font-bold uppercase">Atendido</th>
                            <th className="px-4 py-3 text-right text-xs font-bold uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredFinances.length > 0 ? (
                            filteredFinances.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                        <div className="font-mono font-black text-indigo-700">{item.payment_code || `SIN-COD-${item.id}`}</div>
                                    </td>
                                    
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-gray-800">{item.pet?.name}</div>
                                        <div className="text-xs text-gray-500">{item.priority === 'critical' ? '🔴 Emergencia' : '🟢 Triaje Normal'}</div>
                                    </td>

                                    <td className="px-4 py-4">
                                        {item.expert ? (
                                            <span className="text-sm font-medium text-gray-900">{item.expert.name}</span>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Sin asignar</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-4 text-center">
                                        <span className="font-bold text-lg text-gray-700">
                                            S/ {item.amount ? Number(item.amount).toFixed(2) : '0.00'}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4 text-center">
                                        {getPaymentBadge(item.payment_status)}
                                    </td>

                                    <td className="px-4 py-4 text-center">
                                        {item.is_attended ? '✅' : '❌'}
                                    </td>

                                    <td className="px-4 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {/* BOTÓN VER VOUCHER */}
                                            <button 
                                                onClick={() => setSelectedImage(item.payment_proof_path ? `/storage/${item.payment_proof_path}` : null)}
                                                className={`px-3 py-1 rounded shadow text-xs font-bold ${item.payment_proof_path ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                                disabled={!item.payment_proof_path}
                                                title={!item.payment_proof_path ? "El cliente no ha subido foto" : "Ver Voucher"}
                                            >
                                                👁️ Voucher
                                            </button>

                                            {/* BOTÓN VALIDAR PAGO (Solo si no está pagado) */}
                                            {item.payment_status !== 'paid' && (
                                                <button 
                                                    onClick={() => handleApprove(item.id)}
                                                    disabled={processing}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow text-xs font-bold"
                                                >
                                                    💰 Validar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                    <p className="text-2xl mb-2">📊</p>
                                    <p>No se encontraron registros con esos filtros.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL PARA VER VOUCHER */}
            <Modal show={selectedImage !== null} onClose={() => setSelectedImage(null)}>
                <div className="p-4">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Comprobante de Pago</h3>
                    {selectedImage ? (
                        <img src={selectedImage} alt="Voucher" className="w-full rounded-lg shadow-sm" />
                    ) : (
                        <p className="text-gray-500 italic text-center py-8">No hay imagen disponible.</p>
                    )}
                    <div className="mt-6 flex justify-end">
                        <button onClick={() => setSelectedImage(null)} className="bg-gray-800 text-white px-6 py-2 rounded font-bold hover:bg-gray-700">Cerrar</button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}