import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Dashboard({ auth, pets, userName, speciesList, symptomCategories, flash }) {
    
    // ESTADOS DE LOS MODALES
    const [showPetModal, setShowPetModal] = useState(false);
    const [showTriageModal, setShowTriageModal] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [filteredCategories, setFilteredCategories] = useState([]);

    // FORMULARIO NUEVA MASCOTA
    const { data: petData, setData: setPetData, post: postPet, processing: processingPet, reset: resetPet, errors: petErrors } = useForm({
        name: '',
        type: '', // Aquí guardaremos el 'slug' (dog, cat, hamster)
        breed: '',
        age_human_years: '',
    });

    // FORMULARIO DE TRIAJE
    const { data: triageData, setData: setTriageData, post: postTriage, processing: processingTriage, reset: resetTriage } = useForm({
        pet_id: '',
        symptoms: [], // Array de IDs de síntomas
        description: ''
    });

    // --- LÓGICA MODAL MASCOTA ---
    const openPetModal = () => {
        resetPet();
        // Pre-seleccionar la primera especie si existe
        if (speciesList.length > 0) {
            setPetData('type', speciesList[0].slug);
        }
        setShowPetModal(true);
    };

    const submitPet = (e) => {
        e.preventDefault();
        postPet(route('pet.store.quick'), {
            onSuccess: () => setShowPetModal(false)
        });
    };

    // --- LÓGICA MODAL TRIAJE (El Cerebro) ---
    const openTriageModal = (pet) => {
        setSelectedPet(pet);
        setTriageData('pet_id', pet.id);
        
        // 1. Identificar la especie de la mascota seleccionada
        // Buscamos en la lista de especies cuál coincide con el 'type' (slug) de la mascota
        const speciesObj = speciesList.find(s => s.slug === pet.type);

        if (speciesObj) {
            // 2. FILTRADO INTELIGENTE:
            // Solo mostramos categorías que pertenezcan al ID de esa especie
            const relevantCategories = symptomCategories.filter(cat => cat.species_id === speciesObj.id);
            setFilteredCategories(relevantCategories);
        } else {
            // Fallback por si hay datos viejos: mostrar todo (o nada)
            console.warn("Especie no encontrada para:", pet.type);
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

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* ENCABEZADO */}
                    <div className="flex justify-between items-center mb-8 px-4 sm:px-0">
                        <div>
                            <h1 className="text-3xl font-black text-gray-800">Hola, {userName} 👋</h1>
                            <p className="text-gray-500">¿Cómo están tus engreídos hoy?</p>
                        </div>
                        <PrimaryButton onClick={openPetModal} className="bg-orange-600 hover:bg-orange-700">
                            + Nueva Mascota
                        </PrimaryButton>
                    </div>

                    {/* LISTA DE MASCOTAS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
                        {pets.map(pet => (
                            <div key={pet.id} className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                <div className="h-32 bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
                                    <span className="text-6xl filter drop-shadow-lg">
                                        {/* Emoji dinámico según el tipo */}
                                        {pet.type === 'cat' ? '🐱' : pet.type === 'dog' ? '🐶' : '🐾'}
                                    </span>
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{pet.name}</h3>
                                    <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-4">{pet.breed}</p>
                                    
                                    <button 
                                        onClick={() => openTriageModal(pet)}
                                        className="w-full py-3 bg-red-600 text-white font-black rounded-xl shadow-lg hover:bg-red-700 transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <span>🚑</span>
                                        <span>ATENCIÓN MÉDICA YA</span>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* TARJETA VACÍA (Si no hay mascotas) */}
                        {pets.length === 0 && (
                            <div className="col-span-full text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300">
                                <p className="text-gray-400 text-xl mb-4">Aún no tienes mascotas registradas.</p>
                                <SecondaryButton onClick={openPetModal}>Agregar mi primera mascota</SecondaryButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODAL 1: NUEVA MASCOTA (DINÁMICO) --- */}
            <Modal show={showPetModal} onClose={() => setShowPetModal(false)}>
                <form onSubmit={submitPet} className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Paciente 🐾</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Nombre" />
                            <TextInput 
                                value={petData.name} 
                                onChange={e => setPetData('name', e.target.value)} 
                                className="w-full" 
                                placeholder="Ej: Firulais" 
                                required
                            />
                        </div>

                        {/* SELECTOR DE ESPECIE (LEYENDO DE LA BD) */}
                        <div>
                            <InputLabel value="Tipo de Animal" />
                            <select 
                                value={petData.type}
                                onChange={e => setPetData('type', e.target.value)}
                                className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md shadow-sm"
                                required
                            >
                                <option value="" disabled>Selecciona...</option>
                                {speciesList.map(specie => (
                                    <option key={specie.id} value={specie.slug}>
                                        {specie.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Raza" />
                                <TextInput 
                                    value={petData.breed} 
                                    onChange={e => setPetData('breed', e.target.value)} 
                                    className="w-full" 
                                    placeholder="Ej: Mestizo" 
                                />
                            </div>
                            <div>
                                <InputLabel value="Edad (Años)" />
                                <TextInput 
                                    value={petData.age_human_years} 
                                    onChange={e => setPetData('age_human_years', e.target.value)} 
                                    className="w-full" 
                                    placeholder="Ej: 5" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <SecondaryButton onClick={() => setShowPetModal(false)} className="mr-3">Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processingPet} className="bg-orange-600">Guardar Mascota</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* --- MODAL 2: TRIAJE DE EMERGENCIA (FILTRADO) --- */}
            <Modal show={showTriageModal} onClose={() => setShowTriageModal(false)} maxWidth="2xl">
                <form onSubmit={submitTriage} className="p-6">
                    <div className="mb-6 border-b pb-4">
                        <h2 className="text-2xl font-black text-red-600">TRIAJE DE EMERGENCIA 🚑</h2>
                        <p className="text-gray-600">
                            Paciente: <span className="font-bold">{selectedPet?.name}</span> ({speciesList.find(s => s.slug === selectedPet?.type)?.name})
                        </p>
                    </div>

                    <div className="max-h-96 overflow-y-auto pr-2">
                        <p className="text-sm font-bold text-gray-700 mb-4">Selecciona los síntomas presentes:</p>
                        
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map(cat => (
                                <div key={cat.id} className="mb-6">
                                    <h4 className="font-bold text-orange-600 mb-2 flex items-center">
                                        <span className="mr-2 text-xl">{cat.icon}</span> 
                                        {cat.name}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {cat.symptoms.map(sym => (
                                            <div 
                                                key={sym.id}
                                                onClick={() => toggleSymptom(sym.id)}
                                                className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${
                                                    triageData.symptoms.includes(sym.id)
                                                        ? 'border-red-500 bg-red-50 text-red-700 font-bold'
                                                        : 'border-gray-200 hover:border-orange-300 text-gray-600'
                                                }`}
                                            >
                                                {sym.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-gray-100 rounded-xl">
                                <p className="text-gray-500">⚠️ No hay síntomas configurados para esta especie.</p>
                                <p className="text-xs text-gray-400 mt-2">Contacta al administrador.</p>
                            </div>
                        )}

                        <div className="mt-6">
                            <InputLabel value="Descripción adicional (Opcional)" />
                            <textarea 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                rows="3"
                                placeholder="Describe brevemente qué pasó..."
                                value={triageData.description}
                                onChange={e => setTriageData('description', e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end border-t pt-4">
                        <SecondaryButton onClick={() => setShowTriageModal(false)} className="mr-3">Cancelar</SecondaryButton>
                        <PrimaryButton 
                            className="bg-red-600 hover:bg-red-700 text-lg px-6 py-3"
                            disabled={processingTriage || triageData.symptoms.length === 0}
                        >
                            SOLICITAR AYUDA AHORA
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}