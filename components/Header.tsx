
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
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const mockNotifications = [
    { id: 1, title: 'Nueva Incidencia', desc: 'Farola rota en tu zona', time: 'Hace 5m', icon: 'report_problem', color: 'text-red-500' },
    { id: 2, title: 'Evento Cerca', desc: 'Paella popular este domingo', time: 'Hace 1h', icon: 'event', color: 'text-primary' },
    { id: 3, title: 'Mercadillo', desc: 'Nuevo sofá gratis en el Serrallo', time: 'Hace 3h', icon: 'shopping_basket', color: 'text-emerald-500' }
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
    { to: '/map', label: t('map'), icon: 'explore' },
    { to: '/announcements', label: t('announcements'), icon: 'campaign' },
    { to: '/calendar', label: t('calendar'), icon: 'calendar_today' },
    { to: '/neighbors', label: t('neighbors'), icon: 'waving_hand' },
    { to: '/incidents', label: t('incidents_nav'), icon: 'report_problem' },
    { to: '/community-info', label: t('about'), icon: 'info' },
    { to: '/local-businesses', label: t('local_business'), icon: 'storefront' },
    { to: '/business-directory', label: 'Directorio Negocios', icon: 'business_center' },
    { to: '/clubs', label: t('clubs'), icon: 'groups' },
    { to: '/forum', label: t('forum'), icon: 'chat' },
    { to: '/workshops', label: t('workshops'), icon: 'school' },
    { to: '/challenges', label: t('challenges'), icon: 'military_tech' },
    { to: '/volunteering', label: t('volunteering'), icon: 'volunteer_activism' },
    { to: '/support', label: t('support'), icon: 'diversity_1' },
    { to: '/stories', label: t('stories'), icon: 'sentiment_satisfied' },
    { to: '/vital', label: t('vital_care'), icon: 'favorite' },
    { to: '/market', label: t('market'), icon: 'shopping_bag' },
    { to: '/services', label: t('mutual_aid'), icon: 'handshake' },
    { to: '/patrols', label: t('patrols'), icon: 'shield' },
    { to: '/polls', label: t('polls'), icon: 'how_to_vote' },
    { to: '/emergency', label: t('emergency'), icon: 'emergency' },
    { to: '/assistant', label: t('assistant'), icon: 'handshake' }
  ];

  return (
    <div className="sticky top-0 z-50 w-full max-w-full overflow-x-hidden">
      {/* Desktop Header Content */}
      <header className="hidden lg:flex bg-white/70 dark:bg-surface-dark/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 h-20 items-center justify-between px-10 transition-all font-sans">
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
            <button
              onClick={cycleLanguage}
              className="flex items-center justify-center size-10 rounded-xl bg-white dark:bg-gray-700 shadow-sm text-primary hover:scale-110 transition-all font-black text-[10px]"
            >
              {language.toUpperCase()}
            </button>
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center size-10 rounded-xl text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-gray-700 transition-all"
            >
              <span className="material-symbols-outlined font-black">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative size-12 flex items-center justify-center rounded-2xl border-2 transition-all group ${showNotifications ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(43,140,238,0.5)]' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-primary/50 hover:scale-110'}`}
              title="Notificaciones de tu barrio"
            >
              <span className={`material-symbols-outlined font-black ${showNotifications ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`}>notifications</span>
              <span className="absolute top-2.5 right-2.5 size-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse shadow-lg"></span>
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-16 right-0 w-80 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-[35px] shadow-2xl z-50 p-6 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black dark:text-white uppercase tracking-widest">Notificaciones</h4>
                    <span className="text-[9px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full">3 NUEVAS</span>
                  </div>
                  <div className="space-y-4">
                    {mockNotifications.map(n => (
                      <div key={n.id} className="flex gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                        <div className={`size-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0`}>
                          <span className={`material-symbols-outlined text-xl ${n.color}`}>{n.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black dark:text-white uppercase leading-none mb-1">{n.title}</p>
                          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 line-clamp-1">{n.desc}</p>
                          <p className="text-[8px] font-black text-gray-400/50 uppercase tracking-tighter mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">Ver todo lo anterior</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
                    {mockNotifications.map(n => (
                      <div key={n.id} className="flex gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <span className={`material-symbols-outlined text-lg ${n.color}`}>{n.icon}</span>
                        <div>
                          <p className="text-[10px] font-black dark:text-white leading-none mb-1">{n.title}</p>
                          <p className="text-[9px] text-gray-500 line-clamp-1">{n.desc}</p>
                        </div>
                      </div>
                    ))}
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

      {/* Global Activity Ticker - Part of the Header Unit */}
      <div className="bg-primary/95 backdrop-blur-md py-1.5 overflow-hidden border-b border-white/10 relative w-full max-w-full">
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap items-center gap-10 text-white text-[8px] font-black uppercase tracking-[0.2em]"
        >
          <span className="flex items-center gap-2">🔥 DOMINGO: ¡ÉXITO DE LA CALÇOTADA! - GRACIAS A LOS 500 ASISTENTES</span>
          <span className="opacity-30">•</span>
          <span className="flex items-center gap-2">🚗 TRÁFICO: RETENCIONES EN N-240 BAJADA PONT DEL DIABLE - PACIENCIA</span>
          <span className="opacity-30">•</span>
          <span className="flex items-center gap-2">☀️ PREPPERS TGN: HOY "COCINA SOLAR" - ¡APROVECHA EL SOL DE TARDE!</span>
          <span className="opacity-30">•</span>
          <span className="flex items-center gap-2">🛋️ TARDE DE DOMINGO: CINE EN EL CENTRO CÍVICO (18:00)</span>
          <span className="opacity-30">•</span>
          <span className="flex items-center gap-2">🎒 PREPARA LA SEMANA: MAÑANA LUNES MERCADILLO EN BONAVISTA</span>
        </motion.div>
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
