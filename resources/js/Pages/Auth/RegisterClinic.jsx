import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function RegisterClinic() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',           // Nombre del representante
        commercial_name: '', // Nombre de la veterinaria
        email: '',
        phone: '',
        ruc: '',
        address: '',
        has_hospitalization: false,
        emergency_services: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register.clinic.store'));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <Head title="Registro de Clínica" />
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow border-t-4 border-blue-500">
                <h2 className="text-3xl font-bold text-blue-600 mb-6">Registro de Establecimiento</h2>

                {/* Bloque temporal para ver errores de validación */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        <ul className="list-disc ml-5">
                            {Object.values(errors).map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium text-gray-700">Nombre de la Veterinaria</label>
                            <input type="text" className="w-full border-gray-300 rounded-md shadow-sm" 
                                value={data.commercial_name} onChange={e => setData('commercial_name', e.target.value)} required />
                        </div>
                        <div>
                            <label className="block font-medium text-gray-700">RUC (11 dígitos)</label>
                            <input type="text" maxLength="11" className="w-full border-gray-300 rounded-md shadow-sm" 
                                value={data.ruc} onChange={e => setData('ruc', e.target.value)} required />
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">Nombre del Representante</label>
                        <input type="text" className="w-full border-gray-300 rounded-md shadow-sm" 
                            value={data.name} onChange={e => setData('name', e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium text-gray-700">Email Institucional</label>
                            <input type="email" className="w-full border-gray-300 rounded-md shadow-sm" 
                                value={data.email} onChange={e => setData('email', e.target.value)} required />
                        </div>
                        <div>
                            <label className="block font-medium text-gray-700">Teléfono de Contacto</label>
                            <input type="text" className="w-full border-gray-300 rounded-md shadow-sm" 
                                value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">Dirección Física</label>
                        <input type="text" className="w-full border-gray-300 rounded-md shadow-sm" 
                            value={data.address} onChange={e => setData('address', e.target.value)} required />
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <input type="checkbox" className="rounded text-blue-600"
                            checked={data.has_hospitalization} 
                            onChange={e => setData('has_hospitalization', e.target.checked)} />
                        <label className="text-sm font-medium text-blue-800">¿Contamos con servicio de Hospitalización?</label>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">Otros Servicios de Emergencia</label>
                        <textarea className="w-full border-gray-300 rounded-md shadow-sm" rows="3"
                            placeholder="Ej: Rayos X, Ecografía, Laboratorio propio..."
                            value={data.emergency_services} onChange={e => setData('emergency_services', e.target.value)} />
                    </div>

                    <button type="submit" disabled={processing}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
                        Registrar Establecimiento
                    </button>
                </form>
            </div>
        </div>
    );
}