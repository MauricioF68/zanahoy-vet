import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ auth, requests }) {
    const { post, processing } = useForm();
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

            <div className="max-w-7xl mx-auto py-8">
                
                {flash?.message && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-bold">
                        ✅ {flash.message}
                    </div>
                )}

                <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Buzón de Solicitudes</h1>
                        <p className="text-slate-500 font-medium mt-1">Revisa el perfil detallado de los postulantes antes de aprobarlos.</p>
                    </div>
                    <div className="bg-orange-100 text-orange-700 px-6 py-3 rounded-xl font-black text-lg shadow-inner">
                        {requests.length} Pendientes
                    </div>
                </header>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider w-1/4">Contacto del Solicitante</th>
                                    <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider w-auto">Tipo</th>
                                    <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider w-2/5">Perfil Profesional / Legal</th>
                                    <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider text-right w-1/5">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50 transition">
                                        
                                        {/* COLUMNA 1: DATOS DE CONTACTO Y DNI */}
                                        <td className="p-5 align-top">
                                            <div className="font-black text-slate-800 text-lg leading-tight mb-2">{req.name}</div>
                                            <div className="space-y-1.5">
                                                <div className="text-sm font-medium text-slate-600 flex items-center">
                                                    <span className="mr-2">📧</span> <span className="truncate">{req.email}</span>
                                                </div>
                                                {req.phone && (
                                                    <div className="text-sm font-medium text-slate-600 flex items-center">
                                                        <span className="mr-2">📱</span> {req.phone}
                                                    </div>
                                                )}
                                                {req.role === 'expert' && req.expert_profile?.dni && (
                                                    <div className="inline-block mt-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                                                        🪪 DNI: {req.expert_profile.dni}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* COLUMNA 2: TIPO (BADGE) */}
                                        <td className="p-5 align-top">
                                            <span className={`inline-block whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                                                req.role === 'expert' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                            }`}>
                                                {req.role === 'expert' ? '🩺 Veterinario' : '🏥 Clínica'}
                                            </span>
                                        </td>

                                        {/* COLUMNA 3: DETALLE ACADÉMICO Y ESPECIALIDADES */}
                                        <td className="p-5 align-top">
                                            {req.role === 'expert' ? (
                                                <div className="text-sm">
                                                    {/* Nivel Académico Dinámico */}
                                                    <div className="font-bold text-slate-800 uppercase flex flex-wrap items-center gap-2">
                                                        🎓 {req.expert_profile?.academic_level}
                                                        
                                                        {req.expert_profile?.academic_level === 'estudiante' && req.expert_profile?.current_cycle && (
                                                            <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md text-xs border border-orange-100 whitespace-nowrap">
                                                                Ciclo {req.expert_profile.current_cycle}
                                                            </span>
                                                        )}
                                                        
                                                        {req.expert_profile?.academic_level === 'titulado' && req.expert_profile?.license_number && (
                                                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-100 whitespace-nowrap">
                                                                CQVP: {req.expert_profile.license_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <p className="text-slate-500 font-medium mt-1 mb-3">🏫 {req.expert_profile?.university}</p>
                                                    
                                                    {/* 🛠️ AQUÍ ESTÁ LA MAGIA: Grid de 3 columnas para las especialidades */}
                                                    {req.expert_profile?.specialties && req.expert_profile.specialties.length > 0 && (
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-lg">
                                                            {req.expert_profile.specialties.map(spec => (
                                                                <span 
                                                                    key={spec.id} 
                                                                    className="bg-indigo-50 text-indigo-700 text-[11px] px-2 py-1.5 rounded-md font-bold border border-indigo-100 text-center truncate"
                                                                    title={spec.name} // Muestra el nombre completo si pones el mouse encima
                                                                >
                                                                    {spec.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-sm">
                                                    <span className="font-bold text-slate-800 uppercase">🏢 {req.clinic_profile?.commercial_name}</span>
                                                    <p className="text-slate-500 font-medium mt-1">RUC: {req.clinic_profile?.ruc}</p>
                                                </div>
                                            )}
                                        </td>

                                        {/* COLUMNA 4: ACCIONES */}
                                        <td className="p-5 align-middle text-right whitespace-nowrap">
                                            <div className="flex flex-col sm:flex-row justify-end gap-2">
                                                <button 
                                                    onClick={() => handleReject(req.id)}
                                                    disabled={processing}
                                                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition shadow-sm w-full sm:w-auto"
                                                >
                                                    Rechazar
                                                </button>
                                                <button 
                                                    onClick={() => handleApprove(req.id)}
                                                    disabled={processing}
                                                    className="bg-green-500 text-white px-5 py-2 rounded-xl text-sm font-black hover:bg-green-600 transition shadow-md shadow-green-200 w-full sm:w-auto"
                                                >
                                                    ✅ Aprobar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}