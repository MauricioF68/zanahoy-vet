import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ auth, symptoms, categories, speciesList }) {
    // ESTADO: ¿Qué especie estamos viendo actualmente? (Por defecto la primera de la lista)
    const [currentSpeciesId, setCurrentSpeciesId] = useState(speciesList.length > 0 ? speciesList[0].id : null);
    
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // FILTROS: Calculamos qué mostrar según la pestaña seleccionada
    const filteredSymptoms = symptoms.filter(s => s.category.species_id === currentSpeciesId);
    const filteredCategories = categories.filter(c => c.species_id === currentSpeciesId);
    
    // Formulario
    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        id: '',
        symptom_category_id: '', 
        name: '',
        weight: 5,
        medical_hint: '',
    });

    const openCreateModal = () => {
        setIsEditing(false);
        reset();
        // Pre-seleccionamos la primera categoría DISPONIBLE DE ESTA ESPECIE
        setData({
            symptom_category_id: filteredCategories.length > 0 ? filteredCategories[0].id : '',
            name: '',
            weight: 5,
            medical_hint: ''
        });
        setShowModal(true);
    };

    const openEditModal = (sym) => {
        setIsEditing(true);
        setData({ 
            id: sym.id, 
            symptom_category_id: sym.symptom_category_id,
            name: sym.name,
            weight: sym.weight,
            medical_hint: sym.medical_hint || ''
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEditing ? 'admin.symptoms.update' : 'admin.symptoms.store';
        const action = isEditing ? put : post;
        
        action(route(routeName, isEditing ? data.id : undefined), {
            onSuccess: () => setShowModal(false)
        });
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar síntoma?')) destroy(route('admin.symptoms.destroy', id));
    };

    // Helper de colores
    const getWeightColor = (weight) => {
        if (weight >= 15) return 'bg-red-600 text-white'; 
        if (weight >= 10) return 'bg-red-100 text-red-800'; 
        if (weight >= 6) return 'bg-yellow-100 text-yellow-800'; 
        return 'bg-green-100 text-green-800'; 
    };

    return (
        <AdminLayout user={auth.user} header="Gestión de Síntomas">
            <Head title="Síntomas" />

            {/* --- ZONA DE PESTAÑAS (TABS) --- */}
            <div className="bg-white shadow rounded-lg mb-6 p-2 flex overflow-x-auto space-x-2">
                {speciesList.map(specie => (
                    <button
                        key={specie.id}
                        onClick={() => setCurrentSpeciesId(specie.id)}
                        className={`px-6 py-3 rounded-md font-bold text-sm uppercase tracking-wide transition-all ${
                            currentSpeciesId === specie.id
                                ? 'bg-orange-600 text-white shadow-md transform scale-105' // Activo
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200' // Inactivo
                        }`}
                    >
                        {specie.name}
                    </button>
                ))}
            </div>

            {/* --- CONTENIDO --- */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                    Listado para {speciesList.find(s => s.id === currentSpeciesId)?.name}
                </h2>
                <PrimaryButton onClick={openCreateModal}>+ Nuevo Síntoma</PrimaryButton>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Síntoma</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Gravedad</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSymptoms.length > 0 ? (
                            filteredSymptoms.map((sym) => (
                                <tr key={sym.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <span className="text-xl mr-2">{sym.category?.icon}</span>
                                            <span className="font-medium text-gray-600">{sym.category?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800 text-lg">{sym.name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getWeightColor(sym.weight)}`}>
                                            {sym.weight} pts
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(sym)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-bold">Editar</button>
                                        <button onClick={() => handleDelete(sym.id)} className="text-red-600 hover:text-red-900 font-bold">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                    <p className="text-xl">📭</p>
                                    <p>No hay síntomas registrados para esta especie.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditing ? 'Editar Síntoma' : `Nuevo Síntoma (${speciesList.find(s => s.id === currentSpeciesId)?.name})`}
                    </h2>

                    <div className="mb-4">
                        <InputLabel value="Categoría" />
                        <select 
                            className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1"
                            value={data.symptom_category_id}
                            onChange={(e) => setData('symptom_category_id', e.target.value)}
                            required
                        >
                            <option value="" disabled>Selecciona una categoría...</option>
                            {/* AQUÍ SOLO MOSTRAMOS CATEGORÍAS DE LA ESPECIE SELECCIONADA */}
                            {filteredCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                        {filteredCategories.length === 0 && (
                            <p className="text-red-500 text-xs mt-1">⚠️ Primero debes crear Categorías para esta especie.</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <InputLabel value="Nombre del Síntoma" />
                        <TextInput 
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full mt-1"
                            placeholder="Ej: Fiebre alta"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel value="Peso (1-20)" />
                            <TextInput 
                                type="number" min="1" max="20"
                                value={data.weight}
                                onChange={e => setData('weight', e.target.value)}
                                className="w-full mt-1 font-bold text-center"
                            />
                        </div>
                        <div>
                            <InputLabel value="Pista Médica" />
                            <TextInput 
                                value={data.medical_hint}
                                onChange={e => setData('medical_hint', e.target.value)}
                                className="w-full mt-1"
                                placeholder="Ej: Urgencia"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={() => setShowModal(false)} className="mr-3">Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}