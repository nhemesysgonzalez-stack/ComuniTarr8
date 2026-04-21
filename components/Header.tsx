
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../services/translations';
import RadioPlayer from './RadioPlayer';

export const Header: React.FC = () => {
  const { user, signOut, updateMetadata } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const mockNotifications = [
    { id: 1, title: 'Baldosa suelta', desc: 'Nuevo reporte en Passeig de les Palmeres', time: 'Hace 2h', icon: 'report_problem', color: 'text-orange-500' },
    { id: 2, title: 'Patrimonio Romano', desc: 'Hoy ruta guiada gratuita a las 17h', time: 'Hace 3h', icon: 'event', color: 'text-primary' },
    { id: 3, title: 'Farmacia Guardia', desc: 'Farm. Garcia Rivas (Av. Països Catalans)', time: 'Hoy', icon: 'local_pharmacy', color: 'text-red-500' }
  ];

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const cycleLanguage = () => {
    const langs: Language[] = ['es', 'ca', 'en'];
    const nextIndex = (langs.indexOf(language) + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  // Sync theme on mount
  React.useEffect(() => {
    const theme = localStorage.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

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
    { to: '/', label: t('feed'), icon: 'grid_view' },
    { to: '/services', label: 'Empleos y Ayudas', icon: 'work' },
    { to: '/announcements', label: 'Alertas del Barrio', icon: 'campaign' },
    { to: '/incidents', label: t('incidents_nav'), icon: 'report_problem' },
    { to: '/stories', label: 'Galería Vecinal', icon: 'sentiment_satisfied' },
    { to: '/emergency', label: t('emergency'), icon: 'emergency' }
  ];

  return (
    <div className="sticky top-0 z-[60] w-full max-w-full overflow-x-hidden">
      {/* Desktop Header Content */}
      <header className="hidden lg:flex bg-white/40 dark:bg-[#0f172a]/40 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 h-[88px] items-center justify-between px-10 transition-all font-sans relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-[#1e293b]/50 pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="flex items-center bg-white/50 dark:bg-slate-800/50 rounded-[24px] px-6 py-4 border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] focus-within:shadow-[0_8px_32px_rgba(43,140,238,0.15)] focus-within:border-primary/40 transition-all w-[420px] group backdrop-blur-lg">
            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-xl">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-[13px] font-black dark:text-white placeholder-slate-400 ml-3 w-full uppercase tracking-widest"
              placeholder="¿Qué buscas en tu barrio?"
            />
          </div>
          <Link to="/announcements" className="flex items-center gap-2 px-6 py-4 rounded-[20px] bg-gradient-to-br from-primary to-blue-500 text-white shadow-xl shadow-primary/20 hover:scale-[1.02] hover:shadow-primary/30 active:scale-95 transition-all group">
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform duration-300">add</span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Publicar</span>
          </Link>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-800/40 p-1.5 rounded-[24px] border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm">
            <button
              onClick={cycleLanguage}
              className="flex items-center justify-center size-11 rounded-[18px] bg-white dark:bg-slate-700 shadow-sm text-primary hover:scale-105 transition-all font-black text-[10px] uppercase"
            >
              {language}
            </button>
            {user?.user_metadata?.role === 'admin' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-[18px] shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <span className="material-symbols-outlined font-black text-sm">add_circle</span>
                Grupo
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center size-11 rounded-[18px] text-slate-500 hover:text-primary hover:bg-white dark:text-slate-400 dark:hover:bg-slate-700 transition-all"
            >
              <span className="material-symbols-outlined font-black text-xl">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative size-14 flex items-center justify-center rounded-[24px] border-2 transition-all duration-300 group shadow-sm ${showNotifications ? 'bg-primary text-white border-primary shadow-[0_10px_40px_rgba(43,140,238,0.4)] scale-105' : 'bg-white/60 dark:bg-slate-800/60 border-white/50 dark:border-white/10 hover:border-primary/50 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-md'}`}
              title="Notificaciones de tu barrio"
            >
              <span className={`material-symbols-outlined text-[22px] transition-transform duration-300 ${showNotifications ? 'rotate-12' : 'group-hover:rotate-12'} ${showNotifications ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-primary'}`}>notifications</span>
              <span className="absolute top-3 right-3 size-3.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse"></span>
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="absolute top-20 right-0 w-[380px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] z-50 p-8 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-sm font-black dark:text-white uppercase tracking-widest text-slate-800">Notificaciones</h4>
                    <span className="text-[9px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full tracking-widest uppercase shadow-inner">3 NUEVAS</span>
                  </div>
                  <div className="space-y-4">
                    {mockNotifications.map(n => (
                      <div key={n.id} className="flex gap-4 p-4 rounded-[24px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer group border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md">
                        <div className={`size-12 rounded-[18px] bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                          <span className={`material-symbols-outlined text-[22px] ${n.color}`}>{n.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="text-xs font-black text-slate-800 dark:text-white uppercase leading-none mb-1.5 truncate">{n.title}</p>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1">{n.desc}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-primary hover:text-white bg-primary/5 hover:bg-primary transition-all border border-primary/10">Historial completo</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/profile" className="flex items-center gap-4 pl-2 pr-6 py-2 rounded-[28px] bg-white/40 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all border border-white/50 dark:border-white/10 backdrop-blur-md shadow-sm hover:shadow-md group">
            <div className="relative">
              <img
                src={user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + (user?.user_metadata?.full_name || 'V')}
                className="size-12 rounded-[20px] shadow-sm object-cover group-hover:scale-105 transition-transform"
                alt="V"
              />
              <span className="absolute -bottom-1 -right-1 size-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-800 dark:text-white leading-none uppercase tracking-tight">{user?.user_metadata?.full_name?.split(' ')[0]}</p>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1 opacity-80">Vecino Pro</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile Header Content */}
      <header className="lg:hidden bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 h-16 flex items-center justify-between px-6 transition-all">
        <Link to="/" className="flex flex-col">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" className="size-8" alt="L" />
            <span className="font-black dark:text-white tracking-tighter text-sm uppercase">ComuniTarr</span>
          </div>
          <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em] leading-none mt-0.5">Vecindario 2.0</span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Mobile Theme & Lang */}
          <button onClick={cycleLanguage} className="size-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-[10px] font-black border border-gray-100 dark:border-gray-700 dark:text-white">
            {language.toUpperCase()}
          </button>
          <button onClick={toggleDarkMode} className="size-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 border border-gray-100 dark:border-gray-700">
            <span className="material-symbols-outlined text-sm">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>

          {/* Mobile Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`size-10 flex items-center justify-center rounded-xl border transition-all ${showNotifications ? 'bg-primary text-white border-primary' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}
            >
              <span className="material-symbols-outlined text-[20px] font-black">notifications</span>
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="fixed top-16 left-4 right-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl z-50 p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black dark:text-white uppercase tracking-widest">Avisos del Barrio</h4>
                    <button onClick={() => setShowNotifications(false)} className="material-symbols-outlined text-gray-400">close</button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <span className="material-symbols-outlined text-lg text-rose-500">auto_stories</span>
                      <div>
                        <p className="text-[10px] font-black dark:text-white leading-none mb-1">Cerca de Sant Jordi</p>
                        <p className="text-[9px] text-gray-500 line-clamp-1">150 paradas este jueves en la Rambla Nova.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <span className="material-symbols-outlined text-lg text-amber-500">warning</span>
                      <div>
                        <p className="text-[10px] font-black dark:text-white leading-none mb-1">Aviso Montaje</p>
                        <p className="text-[9px] text-gray-500 line-clamp-1">Estructuras en Rambla. Evitad carga y descarga.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => { setIsMenuOpen(!isMenuOpen); setShowNotifications(false); }} className="size-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-primary border border-gray-100 dark:border-gray-700 transition-transform active:scale-90">
            <span className="material-symbols-outlined font-black">{isMenuOpen ? 'close' : 'menu_open'}</span>
          </button>
        </div>
      </header>

      {/* Emergency & Traffic Ticker - REAL TARRAGONA DATA + NUEVO MAPA SOCIAL */}
      <div className="bg-purple-600 dark:bg-purple-900 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] py-2 overflow-hidden flex items-center whitespace-nowrap z-50 shadow-md">
        <div className="animate-marquee flex gap-12 sm:gap-24 items-center">
          <span className="flex items-center gap-2 text-yellow-300">📍 SANT JORDI 2026: 150 paradas de libros y rosas en Rambla Nova este jueves (9h-20h).</span>
          <span className="flex items-center gap-2">⚠️ TRÁFICO: Cortes parciales en tramos de Rambla Nova por montaje de paradas hoy Martes.</span>
          <span className="flex items-center gap-2">🌹 ROSAS SOLIDARIAS: Reserva tu rosa en el mercado municipal y apoya a las entidades locales.</span>
          <span className="flex items-center gap-2">📚 MARATÓN DE LECTURA: Abierta inscripción para leer en voz alta este jueves al mediodía.</span>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="lg:hidden fixed inset-0 z-[60] bg-white dark:bg-surface-dark overflow-y-auto custom-scrollbar"
          >
            <div className="pt-8 pb-10 px-8 space-y-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img src="/logo.svg" className="size-8" alt="L" />
                  <span className="font-black dark:text-white tracking-tighter text-sm uppercase">MENÚ</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="size-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

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

              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Accesos Rápidos</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/emergency" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center justify-center p-6 rounded-[32px] bg-red-500 text-white shadow-lg shadow-red-500/20 gap-3">
                    <span className="material-symbols-outlined text-3xl font-black">emergency</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-center">EMERGENCIAS (SOS)</span>
                  </Link>
                  <Link to="/assistant" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center justify-center p-6 rounded-[32px] bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 gap-3">
                    <span className="material-symbols-outlined text-3xl font-black">handshake</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-center">MEDIADOR VECINAL</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {navItems.filter(item => !['/emergency', '/assistant'].includes(item.to)).map(item => (
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

              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Última Actualización</span>
                  <span className="text-xs font-black dark:text-white uppercase text-center w-full block">Martes 21 Abril 2026</span>
                  <span className="text-xs font-black dark:text-white uppercase">AEMET: Despejado 21ºC</span>
                </div>
              </div>

              <div className="py-4">
                <RadioPlayer />
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
