import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';

export default function FinishRegistration({ user_id, userName, email, role }) {
    const [showPassword, setShowPassword] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [checking, setChecking] = useState(false);
    const [localError, setLocalError] = useState('');

    const isClinic = role === 'clinic';
    const docLabel = isClinic ? 'RUC' : 'DNI';
    const docLength = isClinic ? 11 : 8;

    const { data, setData, post, processing, errors } = useForm({
        user_id: user_id,
        dni: '', 
        password: '',
        password_confirmation: '',
    });

    // --- REGLAS DE CONTRASEÑA EN TIEMPO REAL ---
    const hasLength = data.password.length >= 6;
    const hasNumber = /\d/.test(data.password);
    const hasUppercase = /[A-Z]/.test(data.password);
    const isPasswordValid = hasLength && hasNumber && hasUppercase;
    const passwordsMatch = data.password === data.password_confirmation && data.password.length > 0;

    useEffect(() => {
        if (data.dni.length === docLength) {
            verifyDoc();
        } else {
            setIsValidated(false);
            setLocalError('');
        }
    }, [data.dni]);

    const verifyDoc = async () => {
        setChecking(true);
        setLocalError('');
        try {
            const response = await axios.post(route('register.check.dni'), {
                user_id: user_id,
                dni: data.dni
            });

            if (response.data.valid) {
                setIsValidated(true);
            } else {
                setLocalError(`El ${docLabel} no coincide con nuestros registros. Contacte a soporte.`);
                setIsValidated(false);
            }
        } catch (e) {
            setLocalError('Error al verificar. Reintente.');
        } finally {
            setChecking(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        // Doble validación por si logran saltarse el disabled del botón
        if (!isPasswordValid || !passwordsMatch) return; 
        post(route('register.finish.store'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
            <Head title={`Verificar ${docLabel}`} />
            
            <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-orange-600 italic tracking-tight">ZANAHOY</h2>
                    <p className="text-slate-800 mt-3 font-bold text-lg leading-tight">{userName}</p>
                    <p className="text-slate-400 text-sm mb-3">{email}</p>
                    <span className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-4 py-1.5 rounded-full uppercase font-black tracking-widest">
                        {isClinic ? '🏥 Clínica' : '🩺 Experto'}
                    </span>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* ZONA DE VALIDACIÓN DEL DOCUMENTO */}
                    <div className={`${isValidated ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-300`}>
                        <label className="block text-xs font-bold text-slate-500 mb-2 text-center uppercase tracking-widest">
                            Validación de {docLabel}
                        </label>
                        <input 
                            type="text" 
                            maxLength={docLength} 
                            className={`w-full p-4 bg-slate-50 border-2 rounded-2xl text-center text-2xl font-black tracking-[0.2em] focus:ring-0 transition-all placeholder:text-slate-300 ${localError ? 'border-red-400 bg-red-50 text-red-600' : (isValidated ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 focus:border-orange-500 text-slate-700')}`}
                            value={data.dni} 
                            onChange={e => setData('dni', e.target.value.replace(/\D/g, ''))}
                            placeholder={isClinic ? "00000000000" : "00000000"}
                            disabled={isValidated || processing}
                        />
                        
                        {checking && <p className="text-orange-500 text-xs text-center mt-3 animate-pulse font-bold">Verificando en base de datos segura...</p>}
                        
                        {localError && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl text-center">
                                ❌ {localError}
                            </div>
                        )}
                    </div>

                    {/* ZONA DE CREACIÓN DE CONTRASEÑA */}
                    {isValidated && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6 pt-6 border-t border-slate-100">
                            
                            <div className="text-center py-2.5 px-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-black uppercase tracking-wider mb-2">
                                ✅ Identidad Verificada
                            </div>

                            {/* Input: Nueva Contraseña */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">Crea tu Contraseña</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="w-full p-4 pr-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-800 transition-all"
                                        value={data.password} 
                                        onChange={e => setData('password', e.target.value)} 
                                        required 
                                        disabled={processing}
                                        placeholder="Escribe tu nueva clave"
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
                                
                                {/* Checklist de Seguridad */}
                                <ul className="mt-3 space-y-1.5 ml-2">
                                    <li className={`text-xs font-bold transition-colors flex items-center ${hasLength ? 'text-green-600' : 'text-slate-400'}`}>
                                        <span className="mr-2 text-sm">{hasLength ? '✓' : '○'}</span> Mínimo 6 caracteres
                                    </li>
                                    <li className={`text-xs font-bold transition-colors flex items-center ${hasUppercase ? 'text-green-600' : 'text-slate-400'}`}>
                                        <span className="mr-2 text-sm">{hasUppercase ? '✓' : '○'}</span> Al menos una mayúscula
                                    </li>
                                    <li className={`text-xs font-bold transition-colors flex items-center ${hasNumber ? 'text-green-600' : 'text-slate-400'}`}>
                                        <span className="mr-2 text-sm">{hasNumber ? '✓' : '○'}</span> Al menos un número
                                    </li>
                                </ul>
                            </div>

                            {/* Input: Confirmar Contraseña */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">Repite tu Contraseña</label>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className={`w-full p-4 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-800 transition-all ${data.password_confirmation.length > 0 && !passwordsMatch ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''}`}
                                    value={data.password_confirmation} 
                                    onChange={e => setData('password_confirmation', e.target.value)} 
                                    required 
                                    disabled={processing}
                                    placeholder="Confirma tu clave"
                                />
                                {data.password_confirmation.length > 0 && !passwordsMatch && (
                                    <p className="text-red-500 text-xs font-bold mt-1.5 ml-2">❌ Las contraseñas no coinciden</p>
                                )}
                            </div>

                            {errors.password && <div className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded">{errors.password}</div>}

                            <button 
                                type="submit" 
                                disabled={processing || !isPasswordValid || !passwordsMatch} 
                                className="w-full bg-orange-600 text-white p-4 rounded-xl font-black tracking-wide text-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {processing ? 'PROCESANDO...' : 'FINALIZAR ACTIVACIÓN'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}