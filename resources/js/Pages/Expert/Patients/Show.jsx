import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/ExpertLayout';

export default function Show({ auth, pet }) {
    
    // Filtramos solo los historiales válidos y atendidos
    const validHistory = pet.triages || [];

    return (
        <ExpertLayout user={auth.user} header="📂 Expediente Clínico">
            <Head title={`Expediente: ${pet.name}`} />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* BOTÓN DE VOLVER Y HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Link href={route('expert.patients.index')} className="mr-4 bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-xl transition font-bold">
                            ⬅️ Volver
                        </Link>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 flex items-center">
                                <span className="mr-2 text-3xl">{pet.type === 'dog' ? '🐶' : '🐱'}</span> 
                                {pet.name}
                            </h2>
                            <p className="text-slate-500 font-medium">Dueño: {pet.user?.name} | Raza: {pet.breed}</p>
                        </div>
                    </div>

                    {/* 📄 BOTÓN MAGICO DE PDF */}
                    <a 
                        href={route('expert.patients.pdf', pet.id)} 
                        target="_blank"
                        className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl shadow-lg transition-colors flex items-center"
                    >
                        📄 DESCARGAR HISTORIAL PDF
                    </a>
                </div>

                {/* LÍNEA DE TIEMPO (TIMELINE COLABORATIVO) */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <h3 className="text-xl font-black text-slate-800 mb-8 border-b pb-4">Historial de Consultas Médicas</h3>
                    
                    {validHistory.length > 0 ? (
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {validHistory.map((triage) => (
                                <div key={triage.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        🩺
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-black text-indigo-600 text-lg">
                                                {new Date(triage.created_at).toLocaleDateString('es-ES')}
                                            </span>
                                            <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-1 rounded">
                                                Dr(a). {triage.expert?.name || 'Clínica'}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Diagnóstico</p>
                                                <p className="text-sm font-bold text-slate-800">{triage.presumptive_diagnosis || 'Sin diagnóstico'}</p>
                                            </div>
                                            {triage.anamnesis && (
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Anamnesis / Observaciones</p>
                                                    <p className="text-sm text-slate-600 italic">"{triage.anamnesis}"</p>
                                                </div>
                                            )}
                                            {triage.prescription && (
                                                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                                    <p className="text-xs text-blue-500 font-bold uppercase mb-1">💊 Receta Médica</p>
                                                    <p className="text-sm text-blue-800 whitespace-pre-line">{triage.prescription}</p>
                                                </div>
                                            )}
                                            {triage.medical_instructions && (
                                                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                                    <p className="text-xs text-green-600 font-bold uppercase mb-1">🏠 Cuidados</p>
                                                    <p className="text-sm text-green-800 whitespace-pre-line">{triage.medical_instructions}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-8">No hay registros médicos cerrados para este paciente aún.</p>
                    )}
                </div>
            </div>
        </ExpertLayout>
    );
}