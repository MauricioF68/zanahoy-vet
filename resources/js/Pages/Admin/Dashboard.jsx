import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard({ auth }) {
    return (
        <AdminLayout user={auth.user} header="Panel de Control">
            <Head title="Admin Dashboard" />
            
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                <h3 className="text-gray-900 font-bold text-xl">¡Bienvenido, Administrador! 👋</h3>
                <p className="text-gray-600 mt-2">Desde aquí gestionarás todo el ecosistema de Zanahoy.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                        <span className="text-3xl">🐾</span>
                        <h4 className="font-bold mt-2">Especies</h4>
                        <p className="text-sm text-gray-500">Configura animales permitidos</p>
                    </div>
                    {/* Aquí irán más tarjetas luego */}
                </div>
            </div>
        </AdminLayout>
    );
}