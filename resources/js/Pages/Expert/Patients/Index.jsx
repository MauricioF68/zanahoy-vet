import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/ExpertLayout';
import TextInput from '@/Components/TextInput';

export default function Index({ auth, pets }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filtro inteligente por nombre de mascota o del dueño
    const filteredPets = pets.filter(pet => {
        const search = searchTerm.toLowerCase();
        return pet.name.toLowerCase().includes(search) || 
               pet.user?.name.toLowerCase().includes(search) ||
               pet.breed?.toLowerCase().includes(search);
    });

    return (
        <ExpertLayout user={auth.user} header="🐾 Mis Pacientes">
            <Head title="Mis Pacientes" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* BUSCADOR */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
                    <span className="text-2xl mr-4 text-slate-400">🔍</span>
                    <div className="flex-1">
                        <TextInput 
                            type="text" 
                            placeholder="Buscar por nombre de mascota, raza o dueño..." 
                            className="w-full border-none shadow-none focus:ring-0 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* GRILLA DE PACIENTES */}
                {filteredPets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPets.map(pet => (
                            <div key={pet.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                                <div className="flex items-center mb-4">
                                    <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mr-4 text-indigo-500">
                                        {pet.type === 'dog' ? '🐶' : pet.type === 'cat' ? '🐱' : '🐾'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">{pet.name}</h3>
                                        <p className="text-sm font-medium text-slate-500">{pet.breed} • {pet.age_human_years}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl mb-6">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Dueño/Tutor</p>
                                    <p className="text-sm font-bold text-slate-700">{pet.user?.name}</p>
                                    <p className="text-xs text-slate-500">{pet.user?.email}</p>
                                </div>
                                <div className="mt-auto">
                                    <Link 
                                        href={route('expert.patients.show', pet.id)} 
                                        className="w-full block text-center bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white font-black py-3 rounded-xl transition-colors"
                                    >
                                        📂 VER EXPEDIENTE MÉDICO
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                        <span className="text-6xl block mb-4 opacity-50 grayscale">📂</span>
                        <h3 className="text-xl font-bold text-slate-700">No se encontraron pacientes</h3>
                        <p className="text-slate-500 mt-2">Prueba buscando con otro nombre.</p>
                    </div>
                )}
            </div>
        </ExpertLayout>
    );
}