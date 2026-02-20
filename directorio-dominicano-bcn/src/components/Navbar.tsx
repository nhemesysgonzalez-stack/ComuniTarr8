import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Shield, Crown } from 'lucide-react';

const Navbar: React.FC = () => {
    const { user, signOut, isAdmin, isPremium } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="header">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="size-10 bg-dr-blue rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                        DD
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="font-black text-lg tracking-tight">Directorio Dominicano</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dr-red">Barcelona</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Inicio</Link>
                    <Link to="/directorio" className={`nav-link ${isActive('/directorio') ? 'active' : ''}`}>Explorar</Link>

                    {user ? (
                        <div className="flex items-center gap-4 ml-4">
                            {isAdmin && (
                                <Link to="/admin" className="btn btn-outline btn-sm gap-2">
                                    <Shield size={14} /> Panel Admin
                                </Link>
                            )}
                            {isPremium && (
                                <div className="badge badge-premium gap-1">
                                    <Crown size={12} /> Premium
                                </div>
                            )}
                            <Link to="/perfil" className="flex items-center gap-2 p-1 pl-3 bg-surface-2 rounded-full border border-border hover:border-dr-blue transition-colors group">
                                <span className="text-xs font-bold text-gray-700">{user.full_name.split(' ')[0]}</span>
                                <div className="size-8 bg-dr-blue rounded-full flex items-center justify-center text-white">
                                    <User size={16} />
                                </div>
                            </Link>
                            <button onClick={() => signOut()} className="text-gray-400 hover:text-dr-red transition-colors p-2" title="Cerrar Sesión">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 ml-4">
                            <Link to="/login" className="btn btn-ghost btn-sm">Iniciar Sesión</Link>
                            <Link to="/registro" className="btn btn-primary btn-sm">Publicar Negocio</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600">
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 p-6 space-y-4 animate-in">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="block font-bold text-lg">Inicio</Link>
                    <Link to="/directorio" onClick={() => setIsMenuOpen(false)} className="block font-bold text-lg">Explorar</Link>
                    <hr />
                    {user ? (
                        <>
                            <Link to="/perfil" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 font-bold text-lg">
                                <User size={20} /> Mi Perfil
                            </Link>
                            {isAdmin && (
                                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 font-bold text-lg text-dr-blue">
                                    <Shield size={20} /> Panel Admin
                                </Link>
                            )}
                            <button onClick={() => { signOut(); setIsMenuOpen(false); }} className="flex items-center gap-3 font-bold text-lg text-dr-red">
                                <LogOut size={20} /> Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block btn btn-outline w-full text-center">Iniciar Sesión</Link>
                            <Link to="/registro" onClick={() => setIsMenuOpen(false)} className="block btn btn-primary w-full text-center">Publicar Negocio</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
