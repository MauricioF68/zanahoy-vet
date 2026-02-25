import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ auth, categories, speciesList }) {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Formulario
    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        id: '',
        species_id: '', // <--- Campo para el ID de la especie
        name: '',
        icon: '',
    });

    const openCreateModal = () => {
        setIsEditing(false);
        reset();
        // Pre-seleccionamos la primera especie si existe, para comodidad
        setData({
            species_id: speciesList.length > 0 ? speciesList[0].id : '',
            name: '',
            icon: ''
        });
        setShowModal(true);
    };

    const openEditModal = (cat) => {
        setIsEditing(true);
        setData({ 
            id: cat.id, 
            species_id: cat.species_id, // Cargamos la especie actual
            name: cat.name,
            icon: cat.icon || '' 
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.categories.update', data.id), {
                onSuccess: () => setShowModal(false)
            });
        } else {
            post(route('admin.categories.store'), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar esta categoría? Se borrarán sus síntomas.')) {
            destroy(route('admin.categories.destroy', id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="Categorías de Síntomas">
            <Head title="Categorías" />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Categorías por Especie</h2>
                <PrimaryButton onClick={openCreateModal}>+ Nueva Categoría</PrimaryButton>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especie</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icono</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((cat) => (
                            <tr key={cat.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {/* Badge de color según especie */}
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                        cat.species?.slug === 'dog' ? 'bg-blue-100 text-blue-800' : 
                                        cat.species?.slug === 'cat' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {cat.species?.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-2xl">{cat.icon}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">{cat.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openEditModal(cat)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-bold">Editar</button>
                                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900 font-bold">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h2>
                    
                    {/* SELECTOR DE ESPECIE */}
                    <div className="mb-4">
                        <InputLabel value="¿A qué animal pertenece?" />
                        <select 
                            className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1"
                            value={data.species_id}
                            onChange={(e) => setData('species_id', e.target.value)}
                            required
                        >
                            <option value="" disabled>Selecciona una especie...</option>
                            {speciesList.map((specie) => (
                                <option key={specie.id} value={specie.id}>
                                    {specie.name}
                                </option>
                            ))}
                        </select>
                        {errors.species_id && <div className="text-red-500 text-sm mt-1">{errors.species_id}</div>}
                    </div>

                    <div className="mb-4">
                        <InputLabel value="Nombre (Ej: Digestivo)" />
                        <TextInput 
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full mt-1"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <InputLabel value="Icono (Ej: 🦴)" />
                        <TextInput 
                            value={data.icon}
                            onChange={e => setData('icon', e.target.value)}
                            className="w-full mt-1"
                        />
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