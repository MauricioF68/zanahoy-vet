import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function SelectRole() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
            <Head title="Únete a Zanahoy" />

            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-800">¡Bienvenido a Zanahoy Ya!</h1>
                <p className="text-gray-600 mt-2">Selecciona cómo deseas formar parte de nuestra red</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Tarjeta Experto */}
                <Link 
                    href="/register/expert" 
                    className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-500 group text-center"
                >
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">👨‍⚕️</div>
                    <h2 className="text-2xl font-bold text-gray-800">Soy Experto</h2>
                    <p className="text-gray-500 mt-2">Profesionales, bachilleres o estudiantes de últimos ciclos.</p>
                </Link>

                {/* Tarjeta Clínica */}
                <Link 
                    href="/register/clinic" 
                    className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-500 group text-center"
                >
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏥</div>
                    <h2 className="text-2xl font-bold text-gray-800">Soy Clínica</h2>
                    <p className="text-gray-500 mt-2">Establecimientos veterinarios físicos y centros médicos.</p>
                </Link>
            </div>

            <Link href="/" className="mt-8 text-gray-400 hover:text-gray-600 underline">
                Volver al inicio
            </Link>
        </div>
    );
}