import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/ExpertLayout';

export default function Index({ auth, triages, expertFee }) {
    
    // --- ESTADOS DE LOS FILTROS ---
    const [filterType, setFilterType] = useState('month'); // Por defecto mostramos "Este Mes"
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    // --- LÓGICA DE FILTRADO (Se recalcula automáticamente al cambiar una fecha) ---
    const filteredTriages = useMemo(() => {
        const now = new Date();
        
        return triages.filter(triage => {
            const tDate = new Date(triage.created_at);
            
            if (filterType === 'all') return true;
            
            if (filterType === 'today') {
                return tDate.toDateString() === now.toDateString();
            }
            
            if (filterType === 'week') {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(now.getDate() - 7);
                return tDate >= sevenDaysAgo;
            }
            
            if (filterType === 'month') {
                return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
            }
            
            if (filterType === 'custom' && customStart && customEnd) {
                // Ajustamos las horas para que abarque todo el día seleccionado
                const s = new Date(customStart + 'T00:00:00');
                const e = new Date(customEnd + 'T23:59:59');
                return tDate >= s && tDate <= e;
            }
            
            return true;
        });
    }, [triages, filterType, customStart, customEnd]);

    // --- MATEMÁTICAS: SUMATORIA DE TARJETAS ---
    // 1. Total Histórico (Sin filtros)
    const totalHistory = triages.reduce((sum, t) => sum + Number(t.expert_earning), 0);
    
    // 2. Total del Mes Actual (Fijo para motivar)
    const totalThisMonth = triages.filter(t => {
        const d = new Date(t.created_at);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, t) => sum + Number(t.expert_earning), 0);

    // 3. Total Filtrado (El que cambia con el select)
    const totalFiltered = filteredTriages.reduce((sum, t) => sum + Number(t.expert_earning), 0);

    return (
        <ExpertLayout user={auth.user} header="💰 Mis Honorarios y Billetera">
            <Head title="Mis Honorarios" />

            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* --- ALERTA DE TARIFA FIJA --- */}
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-6 py-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                        <span className="font-bold">Tarifa de Honorarios Actual:</span> Tu ganancia está configurada en 
                        <span className="font-black ml-1 text-lg">S/ {Number(expertFee).toFixed(2)}</span> por atención completada.
                    </div>
                    <span className="text-3xl">👨‍⚕️</span>
                </div>

                {/* --- LAS 3 TARJETAS DE MÉTRICAS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tarjeta Dinámica */}
                    <div className="bg-white rounded-3xl shadow-sm p-6 border-l-8 border-indigo-500 flex flex-col justify-center">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Ganancias del Periodo Filtrado
                        </p>
                        <h3 className="text-4xl font-black text-indigo-700">S/ {totalFiltered.toFixed(2)}</h3>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100 flex flex-col justify-center">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Generado Este Mes</p>
                        <h3 className="text-3xl font-black text-slate-800">S/ {totalThisMonth.toFixed(2)}</h3>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100 flex flex-col justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Histórico</p>
                        <h3 className="text-3xl font-black text-slate-600">S/ {totalHistory.toFixed(2)}</h3>
                    </div>
                </div>

                {/* --- BARRA DE FILTROS --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-64">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Filtrar por Fecha</label>
                        <select 
                            className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm font-medium text-slate-700"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="today">Hoy</option>
                            <option value="week">Últimos 7 días</option>
                            <option value="month">Este Mes</option>
                            <option value="all">Todo el Historial</option>
                            <option value="custom">Rango Personalizado...</option>
                        </select>
                    </div>

                    {/* Aparece solo si selecciona "Personalizado" */}
                    {filterType === 'custom' && (
                        <div className="flex flex-col md:flex-row gap-4 flex-1 animate-fade-in-up">
                            <div className="w-full">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Desde</label>
                                <input type="date" className="w-full rounded-xl border-slate-300 text-slate-700" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                            </div>
                            <div className="w-full">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hasta</label>
                                <input type="date" className="w-full rounded-xl border-slate-300 text-slate-700" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                {/* --- LA TABLA DE DETALLES --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-black text-slate-800 text-lg">Historial de Atenciones Pagadas</h3>
                        <p className="text-sm text-slate-500">Solo se muestran los pacientes que ya finalizaron su consulta y cuyo pago fue validado por caja.</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha y Código</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Paciente</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Estado Contable</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Ganancia</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {filteredTriages.length > 0 ? (
                                    filteredTriages.map((triage) => (
                                        <tr key={triage.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-slate-800">{new Date(triage.created_at).toLocaleDateString('es-ES')}</div>
                                                <div className="text-xs text-slate-500 font-mono">{triage.payment_code || `SIN-COD-${triage.id}`}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 flex items-center">
                                                    <span className="mr-2">{triage.pet?.type === 'dog' ? '🐶' : '🐱'}</span>
                                                    {triage.pet?.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {/* En la versión 2 aquí cambiaremos entre 'Por Liquidar' y 'Pagado' */}
                                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                                                    ⏳ Saldo Acumulado
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="font-black text-lg text-green-600">
                                                    + S/ {Number(triage.expert_earning).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                            <span className="text-4xl block mb-2 opacity-50 grayscale">🧾</span>
                                            <p className="font-medium text-lg">No hay ganancias en este periodo.</p>
                                            <p className="text-sm">Prueba ajustando los filtros de fecha.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </ExpertLayout>
    );
}