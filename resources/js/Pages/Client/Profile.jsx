import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import LocationPicker from '@/Components/LocationPicker'; // 🗺️ Nuestro Mapa
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm'; // 🔑 El form de Breeze

export default function Profile({ auth, user }) {
    
    // Verificamos si el DNI ya existe al cargar la página para bloquear el campo
    const hasExistingDni = !!user.client_profile?.dni;

    // Inicializamos el formulario de Datos Personales
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: user.name || '',
        phone: user.phone || '',
        dni: user.client_profile?.dni || '',
        address: user.client_profile?.address || '',
        emergency_contact: user.client_profile?.emergency_contact || '',
        latitude: user.client_profile?.latitude || '',
        longitude: user.client_profile?.longitude || '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        post(route('client.profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <ClientLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Configuración de Cuenta</h2>}>
            <Head title="Mi Perfil" />

            <div className="py-12 space-y-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* ==================================================== */}
                    {/* BLOQUE 1: DATOS PERSONALES Y DIRECCIÓN (MAPA)        */}
                    {/* ==================================================== */}
                    <div className="bg-white p-8 shadow-sm sm:rounded-2xl border border-gray-100">
                        <header className="mb-8 border-b pb-4">
                            <h2 className="text-2xl font-black text-gray-900">Información del Responsable</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Estos datos son vitales para emitir comprobantes de pago y ubicarte rápidamente en caso de requerir una ambulancia.
                            </p>
                        </header>

                        <form onSubmit={submitProfile} className="space-y-6">
                            
                            {/* --- DATOS BÁSICOS --- */}
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                                <h3 className="font-bold text-slate-700 mb-2 flex items-center"><span className="mr-2">👤</span> Datos de la Cuenta</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="email" value="Correo Electrónico (No editable)" />
                                        <TextInput id="email" type="email" className="mt-1 block w-full bg-slate-200 text-slate-500 cursor-not-allowed" value={user.email} disabled />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="name" value="Nombre Completo" />
                                        <TextInput id="name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    
                                    <div>
                                        <InputLabel htmlFor="phone" value="Teléfono / WhatsApp" />
                                        <TextInput id="phone" type="tel" className="mt-1 block w-full" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="Ej: 987654321" />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* --- DATOS DE FACTURACIÓN Y EMERGENCIA --- */}
                            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 space-y-6">
                                <h3 className="font-bold text-orange-800 mb-2 flex items-center"><span className="mr-2">🚨</span> Información de Contacto</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="dni" value="DNI / Documento de Identidad" />
                                        <TextInput 
                                            id="dni" 
                                            className={`mt-1 block w-full ${hasExistingDni ? 'bg-orange-100/50 text-gray-500 cursor-not-allowed border-orange-200' : ''}`} 
                                            value={data.dni} 
                                            onChange={(e) => setData('dni', e.target.value)} 
                                            disabled={hasExistingDni} // 🔒 CANDADO FRONTEND
                                            placeholder="Tu número de documento" 
                                        />
                                        {hasExistingDni && <p className="text-xs text-orange-600 mt-1 font-medium">🛡️ Por seguridad, no puedes modificar tu DNI.</p>}
                                        {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="emergency_contact" value="Contacto de Emergencia (Familiar/Amigo)" />
                                        <TextInput id="emergency_contact" className="mt-1 block w-full" value={data.emergency_contact} onChange={(e) => setData('emergency_contact', e.target.value)} placeholder="Ej: Esposa - 999888777" />
                                        {errors.emergency_contact && <p className="text-red-500 text-xs mt-1">{errors.emergency_contact}</p>}
                                    </div>
                                </div>

                                {/* 🗺️ EL MAPA INTELIGENTE */}
                                <div className="pt-2">
                                    <InputLabel value="Dirección Exacta de Residencia" className="mb-2 text-orange-900 font-bold" />
                                    <div className="bg-white p-1 rounded-2xl shadow-sm border border-orange-200">
                                        <LocationPicker 
                                            defaultLat={data.latitude} 
                                            defaultLng={data.longitude} 
                                            defaultAddress={data.address}
                                            onLocationChange={(locationData) => {
                                                setData(prevData => ({
                                                    ...prevData,
                                                    address: locationData.address,
                                                    latitude: locationData.lat,
                                                    longitude: locationData.lng
                                                }));
                                            }} 
                                        />
                                    </div>
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <PrimaryButton disabled={processing} className="bg-orange-600 hover:bg-orange-700 px-8 py-3 text-lg">
                                    {processing ? 'Guardando Datos...' : 'Actualizar Perfil'}
                                </PrimaryButton>

                                {recentlySuccessful && (
                                    <p className="text-sm text-green-600 font-bold animate-in fade-in duration-500">
                                        ¡Datos guardados! ✅
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* ==================================================== */}
                    {/* BLOQUE 2: SEGURIDAD (CAMBIO DE CONTRASEÑA)           */}
                    {/* ==================================================== */}
                    <div className="bg-white p-8 shadow-sm sm:rounded-2xl border border-gray-100">
                        {/* 🔑 Reutilizamos el componente nativo de Breeze */}
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                </div>
            </div>
        </ClientLayout>
    );
}