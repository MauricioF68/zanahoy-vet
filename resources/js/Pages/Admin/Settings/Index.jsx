import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function Index({ auth, settings, paymentMethods, banks }) {
    
    const [activeTab, setActiveTab] = useState('general');

    // Estados para saber si estamos editando
    const [editingMethodId, setEditingMethodId] = useState(null);
    const [editingBankId, setEditingBankId] = useState(null);

    // 💰 AQUÍ AGREGAMOS honorario_experto
    const formGeneral = useForm({
        consulta_precio: settings.consulta_precio || '',
        honorario_experto: settings.honorario_experto || '',
        pin_auditoria: settings.pin_auditoria || '',
    });

    const formAccounts = useForm({
        banco_principal: settings.banco_principal || '',
        cuenta_bancaria: settings.cuenta_bancaria || '',
        cuenta_cci: settings.cuenta_cci || '',
        yape_numero: settings.yape_numero || '',
        plin_numero: settings.plin_numero || '',
        yape_qr: null,
        plin_qr: null,
    });

    const formMethod = useForm({ name: '', requires_bank: false });
    const formBank = useForm({ name: '' });

    // --- SUBMITS SIMPLES ---
    const submitGeneral = (e) => { e.preventDefault(); formGeneral.post(route('admin.settings.update_general'), { preserveScroll: true }); };
    const submitAccounts = (e) => { e.preventDefault(); formAccounts.post(route('admin.settings.update_accounts'), { forceFormData: true, preserveScroll: true }); };

    // --- LÓGICA DE MÉTODOS DE PAGO (CRUD) ---
    const submitMethod = (e) => {
        e.preventDefault();
        if (editingMethodId) {
            formMethod.put(route('admin.settings.update_method', editingMethodId), { preserveScroll: true, onSuccess: () => cancelEditMethod() });
        } else {
            formMethod.post(route('admin.settings.store_method'), { preserveScroll: true, onSuccess: () => formMethod.reset() });
        }
    };
    const editMethod = (method) => {
        setEditingMethodId(method.id);
        formMethod.setData({ name: method.name, requires_bank: !!method.requires_bank });
    };
    const cancelEditMethod = () => { setEditingMethodId(null); formMethod.reset(); };
    const deleteMethod = (id) => { if (confirm('¿Seguro que deseas eliminar este método de pago?')) router.delete(route('admin.settings.destroy_method', id), { preserveScroll: true }); };

    // --- LÓGICA DE BANCOS (CRUD) ---
    const submitBank = (e) => {
        e.preventDefault();
        if (editingBankId) {
            formBank.put(route('admin.settings.update_bank', editingBankId), { preserveScroll: true, onSuccess: () => cancelEditBank() });
        } else {
            formBank.post(route('admin.settings.store_bank'), { preserveScroll: true, onSuccess: () => formBank.reset() });
        }
    };
    const editBank = (bank) => {
        setEditingBankId(bank.id);
        formBank.setData('name', bank.name);
    };
    const cancelEditBank = () => { setEditingBankId(null); formBank.reset(); };
    const deleteBank = (id) => { if (confirm('¿Seguro que deseas eliminar este banco?')) router.delete(route('admin.settings.destroy_bank', id), { preserveScroll: true }); };

    return (
        <AdminLayout user={auth.user} header="⚙️ Reglas del Sistema y Finanzas">
            <Head title="Configuración ERP" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
                    
                    {/* MENÚ LATERAL */}
                    <div className="w-full md:w-1/4">
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <nav className="flex flex-col">
                                <button onClick={() => setActiveTab('general')} className={`px-6 py-4 text-left font-bold transition-colors border-l-4 ${activeTab === 'general' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>💰 Tarifas y Seguridad</button>
                                <button onClick={() => setActiveTab('cuentas')} className={`px-6 py-4 text-left font-bold transition-colors border-l-4 ${activeTab === 'cuentas' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>🏦 Cuentas y QR</button>
                                <button onClick={() => setActiveTab('metodos')} className={`px-6 py-4 text-left font-bold transition-colors border-l-4 ${activeTab === 'metodos' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>💳 Métodos de Pago</button>
                                <button onClick={() => setActiveTab('bancos')} className={`px-6 py-4 text-left font-bold transition-colors border-l-4 ${activeTab === 'bancos' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>🏛️ Bancos Permitidos</button>
                            </nav>
                        </div>
                    </div>

                    {/* PANELES */}
                    <div className="w-full md:w-3/4">
                        
                        {/* PESTAÑA: GENERAL */}
                        {activeTab === 'general' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-black text-gray-800 mb-6 border-b pb-4">Ajustes Generales</h3>
                                <form onSubmit={submitGeneral} className="space-y-6 max-w-lg">
                                    
                                    {/* PRECIO DE CONSULTA */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <InputLabel value="Precio cobrado al Cliente (S/)" className="font-bold text-lg text-gray-800" />
                                        <TextInput type="number" step="0.01" className="w-full font-black text-xl text-indigo-700 mt-2" value={formGeneral.data.consulta_precio} onChange={e => formGeneral.setData('consulta_precio', e.target.value)} required />
                                    </div>

                                    {/* 💰 HONORARIO DEL DOCTOR */}
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                        <div className="flex justify-between items-center mb-1">
                                            <InputLabel value="Honorario Fijo del Doctor (S/)" className="font-bold text-lg text-green-800" />
                                            <span className="text-2xl">👨‍⚕️</span>
                                        </div>
                                        <p className="text-xs text-green-600 mb-2">Este monto se asignará a la billetera del experto tras cada atención exitosa.</p>
                                        <TextInput type="number" step="0.01" className="w-full font-black text-xl text-green-700 mt-1 border-green-300 focus:border-green-500 focus:ring-green-500" value={formGeneral.data.honorario_experto} onChange={e => formGeneral.setData('honorario_experto', e.target.value)} required />
                                        {formGeneral.errors.honorario_experto && <span className="text-red-500 text-xs mt-2 block font-bold">{formGeneral.errors.honorario_experto}</span>}
                                    </div>

                                    {/* PIN DE AUDITORÍA */}
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                        <InputLabel value="PIN de Auditoría Financiera 🔒" className="text-red-700 font-bold text-lg" />
                                        <TextInput type="password" maxLength="6" className="w-full font-black text-xl tracking-widest text-red-700 mt-2" value={formGeneral.data.pin_auditoria} onChange={e => formGeneral.setData('pin_auditoria', e.target.value)} required />
                                    </div>

                                    <button type="submit" disabled={formGeneral.processing} className="bg-gray-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg disabled:opacity-50 w-full text-center">
                                        💾 GUARDAR TARIFAS Y REGLAS
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* PESTAÑA: CUENTAS Y QR */}
                        {activeTab === 'cuentas' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-black text-gray-800 mb-6 border-b pb-4">Cuentas Bancarias y Billeteras</h3>
                                <form onSubmit={submitAccounts} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <h4 className="font-bold text-blue-800 mb-4">🏦 Transferencia Bancaria</h4>
                                            <div className="space-y-3">
                                                <div><InputLabel value="Banco Principal" /><TextInput className="w-full mt-1" placeholder="Ej: BCP" value={formAccounts.data.banco_principal} onChange={e => formAccounts.setData('banco_principal', e.target.value)} /></div>
                                                <div><InputLabel value="N° Cuenta" /><TextInput className="w-full mt-1" value={formAccounts.data.cuenta_bancaria} onChange={e => formAccounts.setData('cuenta_bancaria', e.target.value)} /></div>
                                                <div><InputLabel value="CCI" /><TextInput className="w-full mt-1" value={formAccounts.data.cuenta_cci} onChange={e => formAccounts.setData('cuenta_cci', e.target.value)} /></div>
                                            </div>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                            <h4 className="font-bold text-purple-800 mb-4">📱 Billeteras Digitales</h4>
                                            <div className="space-y-3">
                                                <div><InputLabel value="Número Yape" /><TextInput className="w-full mt-1" value={formAccounts.data.yape_numero} onChange={e => formAccounts.setData('yape_numero', e.target.value)} /></div>
                                                <div><InputLabel value="Sube tu QR de Yape" /><input type="file" className="mt-1 text-sm" accept="image/*" onChange={e => formAccounts.setData('yape_qr', e.target.files[0])} /></div>
                                                {settings.yape_qr_path && <p className="text-xs text-green-600 mt-1">✅ QR guardado</p>}
                                                
                                                <div className="mt-4"><InputLabel value="Número Plin" /><TextInput className="w-full mt-1" value={formAccounts.data.plin_numero} onChange={e => formAccounts.setData('plin_numero', e.target.value)} /></div>
                                                <div><InputLabel value="Sube tu QR de Plin" /><input type="file" className="mt-1 text-sm" accept="image/*" onChange={e => formAccounts.setData('plin_qr', e.target.files[0])} /></div>
                                                {settings.plin_qr_path && <p className="text-xs text-green-600 mt-1">✅ QR guardado</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button type="submit" disabled={formAccounts.processing} className="bg-gray-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg disabled:opacity-50">💾 GUARDAR CUENTAS</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* PESTAÑA: MÉTODOS DE PAGO CRUD */}
                        {activeTab === 'metodos' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-black text-gray-800 mb-6 border-b pb-4">Métodos de Pago Permitidos</h3>
                                
                                <form onSubmit={submitMethod} className={`flex gap-4 items-end mb-8 p-4 rounded-xl ${editingMethodId ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                                    <div className="flex-1">
                                        <InputLabel value="Nombre del Método" />
                                        <TextInput className="w-full mt-1" placeholder="Ej: Yape, Efectivo..." value={formMethod.data.name} onChange={e => formMethod.setData('name', e.target.value)} required />
                                    </div>
                                    <div className="flex items-center mb-3">
                                        <input type="checkbox" id="req_bank" className="mr-2" checked={formMethod.data.requires_bank} onChange={e => formMethod.setData('requires_bank', e.target.checked)} />
                                        <label htmlFor="req_bank" className="text-sm font-bold text-gray-700">¿Requiere Banco?</label>
                                    </div>
                                    <div className="flex gap-2">
                                        {editingMethodId && <button type="button" onClick={cancelEditMethod} className="bg-gray-400 text-white font-bold py-2 px-4 rounded-lg mb-1">Cancelar</button>}
                                        <button type="submit" disabled={formMethod.processing} className={`${editingMethodId ? 'bg-orange-600' : 'bg-indigo-600'} text-white font-bold py-2 px-6 rounded-lg mb-1`}>
                                            {editingMethodId ? 'Actualizar' : '➕ Agregar'}
                                        </button>
                                    </div>
                                </form>

                                <ul className="divide-y border rounded-lg">
                                    {paymentMethods.map(method => (
                                        <li key={method.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                            <div>
                                                <span className="font-bold text-gray-800">{method.name}</span>
                                                {method.requires_bank && <span className="ml-3 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">Pide Banco</span>}
                                            </div>
                                            <div className="flex space-x-3">
                                                <button onClick={() => editMethod(method)} className="text-blue-500 hover:text-blue-700">✏️</button>
                                                <button onClick={() => deleteMethod(method.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                                            </div>
                                        </li>
                                    ))}
                                    {paymentMethods.length === 0 && <p className="p-4 text-center text-gray-400">No hay métodos registrados</p>}
                                </ul>
                            </div>
                        )}

                        {/* PESTAÑA: BANCOS CRUD */}
                        {activeTab === 'bancos' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-black text-gray-800 mb-6 border-b pb-4">Catálogo de Bancos</h3>
                                
                                <form onSubmit={submitBank} className={`flex gap-4 items-end mb-8 p-4 rounded-xl ${editingBankId ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                                    <div className="flex-1">
                                        <InputLabel value="Nombre del Banco" />
                                        <TextInput className="w-full mt-1" placeholder="Ej: BCP, Scotiabank..." value={formBank.data.name} onChange={e => formBank.setData('name', e.target.value)} required />
                                    </div>
                                    <div className="flex gap-2">
                                        {editingBankId && <button type="button" onClick={cancelEditBank} className="bg-gray-400 text-white font-bold py-2 px-4 rounded-lg mb-1">Cancelar</button>}
                                        <button type="submit" disabled={formBank.processing} className={`${editingBankId ? 'bg-orange-600' : 'bg-indigo-600'} text-white font-bold py-2 px-6 rounded-lg mb-1`}>
                                            {editingBankId ? 'Actualizar' : '➕ Agregar'}
                                        </button>
                                    </div>
                                </form>

                                <ul className="divide-y border rounded-lg">
                                    {banks.map(bank => (
                                        <li key={bank.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                            <span className="font-bold text-gray-800">🏦 {bank.name}</span>
                                            <div className="flex space-x-3">
                                                <button onClick={() => editBank(bank)} className="text-blue-500 hover:text-blue-700">✏️</button>
                                                <button onClick={() => deleteBank(bank.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                                            </div>
                                        </li>
                                    ))}
                                    {banks.length === 0 && <p className="p-4 text-center text-gray-400">No hay bancos registrados</p>}
                                </ul>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}