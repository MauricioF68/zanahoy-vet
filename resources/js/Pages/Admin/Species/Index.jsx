import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Index({ auth, species }) {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Formulario para Crear/Editar
    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        id: '',
        name: '',
    });

    const openCreateModal = () => {
        setIsEditing(false);
        reset();
        setShowModal(true);
    };

    const openEditModal = (specie) => {
        setIsEditing(true);
        setData({ id: specie.id, name: specie.name });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.species.update', data.id), {
                onSuccess: () => setShowModal(false)
            });
        } else {
            post(route('admin.species.store'), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar esta especie?')) {
            destroy(route('admin.species.destroy', id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="Gestión de Especies">
            <Head title="Especies" />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Listado de Animales</h2>
                <PrimaryButton onClick={openCreateModal}>+ Nueva Especie</PrimaryButton>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug (Código)</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {species.map((specie) => (
                            <tr key={specie.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">{specie.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{specie.slug}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => openEditModal(specie)} 
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 font-bold"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(specie.id)} 
                                        className="text-red-600 hover:text-red-900 font-bold"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {species.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No hay especies creadas.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CREAR / EDITAR */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditing ? 'Editar Especie' : 'Crear Nueva Especie'}
                    </h2>
                    
                    <div className="mb-4">
                        <InputLabel value="Nombre del Animal" />
                        <TextInput 
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full mt-1"
                            placeholder="Ej: Hámster"
                        />
                        {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={() => setShowModal(false)} className="mr-3">
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {isEditing ? 'Guardar Cambios' : 'Crear Especie'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}