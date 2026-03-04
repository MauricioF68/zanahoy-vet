import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function SelectRole() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 md:p-12">
            <Head title="Únete a Zanahoy" />

            {/* ENCABEZADO Y LOGO */}
            <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="text-5xl font-black text-orange-600 italic tracking-tight mb-3">ZANAHOY</h1>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Crea tu cuenta gratis</h2>
                <p className="text-slate-500 mt-2 font-medium text-lg">¿Cómo te gustaría formar parte de nuestra comunidad médica?</p>
            </div>

            {/* CONTENEDOR DE TARJETAS (Grid de 3 columnas) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
                
                {/* 🐾 TARJETA 1: CLIENTE (DUEÑO) */}
                <Link 
                    href={route('register.client')} 
                    className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-500 group flex flex-col items-center text-center transform hover:-translate-y-2"
                >
                    <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">🐾</div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3">Soy Dueño</h2>
                    <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-4">
                        Cliente
                    </span>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Registra a tu mascota, solicita triajes inteligentes y recibe asistencia veterinaria al instante desde casa.
                    </p>
                </Link>

                {/* 🩺 TARJETA 2: EXPERTO (VETERINARIO) */}
                <Link 
                    href={route('register.expert')} 
                    className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 group flex flex-col items-center text-center transform hover:-translate-y-2"
                >
                    <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">🩺</div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3">Soy Veterinario</h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-4">
                        Experto
                    </span>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Profesionales, bachilleres o estudiantes de últimos ciclos. Brinda asesoría virtual y monetiza tu tiempo.
                    </p>
                </Link>

                {/* 🏥 TARJETA 3: CLÍNICA (ESTABLECIMIENTO) */}
                <Link 
                    href={route('register.clinic')} 
                    className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-500 group flex flex-col items-center text-center transform hover:-translate-y-2"
                >
                    <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">🏥</div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3">Soy Clínica</h2>
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-4">
                        Empresa
                    </span>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Establecimientos físicos. Recibe derivaciones de emergencias críticas y expande tu cartera de pacientes.
                    </p>
                </Link>
            </div>

            {/* BOTÓN INFERIOR: VOLVER AL LOGIN */}
            <div className="mt-12 text-center">
                <p className="text-slate-500 font-bold mb-3">¿Ya tienes una cuenta?</p>
                <Link 
                    href={route('login')} 
                    className="bg-white border-2 border-slate-200 text-slate-600 font-black py-3 px-10 rounded-xl hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm inline-block"
                >
                    INICIAR SESIÓN
                </Link>
            </div>
            
        </div>
    );
}