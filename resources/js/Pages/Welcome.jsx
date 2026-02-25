import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
            <Head title="Zanahoy - Emergencias Veterinarias" />

            {/* --- Navbar --- */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-4 flex justify-between items-center">
                <div className="text-2xl font-black text-orange-600 tracking-tighter">
                    ZANAHOY<span className="text-gray-800">.</span>
                </div>
                <div className="space-x-8 hidden md:flex font-medium">
                    <Link href="/login" className="text-gray-600 hover:text-orange-600 transition">Iniciar Sesión</Link>
                    <Link href={route('register.select')} className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition shadow-lg shadow-orange-200">
                        Unirse ahora
                    </Link>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <section className="pt-32 pb-20 px-6 relative">
                {/* Círculos decorativos de fondo con desenfoque */}
                <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50 transition-all duration-1000"></div>
                
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                        Cuidamos a los que <br />
                        <span className="text-orange-600 italic">más quieres.</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12">
                        La red de emergencias veterinarias más rápida. Conectamos expertos, clínicas y dueños de mascotas en segundos.
                    </p>

                    {/* --- Botones de Acción (El Triángulo de Usuarios) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                        {/* Tarjeta Cliente */}
                        <Link href={route('register.client')} 
                            className="group p-8 bg-orange-50 rounded-3xl border border-orange-100 hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-2">
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-white transition">Tengo una Mascota</h3>
                            <p className="text-orange-800 group-hover:text-orange-100 opacity-70 mb-4 transition">Busco atención inmediata</p>
                            <span className="text-orange-600 group-hover:text-white font-bold inline-flex items-center">
                                Registrarme →
                            </span>
                        </Link>

                        {/* Tarjeta Experto */}
                        <Link href={route('register.expert')} 
                            className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 hover:border-orange-600 transition-all duration-300 transform hover:-translate-y-2">
                            <h3 className="text-2xl font-bold mb-2">Soy Veterinario</h3>
                            <p className="text-gray-500 mb-4">Quiero atender emergencias</p>
                            <span className="text-orange-600 font-bold inline-flex items-center">
                                Postular ahora →
                            </span>
                        </Link>

                        {/* Tarjeta Clínica */}
                        <Link href={route('register.clinic')} 
                            className="group p-8 bg-gray-900 rounded-3xl border border-gray-800 hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-2">
                            <h3 className="text-2xl font-bold mb-2 text-white transition">Soy una Clínica</h3>
                            <p className="text-gray-400 group-hover:text-orange-100 mb-4 transition">Afiliar mi establecimiento</p>
                            <span className="text-white font-bold inline-flex items-center">
                                Registrar Local →
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- Stats / Minimalist Footer --- */}
            <footer className="py-12 border-t border-gray-50 text-center">
                <p className="text-sm text-gray-400">© 2026 Zanahoy. Hecho con ❤️ para las mascotas de Trujillo.</p>
            </footer>
        </div>
    );
}