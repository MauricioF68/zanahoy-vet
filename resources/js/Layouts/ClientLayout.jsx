import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function ClientLayout({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // Enlaces del menú del Cliente (Por ahora todos apuntan al dashboard hasta crear las otras vistas)
    const navLinks = [
        { name: 'Mi Panel', route: 'dashboard', icon: '🏠' },
        { name: 'Historial Clínico', route: 'client.history', icon: '📂' },
        { name: 'Mis Pagos', route: 'client.payments', icon: '💳' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            
            {/* SIDEBAR PARA PC */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen shadow-xl sticky top-0">
                <div className="p-6 border-b border-slate-800 flex items-center justify-center">
                    <Link href="/">
                        <ApplicationLogo className="block h-10 w-auto fill-current text-white" />
                    </Link>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Menú Principal</div>
                    <nav className="space-y-2">
                        {navLinks.map((link, index) => (
                            <Link 
                                key={index} 
                                href={route(link.route)} 
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${route().current(link.route) ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <span className="text-xl">{link.icon}</span>
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* --- NUEVO: INFO DEL USUARIO EN PC --- */}
                <div className="p-4 border-t border-slate-800 bg-slate-800/50">
                    <div className="flex items-center space-x-3 mb-4 px-2">
                        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-orange-500 font-bold text-lg border-2 border-slate-600">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    
                    <Link method="post" href={route('logout')} as="button" className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-600 rounded-lg text-red-400 hover:text-white font-bold transition-colors">
                        <span>🚪</span>
                        <span>Cerrar Sesión</span>
                    </Link>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <div className="flex-1 flex flex-col w-full min-w-0">
                
                {/* TOPBAR PARA MÓVILES */}
                <nav className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-40">
                    <Link href="/">
                        <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                    </Link>
                    <button onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)} className="text-slate-300 hover:text-white p-2 focus:outline-none">
                        <svg className="h-7 w-7" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showingNavigationDropdown ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </nav>

                {/* MENÚ DESPLEGABLE MÓVIL */}
                {showingNavigationDropdown && (
                    <div className="md:hidden bg-slate-800 shadow-xl absolute w-full z-50 mt-[72px]">
                        
                        {/* --- NUEVO: INFO DEL USUARIO EN MÓVIL --- */}
                        <div className="px-4 py-4 border-b border-slate-700 flex items-center space-x-3">
                             <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-orange-500 font-bold text-lg">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="text-base font-medium text-white">{user?.name}</div>
                                <div className="text-sm font-medium text-slate-400">{user?.email}</div>
                            </div>
                        </div>

                        <div className="pt-2 pb-3 space-y-1">
                            {navLinks.map((link, index) => (
                                <Link 
                                    key={index} 
                                    href={route(link.route)} 
                                    className={`block pl-4 pr-4 py-3 border-l-4 text-base font-medium transition-colors ${route().current(link.route) ? 'bg-slate-700 border-orange-500 text-white' : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-500'}`}
                                >
                                    <span className="mr-3">{link.icon}</span> {link.name}
                                </Link>
                            ))}
                            <Link method="post" href={route('logout')} as="button" className="block w-full text-left pl-4 pr-4 py-3 border-l-4 border-transparent text-base font-bold text-red-400 hover:text-red-300 hover:bg-slate-700">
                                🚪 Cerrar Sesión
                            </Link>
                        </div>
                    </div>
                )}

                {/* HEADER DE LA PÁGINA */}
                {header && (
                    <header className="bg-white shadow-sm border-b">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* ÁREA DE CONTENIDO */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}