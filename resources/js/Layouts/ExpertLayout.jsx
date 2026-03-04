import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function ExpertLayout({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { url } = usePage(); // Para saber en qué página estamos y pintar el menú activo

    // Menú exclusivo del Médico Veterinario
    const navLinks = [
        { name: 'Radar de Emergencias', route: 'expert.dashboard', icon: '🚨', active: url.startsWith('/expert/dashboard') },
        { name: 'Mis Pacientes', route: 'expert.patients.index', icon: '🐾', active: url.startsWith('/expert/patients') }, // Ruta placeholder
        { name: 'Mis Honorarios', route: 'expert.dashboard', icon: '💰', active: url.startsWith('/expert/finances') }, // Ruta placeholder
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            
            {/* --- MENÚ LATERAL (SIDEBAR) PARA DESKTOP --- */}
            <aside className="hidden md:flex w-64 flex-col bg-slate-900 shadow-xl min-h-screen transition-all duration-300">
                <div className="flex items-center justify-center h-20 border-b border-slate-800 bg-slate-950">
                    <Link href="/">
                        <ApplicationLogo className="block h-10 w-auto fill-current text-white" />
                    </Link>
                </div>

                <div className="p-6 text-center border-b border-slate-800">
                    <div className="w-16 h-16 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-2xl text-white font-black shadow-lg mb-3">
                        {user.name.charAt(0)}
                    </div>
                    <h3 className="text-white font-bold text-sm">{user.name}</h3>
                    <p className="text-indigo-400 text-xs font-medium mt-1">🩺 Médico Veterinario</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={route(link.route)}
                            className={`flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                                link.active 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <span className="text-lg mr-3">{link.icon}</span>
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Link
                        href={route('logout')} method="post" as="button"
                        className="flex items-center w-full px-4 py-3 text-sm font-bold text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                    >
                        <span className="text-lg mr-3">🚪</span> Salir del turno
                    </Link>
                </div>
            </aside>

            {/* --- MENÚ MÓVIL (TOPBAR) --- */}
            <div className="md:hidden bg-slate-900 flex items-center justify-between p-4 shadow-md">
                <Link href="/">
                    <ApplicationLogo className="h-8 w-auto fill-current text-white" />
                </Link>
                <button onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)} className="text-white focus:outline-none">
                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* DROPDOWN MÓVIL */}
            <div className={`md:hidden bg-slate-800 ${showingNavigationDropdown ? 'block' : 'hidden'}`}>
                <div className="pt-2 pb-3 space-y-1 px-2">
                    {navLinks.map((link) => (
                        <Link key={link.name} href={route(link.route)} className={`block px-3 py-2 rounded-md text-base font-bold ${link.active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                            {link.icon} {link.name}
                        </Link>
                    ))}
                    <Link href={route('logout')} method="post" as="button" className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-red-400 hover:bg-red-500 hover:text-white">
                        🚪 Salir del turno
                    </Link>
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {header && (
                    <header className="bg-white shadow-sm border-b border-slate-200 z-10">
                        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                            <h1 className="text-xl font-black text-slate-800">{header}</h1>
                        </div>
                    </header>
                )}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
                    {children}
                </main>
            </div>
            
        </div>
    );
}