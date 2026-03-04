import React, { useState, useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
            <Head title="Iniciar Sesión" />

            <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
                
                {/* CABECERA / LOGO */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-orange-600 italic tracking-tight">ZANAHOY</h1>
                    <p className="text-slate-500 font-medium mt-2">Bienvenido de vuelta a tu centro médico.</p>
                </div>

                {/* MENSAJE DE ESTADO (Ej: Contraseña restablecida) */}
                {status && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-bold text-center">
                        ✅ {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    
                    {/* INPUT: EMAIL */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className={`w-full p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all font-medium text-slate-800 ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-orange-500'}`}
                            autoComplete="username"
                            autoFocus
                            placeholder="ejemplo@correo.com"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.email}</p>}
                    </div>

                    {/* INPUT: CONTRASEÑA CON OJITO */}
                    <div>
                        <div className="flex justify-between items-end mb-1.5 ml-1 pr-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña</label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={data.password}
                                className={`w-full p-4 pr-12 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all font-medium text-slate-800 ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-orange-500'}`}
                                autoComplete="current-password"
                                placeholder="Escribe tu contraseña"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors focus:outline-none"
                            >
                                {showPassword ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.password}</p>}
                    </div>

                    {/* CHECKBOX: RECORDARME */}
                    <div className="block mt-4 pl-1">
                        <label className="flex items-center cursor-pointer">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
                            />
                            <span className="ms-3 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">Recordar mi sesión</span>
                        </label>
                    </div>

                    {/* BOTÓN SUBMIT */}
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={processing} 
                            className="w-full bg-orange-600 text-white p-4 rounded-xl font-black tracking-wide text-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'INICIANDO...' : 'INICIAR SESIÓN'}
                        </button>
                    </div>
                </form>

                {/* ENLACE DE REGISTRO */}
                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-500">
                        ¿Aún no tienes cuenta? {' '}
                        <Link href={route('register.select')} className="font-bold text-orange-600 hover:text-orange-800 hover:underline transition-colors">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
                
            </div>
        </div>
    );
}