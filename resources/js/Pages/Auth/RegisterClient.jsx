import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function RegisterClient() {
    // Estado local para el "ojito" de la contraseña
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register.client.store'));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6">
            <Head title="Registro de Cliente" />
            
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900">Crea tu cuenta</h2>
                    <p className="text-gray-500 mt-2">Únete a la red de cuidado para tu mascota</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Campo Nombre */}
                    <div>
                        <input 
                            type="text" 
                            placeholder="Nombre completo"
                            className={`w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-green-500 ${errors.name ? 'ring-2 ring-red-500' : ''}`}
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                            required 
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1 ml-2">{errors.name}</p>}
                    </div>

                    {/* Campo Email */}
                    <div>
                        <input 
                            type="email" 
                            placeholder="Correo electrónico"
                            className={`w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-green-500 ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                            value={data.email} 
                            onChange={e => setData('email', e.target.value)} 
                            required 
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-2">{errors.email}</p>}
                    </div>

                    {/* Campo Contraseña con Ojito */}
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Contraseña (mín. 8 caracteres)"
                            className={`w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-green-500 ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                            value={data.password} 
                            onChange={e => setData('password', e.target.value)} 
                            required 
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? (
                                <span className="text-xs font-bold">OCULTAR</span>
                            ) : (
                                <span className="text-xs font-bold">MOSTRAR</span>
                            )}
                        </button>
                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-2">{errors.password}</p>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={processing}
                        className="w-full bg-green-500 text-white p-4 rounded-2xl font-bold text-lg hover:bg-green-600 transition-all transform active:scale-95 shadow-lg shadow-green-100 disabled:opacity-50"
                    >
                        {processing ? 'Procesando...' : 'Empezar ahora'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        ¿Ya tienes una cuenta? <Link href="/login" className="text-green-600 font-bold hover:underline">Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}