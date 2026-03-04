import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';

export default function AdminLayout({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { url } = usePage();

    // Menú Lateral (Sidebar)
    const menuItems = [
        { name: 'Dashboard', route: 'admin.dashboard', icon: '📊' },
        { name: 'Especies', route: 'admin.species.index', icon: '🐾' },        
        { name: 'Categorías', route: 'admin.categories.index', icon: '🗂️' },
        { name: 'Síntomas', route: 'admin.symptoms.index', icon: '🩺' },
        { name: 'Combos Médicos', route: 'admin.symptom-combos.index', icon: '🧩' },
        { name: 'Gestion de Expertos', route: 'admin.requests.index', icon: '📬' },
        { name: 'Reglas y Ajustes', route: 'admin.settings.index', icon: '⚙️' },
        { name: 'Torre de Control', route: 'admin.triages.index', icon: '📡' },
        { name: 'Finanzas y Pagos', route: 'admin.finance.index', icon: '💰' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* SIDEBAR (Barra Lateral) */}
            <aside className="w-64 bg-slate-900 text-white min-h-screen hidden md:block shadow-xl">
                <div className="p-6">
                    <h1 className="text-2xl font-black text-orange-500 italic">ZANAHOY <span className="text-white text-xs block not-italic font-normal">Panel Admin</span></h1>
                </div>
                <nav className="mt-6">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={route(item.route)}
                            className={`flex items-center px-6 py-4 transition-colors ${
                                route().current(item.route) 
                                ? 'bg-orange-600 text-white' 
                                : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <span className="mr-3 text-xl">{item.icon}</span>
                            <span className="font-bold">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <div className="flex-1 flex flex-col">
                {/* Navbar Superior */}
                <header className="bg-white shadow h-16 flex items-center justify-between px-6">
                    <div className="md:hidden">
                        {/* Botón hamburguesa móvil (simplificado) */}
                        <button onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}>☰</button>
                    </div>
                    <div className="font-bold text-gray-700">{header}</div>
                    
                    <div className="flex items-center">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button type="button" className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150">
                                        {user?.name || 'Admin'}
                                        <svg className="ms-2 -me-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </span>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Perfil</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Cerrar Sesión</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Área de Trabajo */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}