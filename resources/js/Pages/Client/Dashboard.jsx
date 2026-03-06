import React, { useState, useEffect } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout'; 
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Dashboard({ auth, pets, userName, speciesList, symptomCategories, isProfileIncomplete }) {
    
    // ESTADOS DE LOS MODALES
    const [showPetModal, setShowPetModal] = useState(false);
    const [showTriageModal, setShowTriageModal] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [filteredCategories, setFilteredCategories] = useState([]);

    // --- MAGIA: DETECTAR CONSULTAS ACTIVAS ---
    const activeConsultations = pets.flatMap(pet => pet.triages || []).filter(t => t.status === 'in_progress');

    useEffect(() => {
        // Solo activamos el radar si hay una alerta roja en pantalla
        if (activeConsultations.length > 0) {
            const interval = setInterval(() => {
                // Le pedimos a Laravel que nos mande las mascotas actualizadas de forma invisible
                router.reload({ only: ['pets'], preserveScroll: true });
            }, 5000); // Revisa cada 5 segundos
            
            return () => clearInterval(interval);
        }
    }, [activeConsultations.length]); 


    // FORMULARIO NUEVA MASCOTA
    const { data: petData, setData: setPetData, post: postPet, processing: processingPet, reset: resetPet } = useForm({
        name: '', type: '', breed: '', age_human_years: '',
    });

    // FORMULARIO DE TRIAJE
    const { data: triageData, setData: setTriageData, post: postTriage, processing: processingTriage } = useForm({
        pet_id: '', symptoms: [], description: ''
    });

    const openPetModal = () => {
        resetPet();
        if (speciesList.length > 0) setPetData('type', speciesList[0].slug);
        setShowPetModal(true);
    };

    const submitPet = (e) => {
        e.preventDefault();
        postPet(route('pet.store.quick'), { onSuccess: () => setShowPetModal(false) });
    };

    const openTriageModal = (pet) => {
        setSelectedPet(pet);
        setTriageData('pet_id', pet.id);
        const speciesObj = speciesList.find(s => s.slug === pet.type);
        if (speciesObj) {
            setFilteredCategories(symptomCategories.filter(cat => cat.species_id === speciesObj.id));
        } else {
            setFilteredCategories([]); 
        }
        setShowTriageModal(true);
    };

    const toggleSymptom = (symptomId) => {
        const current = triageData.symptoms;
        if (current.includes(symptomId)) {
            setTriageData('symptoms', current.filter(id => id !== symptomId));
        } else {
            setTriageData('symptoms', [...current, symptomId]);
        }
    };

    const submitTriage = (e) => {
        e.preventDefault();
        postTriage(route('triage.store'));
    };

    // --- ACCIÓN: RECONECTAR A LA LLAMADA ---
    const handleRejoinCall = (link) => {
        window.open(link, '_blank'); 
    };

    return (
        <ClientLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mi Panel</h2>}>
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* --- BANNER DE VIDEOLLAMADA ACTIVA --- */}
                    {activeConsultations.length > 0 && activeConsultations.map(consultation => (
                        <div key={consultation.id} className="bg-red-600 text-white rounded-xl shadow-2xl p-6 flex flex-col md:flex-row items-center justify-between animate-pulse mx-4 sm:mx-0">
                            <div className="flex items-center mb-4 md:mb-0">
                                <span className="text-4xl mr-4">📹</span>
                                <div>
                                    <h3 className="text-xl font-black">Consulta en Curso</h3>
                                    <p className="text-red-100">El Doctor te está esperando en la sala para atender a tu mascota.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleRejoinCall(consultation.meeting_link)}
                                className="bg-white text-red-600 font-black px-6 py-3 rounded-lg shadow hover:bg-red-50 transition transform hover:scale-105 w-full md:w-auto text-center"
                            >
                                VOLVER A CONECTARME
                            </button>
                        </div>
                    ))}

                    {/* 🚨 NUEVO: EL EMPUJÓN SUAVE (NUDGE) PARA EL PERFIL 🚨 */}
                    {isProfileIncomplete && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl shadow-sm mx-4 sm:mx-0 flex flex-col sm:flex-row justify-between items-center animate-in slide-in-from-top duration-500">
                            <div className="flex items-center text-orange-800 mb-3 sm:mb-0">
                                <span className="text-2xl mr-3">⚠️</span>
                                <div>
                                    <p className="font-bold">Tu perfil médico está incompleto</p>
                                    <p className="text-sm">Agrega tu teléfono y DNI para agilizar tus emergencias y recibos de pago.</p>
                                </div>
                            </div>
                            <Link 
                                href={route('client.profile.edit')}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition shadow-md w-full sm:w-auto text-center"
                            >
                                Completar Datos
                            </Link>
                        </div>
                    )}
                    
                    {/* ENCABEZADO */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-0 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-3xl font-black text-gray-800">Hola, {userName} 👋</h1>
                            <p className="text-gray-500">Bienvenido al centro médico de tus engreídos.</p>
                        </div>
                        <PrimaryButton onClick={openPetModal} className="bg-slate-800 hover:bg-slate-700 w-full sm:w-auto justify-center">
                            + Nueva Mascota
                        </PrimaryButton>
                    </div>

                    {/* LISTA DE MASCOTAS */}
                    <div className="px-4 sm:px-0">
                        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                            <span className="mr-2">🐾</span> Mis Mascotas
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pets.map(pet => (
                                <div key={pet.id} className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                                    <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-5xl filter drop-shadow-md">
                                            {pet.type === 'cat' ? '🐱' : pet.type === 'dog' ? '🐶' : '🐾'}
                                        </span>
                                    </div>
                                    <div className="p-6 text-center">
                                        <h3 className="text-2xl font-black text-gray-800 mb-1">{pet.name}</h3>
                                        <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-4">{pet.breed} • {pet.age_human_years} años</p>
                                        
                                        <div className="space-y-3">
                                            <button 
                                                onClick={() => openTriageModal(pet)}
                                                className="w-full py-3 bg-red-500 text-white font-black rounded-xl shadow hover:bg-red-600 transform hover:-translate-y-1 transition-all flex items-center justify-center space-x-2"
                                            >
                                                <span>🚑</span> <span>SOLICITAR MÉDICO</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {pets.length === 0 && (
                                <div className="col-span-full text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-300">
                                    <span className="text-6xl mb-4 block">🦴</span>
                                    <p className="text-gray-500 text-xl mb-4 font-medium">Aún no tienes mascotas registradas.</p>
                                    <SecondaryButton onClick={openPetModal}>Agregar mi primera mascota</SecondaryButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL 1: NUEVA MASCOTA --- */}
            <Modal show={showPetModal} onClose={() => setShowPetModal(false)}>
                <form onSubmit={submitPet} className="p-6 bg-white">
                    <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Registrar Paciente 🐾</h2>
                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Nombre" />
                            <TextInput value={petData.name} onChange={e => setPetData('name', e.target.value)} className="w-full" required />
                        </div>
                        <div>
                            <InputLabel value="Tipo de Animal" />
                            <select value={petData.type} onChange={e => setPetData('type', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required>
                                <option value="" disabled>Selecciona...</option>
                                {speciesList.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><InputLabel value="Raza" /><TextInput value={petData.breed} onChange={e => setPetData('breed', e.target.value)} className="w-full" /></div>
                            <div><InputLabel value="Edad (Años)" /><TextInput value={petData.age_human_years} onChange={e => setPetData('age_human_years', e.target.value)} className="w-full" /></div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <SecondaryButton onClick={() => setShowPetModal(false)} className="mr-3">Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processingPet} className="bg-slate-800">Guardar Mascota</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* --- MODAL 2: TRIAJE DE EMERGENCIA --- */}
            <Modal show={showTriageModal} onClose={() => setShowTriageModal(false)} maxWidth="2xl">
                 <form onSubmit={submitTriage} className="p-6">
                    <div className="mb-6 border-b pb-4">
                        <h2 className="text-2xl font-black text-red-600">TRIAJE DE EMERGENCIA 🚑</h2>
                        <p className="text-gray-600">Paciente: <span className="font-bold">{selectedPet?.name}</span></p>
                    </div>
                    <div className="max-h-96 overflow-y-auto pr-2">
                        {filteredCategories.map(cat => (
                            <div key={cat.id} className="mb-6">
                                <h4 className="font-bold text-slate-800 mb-2">{cat.icon} {cat.name}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {cat.symptoms.map(sym => (
                                        <div key={sym.id} onClick={() => toggleSymptom(sym.id)} className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${triageData.symptoms.includes(sym.id) ? 'border-red-500 bg-red-50 font-bold' : 'border-gray-200 hover:border-red-200'}`}>
                                            {sym.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end border-t pt-4">
                        <SecondaryButton onClick={() => setShowTriageModal(false)} className="mr-3">Cancelar</SecondaryButton>
                        
                        {/* 👇 AQUÍ ESTÁ EL CANDADO VISUAL ANTI-DOBLE CLIC 👇 */}
                        <PrimaryButton 
                            className="bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                            disabled={processingTriage || triageData.symptoms.length === 0}
                        >
                            {processingTriage ? '⏳ PROCESANDO...' : '🚑 SOLICITAR AYUDA AHORA'}
                        </PrimaryButton>
                        {/* 👆 FIN DEL CANDADO 👆 */}

                    </div>
                </form>
            </Modal>
        </ClientLayout>
    );
}