import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import RadioPlayer from './RadioPlayer';

const Sidebar: React.FC = () => {
  const { user, signOut, updateMetadata } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [forumUnread, setForumUnread] = useState(0);

  // Badge: count unread forum messages since user last visited /forum
  useEffect(() => {
    const UNREAD_KEY = 'forum_unread_count';
    const LAST_SEEN_KEY = 'forum_last_seen_ts';

    if (location.pathname === '/forum') {
      localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
      localStorage.setItem(UNREAD_KEY, '0');
      setForumUnread(0);
      return;
    }

    const stored = parseInt(localStorage.getItem(UNREAD_KEY) || '0', 10);
    setForumUnread(stored);

    const poll = setInterval(() => {
      if (location.pathname !== '/forum') {
        const count = parseInt(localStorage.getItem(UNREAD_KEY) || '0', 10);
        setForumUnread(count);
      }
    }, 6000);

    return () => clearInterval(poll);
  }, [location.pathname]);

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

  const NavItem: React.FC<{ to: string; label: string; icon: string; color: string; hasActivity?: boolean; badge?: number }> = ({ to, label, icon, color, hasActivity, badge }) => {
    const active = isActive(to);
    const [isPending, startTransition] = React.useTransition();

    const colorVariants: Record<string, string> = {
      primary: active ? 'bg-primary text-white shadow-primary/30' : 'text-gray-500 dark:text-gray-400 hover:text-primary',
      red: active ? 'bg-red-500 text-white shadow-red-500/30' : 'text-gray-500 dark:text-gray-400 hover:text-red-500',
      sky: active ? 'bg-sky-500 text-white shadow-sky-500/30' : 'text-gray-500 dark:text-gray-400 hover:text-sky-500',
      indigo: active ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500',
      emerald: active ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500',
      purple: active ? 'bg-purple-500 text-white shadow-purple-500/30' : 'text-gray-500 dark:text-gray-400 hover:text-purple-500',
      orange: active ? 'bg-orange-500 text-white shadow-orange-500/30' : 'text-gray-500 dark:text-gray-400 hover:text-orange-500',
    };

    return (
      <Link
        to={to}
        onClick={(e) => {
          if (active) return;
          startTransition(() => { });
        }}
        className={`flex items-center justify-between group px-4 py-3 rounded-2xl transition-all duration-300 font-bold ${active ? `${colorVariants[color]} shadow-lg font-black` : `${colorVariants[color]} hover:bg-gray-50 dark:hover:bg-gray-800`}`}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
          <span className="text-sm">{label}</span>
        </div>
        {badge && badge > 0 && !active ? (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black shadow-lg shadow-red-500/40 animate-bounce">
            {badge > 99 ? '99+' : badge}
          </span>
        ) : hasActivity && !active ? (
          <span className="flex size-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"></span>
        ) : null}
      </Link>
    );
  };

  return (
    <aside className="w-80 h-screen sticky top-0 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border-r border-slate-200/50 dark:border-white/5 flex flex-col hidden lg:flex z-50 overflow-hidden">
      {/* Brand Header */}
      <div className="p-8 flex items-center gap-4">
        <div className="size-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 p-0.5 shadow-lg shadow-primary/20">
          <div className="size-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
            <img src="/logo.svg" alt="ComuniTarr" className="size-8" />
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-black dark:text-white tracking-tighter leading-none uppercase">ComuniTarr</h2>
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] opacity-70">Vecindario 2.0</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-5 py-2 space-y-8 pb-10">
        <div>
          <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Explorar Barrio</p>
          <div className="space-y-1.5">
            <NavItem to="/" label={t('feed')} icon="grid_view" color="primary" />
            <NavItem to="/map" label={t('map')} icon="explore" color="primary" />
            <NavItem to="/announcements" label={t('announcements')} icon="campaign" color="red" hasActivity={true} />
            <NavItem to="/calendar" label={t('calendar')} icon="calendar_today" color="sky" />
          </div>
        </div>

        <div>
          <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Comunidad</p>
          <div className="space-y-1.5">
            <NavItem to="/forum" label={t('forum')} icon="chat" color="indigo" badge={forumUnread} hasActivity={forumUnread === 0} />
            <NavItem to="/neighbors" label={t('neighbors')} icon="waving_hand" color="emerald" />
            <NavItem to="/incidents" label="Incidencias" icon="report_problem" color="red" />
            <NavItem to="/local-businesses" label={t('local_business')} icon="storefront" color="emerald" />
            <NavItem to="/clubs" label={t('clubs')} icon="groups" color="primary" />
          </div>
        </div>

        <div>
          <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Bienestar</p>
          <div className="space-y-1.5">
            <NavItem to="/support" label={t('support')} icon="diversity_1" color="purple" />
            <NavItem to="/volunteering" label={t('volunteering')} icon="volunteer_activism" color="emerald" />
            <NavItem to="/vital" label={t('vital_care')} icon="favorite" color="red" />
          </div>
        </div>

        {user?.email === 'nhemesysgonzalez@gmail.com' && (
          <div className="pt-4">
            <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Administración</p>
            <NavItem to="/admin" label="Panel de Control" icon="shield_person" color="purple" />
          </div>
        )}
      </nav>

      {/* Footer Area: User Profile & Radio */}
      <div className="mt-auto p-5 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 space-y-6 backdrop-blur-md">
        <RadioPlayer />

        <div className="flex items-center gap-3">
          <Link to="/profile" className="relative group">
            <div className="size-12 rounded-2xl p-0.5 bg-gradient-to-tr from-primary to-blue-400 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <img
                src={user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + (user?.user_metadata?.full_name || 'V')}
                className="size-full rounded-[14px] object-cover border border-white/20"
                alt="Perfil"
              />
            </div>
            <span className="absolute -top-1 -right-1 size-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black dark:text-white truncate tracking-tight">{user?.user_metadata?.full_name || t('my_profile')}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('active_neighbor')}</p>
          </div>
          <button onClick={() => signOut()} className="size-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>

        {/* Neighborhood Quick Switcher */}
        <button
          onClick={() => setShowNeighborhoods(!showNeighborhoods)}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5 hover:border-primary/30 transition-all group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-lg">location_on</span>
            </div>
            <span className="text-[11px] font-black uppercase tracking-tight truncate dark:text-slate-300">{user?.user_metadata?.neighborhood || t('choose_neighborhood')}</span>
          </div>
          <span className={`material-symbols-outlined text-slate-400 transition-transform ${showNeighborhoods ? 'rotate-180' : ''}`}>expand_more</span>
        </button>

        {showNeighborhoods && (
          <div className="absolute bottom-[240px] left-6 right-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-3xl shadow-2xl p-2 z-[60] animate-in slide-in-from-bottom-2">
            {neighborhoods.map(n => (
              <button key={n} onClick={() => handleNeighborhoodChange(n)} className="w-full text-left px-5 py-3 text-[11px] font-black uppercase tracking-tight hover:bg-primary hover:text-white rounded-xl transition-all">
                {n}
              </button>
            ))}
          </div>
        )}

        {/* Languages */}
        <div className="flex justify-center gap-2 pb-2">
          {(['es', 'ca', 'en', 'fr'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition-all ${language === lang ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-400 hover:text-primary hover:bg-primary/5'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
