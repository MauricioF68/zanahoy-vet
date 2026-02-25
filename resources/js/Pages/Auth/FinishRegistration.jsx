import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';

// 1. Recibimos 'role' desde el controlador
export default function FinishRegistration({ user_id, userName, email, role }) {
    const [showPassword, setShowPassword] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [checking, setChecking] = useState(false);
    const [localError, setLocalError] = useState('');

    // 2. Definimos variables dinámicas según el rol
    const isClinic = role === 'clinic';
    const docLabel = isClinic ? 'RUC' : 'DNI';
    const docLength = isClinic ? 11 : 8;

    const { data, setData, post, processing, errors } = useForm({
        user_id: user_id,
        dni: '', // Usamos este campo para ambos (DNI o RUC)
        password: '',
        password_confirmation: '',
    });

    // 3. Ajustamos el efecto para que valide según la longitud correcta (8 u 11)
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
        post(route('register.finish.store'));
    };

    return (
        <div className="min-h-screen bg-orange-50 flex flex-col justify-center items-center p-6">
            <Head title={`Verificar ${docLabel}`} />
            
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-orange-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-orange-600 italic">ZANAHOY</h2>
                    <p className="text-gray-500 mt-2 font-bold">{userName}</p>
                    <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase font-black">
                        {isClinic ? 'Cuenta de Clínica' : 'Cuenta de Experto'}
                    </span>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 text-center text-orange-600 uppercase">
                            Validación de {docLabel}
                        </label>
                        <input 
                            type="text" 
                            maxLength={docLength} // Dinámico: 8 o 11
                            className={`w-full p-4 bg-gray-50 border-2 rounded-2xl text-center text-2xl font-bold tracking-widest focus:ring-0 transition-all ${localError ? 'border-red-500 bg-red-50' : (isValidated ? 'border-green-500 bg-green-50' : 'border-gray-100 focus:border-orange-500')}`}
                            value={data.dni} 
                            onChange={e => setData('dni', e.target.value.replace(/\D/g, ''))}
                            placeholder={isClinic ? "00000000000" : "00000000"}
                            disabled={isValidated}
                        />
                        
                        {checking && <p className="text-orange-500 text-xs text-center mt-2 animate-pulse font-bold">Verificando en base de datos...</p>}
                        
                        {localError && (
                            <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl text-center">
                                {localError}
                            </div>
                        )}
                    </div>

                    {isValidated && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="text-center py-2 px-4 bg-green-500 text-white rounded-xl text-xs font-black uppercase">
                                ✓ {docLabel} Verificado Correctamente
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 ml-2">Nueva Contraseña</label>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500"
                                    value={data.password} 
                                    onChange={e => setData('password', e.target.value)} 
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 ml-2">Confirmar Contraseña</label>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500"
                                    value={data.password_confirmation} 
                                    onChange={e => setData('password_confirmation', e.target.value)} 
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[10px] text-orange-600 font-bold mt-1 ml-2 hover:underline"
                                >
                                    {showPassword ? 'OCULTAR' : 'MOSTRAR'} CONTRASEÑA
                                </button>
                            </div>

                            <button type="submit" disabled={processing} className="w-full bg-orange-600 text-white p-5 rounded-2xl font-bold text-lg hover:bg-orange-700 transition shadow-lg">
                                {processing ? 'Activando...' : 'Finalizar Activación'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}