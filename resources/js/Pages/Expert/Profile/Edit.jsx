import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/ExpertLayout';
import LocationPicker from '@/Components/LocationPicker';

export default function Edit({ auth, user, allSpecialties, currentSpecialtyIds }) {
    const expert = user.expert_profile || {};
    
    // Ya no necesitamos extraer 'flash' aquí porque GlobalToast lo maneja desde el Layout

    const { data, setData, post, processing, errors } = useForm({
        phone: user.phone || '',
        address: expert.address || '',
        latitude: expert.latitude || '',
        longitude: expert.longitude || '',
        academic_level: expert.academic_level || '',
        university: expert.university || '',
        current_cycle: expert.current_cycle || '',
        license_number: expert.license_number || '',
        bio: expert.bio || '',
        selected_specialties: currentSpecialtyIds || []
    });

    // Función que recibe los datos desde nuestro nuevo componente de mapa
    const handleLocationUpdate = (locationData) => {
        setData(currentData => ({
            ...currentData,
            address: locationData.address,
            latitude: locationData.lat,
            longitude: locationData.lng
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('expert.profile.update'), { preserveScroll: true });
    };

    return (
        <ExpertLayout user={auth.user} header="Configuración de mi Perfil">
            <Head title="Mi Perfil Profesional" />

            <div className="max-w-4xl mx-auto py-6">
                <form onSubmit={submit} className="space-y-6">
                    
                    {/* TARJETA 1: DATOS BÁSICOS Y UBICACIÓN */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center border-b pb-3">
                            <span className="mr-2">👤</span> Datos Personales y Ubicación
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nombre Completo 🔒</label>
                                <input type="text" value={user.name} disabled className="w-full bg-slate-100 border-slate-200 rounded-xl text-slate-500 font-bold cursor-not-allowed opacity-70" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Correo Electrónico 🔒</label>
                                <input type="email" value={user.email} disabled className="w-full bg-slate-100 border-slate-200 rounded-xl text-slate-500 font-bold cursor-not-allowed opacity-70" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">DNI / Documento 🔒</label>
                                <input type="text" value={expert.dni || 'No registrado'} disabled className="w-full bg-slate-100 border-slate-200 rounded-xl text-slate-500 font-bold cursor-not-allowed opacity-70" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Teléfono / WhatsApp ✏️</label>
                                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-bold text-slate-800 shadow-sm" />
                                {errors.phone && <span className="text-red-500 text-xs font-bold mt-1">{errors.phone}</span>}
                            </div>
                        </div>

                        {/* AQUÍ INYECTAMOS NUESTRO MAPA INTELIGENTE */}
                        <div className="mt-6 border-t pt-6">
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Dirección de Consultorio o Residencia</label>
                            
                            <LocationPicker 
                                defaultLat={data.latitude}
                                defaultLng={data.longitude}
                                defaultAddress={data.address}
                                onLocationChange={handleLocationUpdate}
                            />
                            
                            {errors.address && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.address}</span>}
                        </div>
                    </div>

                    {/* TARJETA 2: PERFIL ACADÉMICO Y LEGAL */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center border-b pb-3">
                            <span className="mr-2">🎓</span> Perfil Académico
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Universidad</label>
                                <input type="text" value={data.university} onChange={e => setData('university', e.target.value)} required className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nivel Académico</label>
                                <select value={data.academic_level} onChange={e => setData('academic_level', e.target.value)} required className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="estudiante">Estudiante</option>
                                    <option value="bachiller">Bachiller</option>
                                    <option value="titulado">Titulado</option>
                                </select>
                            </div>
                        </div>

                        {data.academic_level === 'estudiante' && (
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-orange-500 mb-1 uppercase tracking-wider">Ciclo Actual</label>
                                <input type="number" min="1" max="12" value={data.current_cycle} onChange={e => setData('current_cycle', e.target.value)} className="w-full border-orange-200 rounded-xl focus:ring-orange-500 focus:border-orange-500 bg-orange-50" />
                            </div>
                        )}

                        {data.academic_level === 'titulado' && (
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-emerald-600 mb-1 uppercase tracking-wider">N° de Colegiatura (CQVP)</label>
                                <input type="text" value={data.license_number} onChange={e => setData('license_number', e.target.value)} className="w-full border-emerald-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50" />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Sobre mí (Biografía)</label>
                            <textarea value={data.bio} onChange={e => setData('bio', e.target.value)} rows="3" placeholder="Cuéntale a tus pacientes sobre tu experiencia..." className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 resize-none"></textarea>
                        </div>
                    </div>

                    {/* TARJETA 3: ESPECIALIDADES */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center border-b pb-3">
                            <span className="mr-2">🩺</span> Mis Especialidades
                        </h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {allSpecialties.map(spec => (
                                <label key={spec.id} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${data.selected_specialties.includes(spec.id) ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-300'}`}>
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5 mr-3"
                                        checked={data.selected_specialties.includes(spec.id)}
                                        onChange={e => {
                                            const val = spec.id;
                                            const next = e.target.checked 
                                                ? [...data.selected_specialties, val]
                                                : data.selected_specialties.filter(id => id !== val);
                                            setData('selected_specialties', next);
                                        }} 
                                    />
                                    <span className={`text-sm font-bold ${data.selected_specialties.includes(spec.id) ? 'text-indigo-800' : 'text-slate-600'}`}>
                                        {spec.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* BOTÓN GUARDAR */}
                    <div className="flex justify-end">
                        <button type="submit" disabled={processing} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black tracking-wide text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center">
                            {processing ? 'GUARDANDO...' : '💾 GUARDAR CAMBIOS'}
                        </button>
                    </div>

                </form>
            </div>
        </ExpertLayout>
    );
}