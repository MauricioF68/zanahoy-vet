import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ requests }) {
    const { post, processing } = useForm();

    const handleApprove = (id) => {
        if (confirm('¿Estás seguro de aprobar esta solicitud? Se notificará al usuario.')) {
            post(route('admin.requests.approve', id));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Head title="Solicitudes Pendientes" />

            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Buzón de Solicitudes</h1>
                        <p className="text-gray-500">Gestiona los nuevos profesionales y establecimientos.</p>
                    </div>
                    <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-bold">
                        {requests.length} Pendientes
                    </div>
                </header>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-5 font-bold text-gray-600">Solicitante</th>
                                <th className="p-5 font-bold text-gray-600">Tipo</th>
                                <th className="p-5 font-bold text-gray-600">Documento/Detalle</th>
                                <th className="p-5 font-bold text-gray-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-orange-50/30 transition">
                                    <td className="p-5">
                                        <div className="font-bold text-gray-900">{req.name}</div>
                                        <div className="text-sm text-gray-500">{req.email}</div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                            req.role === 'expert' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                        }`}>
                                            {req.role === 'expert' ? 'Veterinario' : 'Clínica'}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        {req.role === 'expert' ? (
                                            <div className="text-sm">
                                                <span className="font-semibold">{req.expert_profile?.academic_level}</span>
                                                <p className="text-gray-500">{req.expert_profile?.university}</p>
                                            </div>
                                        ) : (
                                            <div className="text-sm">
                                                <span className="font-semibold">{req.clinic_profile?.commercial_name}</span>
                                                <p className="text-gray-500">RUC: {req.clinic_profile?.ruc}</p>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 space-x-2">
                                        <button 
                                            onClick={() => handleApprove(req.id)}
                                            disabled={processing}
                                            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-100"
                                        >
                                            Aprobar
                                        </button>
                                        <button className="text-red-500 font-bold text-sm hover:underline">
                                            Rechazar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-gray-400">
                                        No hay solicitudes pendientes por el momento.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}