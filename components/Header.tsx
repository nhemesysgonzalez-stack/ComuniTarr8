import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, signOut, updateMetadata } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);

  const neighborhoods = [
    'Part Alta', 'Serrallo', 'Eixample', 'Nou Eixample',
    'San Salvador', 'Sant Pere i Sant Pau', 'Llevant'
  ];

  const handleNeighborhoodChange = async (n: string) => {
    try {
      await updateMetadata({ neighborhood: n });
      setShowNeighborhoods(false);
      window.location.reload();
    } catch (e) {
      alert('Error al cambiar de barrio');
    }
  };

  const navItems = [
    { to: '/', label: 'Feed', icon: 'grid_view' },
    { to: '/map', label: 'Mapa', icon: 'explore' },
    { to: '/announcements', label: 'Avisos', icon: 'campaign' },
    { to: '/calendar', label: 'Eventos', icon: 'calendar_today' },
    { to: '/market', label: 'Tienda', icon: 'shopping_bag' },
    { to: '/assistant', label: 'IA', icon: 'smart_toy' }
  ];

  return (
    <>
      {/* Top Header Desktop */}
      <header className="hidden lg:flex bg-white/70 dark:bg-surface-dark/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 h-20 items-center justify-between px-10 sticky top-0 z-40 transition-all font-sans">
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl px-5 py-3 border border-gray-100 dark:border-gray-700 focus-within:ring-2 ring-primary/20 transition-all w-96 group">
            <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm font-bold dark:text-white placeholder-gray-400 ml-3 w-full"
              placeholder="¿Qué buscas en tu barrio?"
            />
          </div>
          <Link to="/announcements" className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/5 text-primary text-xs font-black hover:bg-primary/10 transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>PUBLICAR ALGO</span>
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
            <button className="flex items-center justify-center size-10 rounded-xl bg-white dark:bg-gray-700 shadow-sm text-primary">
              <span className="material-symbols-outlined font-black">translate</span>
            </button>
            <button className="flex items-center justify-center size-10 rounded-xl text-gray-400 hover:text-primary transition-all">
              <span className="material-symbols-outlined font-black">light_mode</span>
            </button>
          </div>

          <button className="relative size-12 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:scale-105 transition-all group">
            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary font-black">notifications</span>
            <span className="absolute top-3 right-3 size-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
          </button>

          <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
            <img
              src={user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + (user?.user_metadata?.full_name || 'V')}
              className="size-10 rounded-xl shadow-lg object-cover"
              alt="V"
            />
            <div className="text-right">
              <p className="text-xs font-black dark:text-white leading-none">{user?.user_metadata?.full_name?.split(' ')[0]}</p>
              <p className="text-[10px] font-bold text-primary">LVL 24</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" className="size-8" alt="L" />
          <span className="font-black dark:text-white tracking-tighter">COMUNITARR</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/announcements" className="size-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-[20px] font-black">add</span>
          </Link>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="size-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-primary border border-gray-100 dark:border-gray-700 transition-transform active:scale-90">
            <span className="material-symbols-outlined font-black">{isMenuOpen ? 'close' : 'menu_open'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white dark:bg-surface-dark animate-in fade-in transition-all overflow-y-auto">
          <div className="pt-20 pb-10 px-8 space-y-8">
            <div className="flex items-center gap-4 p-5 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <img
                src={user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + (user?.user_metadata?.full_name || 'V')}
                className="size-16 rounded-2xl shadow-xl border-4 border-white dark:border-gray-800 object-cover"
                alt="U"
              />
              <div>
                <h3 className="text-lg font-black dark:text-white leading-none mb-1">{user?.user_metadata?.full_name}</h3>
                <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full uppercase tracking-widest">Vecino Plata</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {navItems.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 p-5 rounded-3xl text-sm font-black transition-all ${location.pathname === item.to ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-gray-50 dark:bg-gray-800 dark:text-gray-300'}`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="tracking-tight uppercase">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Cambiar Barrio</p>
              <div className="grid grid-cols-2 gap-2">
                {neighborhoods.map(n => (
                  <button
                    key={n}
                    onClick={() => handleNeighborhoodChange(n)}
                    className={`p-4 rounded-3xl text-[10px] font-black transition-all border ${user?.user_metadata?.neighborhood === n ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 dark:bg-gray-800 border-transparent dark:text-gray-400 text-gray-500'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-10">
              <button onClick={() => signOut()} className="flex-1 flex items-center justify-center gap-2 p-5 rounded-3xl bg-red-500 text-white font-black text-xs shadow-lg shadow-red-500/20">
                <span className="material-symbols-outlined text-[18px]">logout</span>
                SALIR
              </button>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex-1 flex items-center justify-center gap-2 p-5 rounded-3xl bg-gray-100 dark:bg-gray-800 font-black text-xs dark:text-white">
                <span className="material-symbols-outlined text-[18px]">settings</span>
                AJUSTES
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
