import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ auth, combos, speciesList, symptoms }) {
    const [currentSpeciesId, setCurrentSpeciesId] = useState(speciesList.length > 0 ? speciesList[0].id : null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Filtros
    const filteredCombos = combos.filter(c => c.species_id === currentSpeciesId);
    
    // Filtramos los síntomas para que en el formulario solo salgan los de la especie actual
    const currentSpeciesSymptoms = symptoms.filter(s => s.category?.species_id === currentSpeciesId);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        id: '',
        name: '',
        species_id: '',
        priority: 'critical',
        system_diagnosis: '',
        symptoms: [], // Array de IDs de síntomas
    });

    const openCreateModal = () => {
        setIsEditing(false);
        reset();
        setData({
            name: '',
            species_id: currentSpeciesId,
            priority: 'critical',
            system_diagnosis: '',
            symptoms: []
        });
        setShowModal(true);
    };

    const openEditModal = (combo) => {
        setIsEditing(true);
        setData({ 
            id: combo.id, 
            name: combo.name,
            species_id: combo.species_id,
            priority: combo.priority,
            system_diagnosis: combo.system_diagnosis || '',
            symptoms: combo.symptoms.map(s => s.id) // Extraemos solo los IDs
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEditing ? 'admin.symptom-combos.update' : 'admin.symptom-combos.store';
        const action = isEditing ? put : post;
        
        action(route(routeName, isEditing ? data.id : undefined), {
            onSuccess: () => setShowModal(false)
        });
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar este Combo Médico? No afectará a los casos pasados, pero dejará de funcionar a futuro.')) {
            destroy(route('admin.symptom-combos.destroy', id));
        }
    };

    const handleCheckboxChange = (symptomId) => {
        let currentArray = [...data.symptoms];
        if (currentArray.includes(symptomId)) {
            currentArray = currentArray.filter(id => id !== symptomId); // Quitar
        } else {
            currentArray.push(symptomId); // Agregar
        }
        setData('symptoms', currentArray);
    };

    const getPriorityBadge = (priority) => {
        switch(priority) {
            case 'critical': return <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">CRÍTICO</span>;
            case 'medium': return <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">MEDIO</span>;
            case 'low': return <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">BAJO</span>;
            default: return null;
        }
    };

    return (
        <AdminLayout user={auth.user} header="🧩 Combos Médicos (IA de Diagnóstico)">
            <Head title="Combos Médicos" />

            {/* --- ZONA DE PESTAÑAS (TABS) --- */}
            <div className="bg-white shadow rounded-lg mb-6 p-2 flex overflow-x-auto space-x-2">
                {speciesList.map(specie => (
                    <button
                        key={specie.id}
                        onClick={() => setCurrentSpeciesId(specie.id)}
                        className={`px-6 py-3 rounded-md font-bold text-sm uppercase tracking-wide transition-all ${
                            currentSpeciesId === specie.id
                                ? 'bg-orange-600 text-white shadow-md transform scale-105'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        {specie.name}
                    </button>
                ))}
            </div>

            {/* --- CONTENIDO --- */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        Reglas de Diagnóstico para {speciesList.find(s => s.id === currentSpeciesId)?.name}
                    </h2>
                    <p className="text-sm text-gray-500">Estas combinaciones sobrescriben la puntuación normal.</p>
                </div>
                <PrimaryButton onClick={openCreateModal}>+ Nuevo Combo</PrimaryButton>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Combo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Síntomas Requeridos</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acción Forzada</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCombos.length > 0 ? (
                            filteredCombos.map((combo) => (
                                <tr key={combo.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{combo.name}</div>
                                        <div className="text-xs text-gray-500 italic mt-1 line-clamp-1">{combo.system_diagnosis}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {combo.symptoms.map(sym => (
                                                <span key={sym.id} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                                                    {sym.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getPriorityBadge(combo.priority)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(combo)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-bold">Editar</button>
                                        <button onClick={() => handleDelete(combo.id)} className="text-red-600 hover:text-red-900 font-bold">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                    <p className="text-xl">🧩</p>
                                    <p>No hay combos creados para esta especie.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-black text-gray-900 mb-4 border-b pb-2">
                        {isEditing ? 'Editar Combo' : `Crear Nuevo Combo (${speciesList.find(s => s.id === currentSpeciesId)?.name})`}
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel value="Nombre Identificador (Ej: Alerta Parvo)" />
                            <TextInput 
                                value={data.name} onChange={e => setData('name', e.target.value)}
                                className="w-full mt-1" required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <InputLabel value="Fuerza Gravedad a:" />
                            <select 
                                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1"
                                value={data.priority} onChange={(e) => setData('priority', e.target.value)} required
                            >
                                <option value="critical">CRÍTICO (Emergencia ROJA)</option>
                                <option value="medium">MEDIO (Amarillo - Pago Obligatorio)</option>
                                <option value="low">BAJO (Verde)</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Diagnóstico para el Médico (Oculto al cliente)" />
                        <textarea
                            className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 text-sm"
                            rows="2"
                            placeholder="Ej: Posible obstrucción intestinal. Revisar abdomen urgente."
                            value={data.system_diagnosis}
                            onChange={e => setData('system_diagnosis', e.target.value)}
                        ></textarea>
                    </div>

                    {/* SELECTOR MÚLTIPLE DE SÍNTOMAS */}
                    <div className="mb-4">
                        <InputLabel value="Selecciona los Síntomas Detonantes (Mínimo 2)" className="mb-2" />
                        {errors.symptoms && <p className="text-red-500 text-xs mb-2 font-bold">{errors.symptoms}</p>}
                        
                        <div className="bg-gray-50 p-4 rounded-lg border h-64 overflow-y-auto">
                            {currentSpeciesSymptoms.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {currentSpeciesSymptoms.map(sym => (
                                        <label key={sym.id} className="flex items-start space-x-3 p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-gray-200">
                                            <input 
                                                type="checkbox" 
                                                className="mt-1 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                checked={data.symptoms.includes(sym.id)}
                                                onChange={() => handleCheckboxChange(sym.id)}
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">{sym.name}</span>
                                                <span className="block text-xs text-gray-400">{sym.category?.name}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm text-center mt-10">No hay síntomas creados para esta especie.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={() => setShowModal(false)} className="mr-3">Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing || data.symptoms.length < 2}>
                            {processing ? 'Guardando...' : 'Guardar Combo'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}