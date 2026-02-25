import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function RegisterExpert({ specialties }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '', email: '', password: '', phone: '',
        address: '', academic_level: '', university: '',
        current_cycle: '', license_number: '', bio: '',
        selected_specialties: []
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register.expert.store'));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <Head title="Registro de Experto" />
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
                <h2 className="text-3xl font-bold text-orange-600 mb-6">Registro de Experto</h2>
                
                <form onSubmit={submit} className="space-y-4">
                    {/* Datos Básicos */}
                    <div>
                        <label className="block font-medium text-gray-700">Nombre Completo</label>
                        <input type="text" className="w-full border-gray-300 rounded-md shadow-sm" 
                            value={data.name} onChange={e => setData('name', e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium text-gray-700">Email</label>
                            <input type="email" className="w-full border-gray-300 rounded-md shadow-sm" 
                                value={data.email} onChange={e => setData('email', e.target.value)} required />
                        </div>
                        <div>
                            <label className="block font-medium text-gray-700">Teléfono</label>
                            <input type="text" className="w-full border-gray-300 rounded-md shadow-sm" 
                                value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        </div>
                    </div>

                    {/* Nivel Académico - Lógica Dinámica */}
                    <div>
                        <label className="block font-medium text-gray-700">Nivel Académico</label>
                        <select className="w-full border-gray-300 rounded-md shadow-sm"
                            value={data.academic_level} onChange={e => setData('academic_level', e.target.value)} required>
                            <option value="">Seleccione nivel...</option>
                            <option value="estudiante">Estudiante</option>
                            <option value="bachiller">Bachiller</option>
                            <option value="titulado">Titulado</option>
                        </select>
                    </div>

                    {data.academic_level === 'estudiante' && (
                        <div>
                            <label className="block font-medium text-gray-700">Ciclo Actual</label>
                            <input type="number" min="1" max="10" className="w-full border-gray-300 rounded-md shadow-sm" 
                                value={data.current_cycle} onChange={e => setData('current_cycle', e.target.value)} />
                        </div>
                    )}

                    {data.academic_level === 'titulado' && (
                        <div>
                            <label className="block font-medium text-gray-700">N° de Colegiatura</label>
                            <input type="text" className="w-full border-gray-300 rounded-md shadow-sm" 
                                value={data.license_number} onChange={e => setData('license_number', e.target.value)} />
                        </div>
                    )}

                    <div>
                        <label className="block font-medium text-gray-700">Universidad</label>
                        <input type="text" className="w-full border-gray-300 rounded-md shadow-sm" 
                            value={data.university} onChange={e => setData('university', e.target.value)} />
                    </div>

                    {/* Especialidades */}
                    <div>
                        <label className="block font-medium text-gray-700">Especialidades (Puedes elegir varias)</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {specialties.map(s => (
                                <label key={s.id} className="flex items-center space-x-2">
                                    <input type="checkbox" value={s.id} 
                                        onChange={e => {
                                            const val = parseInt(e.target.value);
                                            const next = e.target.checked 
                                                ? [...data.selected_specialties, val]
                                                : data.selected_specialties.filter(id => id !== val);
                                            setData('selected_specialties', next);
                                        }} />
                                    <span className="text-sm text-gray-600">{s.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={processing}
                        className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition">
                        Enviar Solicitud de Registro
                    </button>
                </form>
            </div>
        </div>
    );
}