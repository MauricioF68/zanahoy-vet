import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ auth, requests }) {
    const { post, processing } = useForm();
    
    // 🛠️ CORRECCIÓN AQUÍ: Le damos un valor por defecto {} por si viene vacío
    const { flash = {} } = usePage().props; 

    const handleApprove = (id) => {
        if (confirm('¿Estás seguro de aprobar esta solicitud? Se enviará un correo de activación al usuario.')) {
            post(route('admin.requests.approve', id), { preserveScroll: true });
        }
    };

    const handleReject = (id) => {
        if (confirm('¿Estás seguro de RECHAZAR esta solicitud?')) {
            post(route('admin.requests.reject', id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout user={auth.user} header="Buzón de Solicitudes">
            <Head title="Solicitudes Pendientes" />

            <div className="max-w-6xl mx-auto py-8">
                
                {/* 🛠️ CORRECCIÓN AQUÍ: Usamos el signo de interrogación (optional chaining) */}
                {flash?.message && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-bold">
                        ✅ {flash.message}
                    </div>
                )}

                <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Buzón de Solicitudes</h1>
                        <p className="text-slate-500 font-medium mt-1">Gestiona los nuevos profesionales y establecimientos.</p>
                    </div>
                    <div className="bg-orange-100 text-orange-700 px-6 py-3 rounded-xl font-black text-lg shadow-inner">
                        {requests.length} Pendientes
                    </div>
                </header>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider">Solicitante</th>
                                <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider">Tipo</th>
                                <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider">Documento / Detalle</th>
                                <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50 transition">
                                    <td className="p-5">
                                        <div className="font-black text-slate-800 text-lg">{req.name}</div>
                                        <div className="text-sm font-medium text-slate-500">{req.email}</div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                                            req.role === 'expert' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                        }`}>
                                            {req.role === 'expert' ? '🩺 Veterinario' : '🏥 Clínica'}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        {req.role === 'expert' ? (
                                            <div className="text-sm">
                                                <span className="font-bold text-slate-700 uppercase">{req.expert_profile?.academic_level}</span>
                                                <p className="text-slate-500 font-medium">{req.expert_profile?.university}</p>
                                            </div>
                                        ) : (
                                            <div className="text-sm">
                                                <span className="font-bold text-slate-700">{req.clinic_profile?.commercial_name}</span>
                                                <p className="text-slate-500 font-medium">RUC: {req.clinic_profile?.ruc}</p>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 space-x-3 text-right">
                                        <button 
                                            onClick={() => handleReject(req.id)}
                                            disabled={processing}
                                            className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 transition"
                                        >
                                            Rechazar
                                        </button>
                                        <button 
                                            onClick={() => handleApprove(req.id)}
                                            disabled={processing}
                                            className="bg-green-500 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-green-600 transition shadow-lg shadow-green-200"
                                        >
                                            ✅ APROBAR
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-slate-400">
                                        <span className="text-5xl block mb-4 opacity-50 grayscale">📬</span>
                                        <p className="font-bold text-lg text-slate-600">No hay solicitudes pendientes</p>
                                        <p className="text-sm mt-1">Todo está al día por aquí.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}