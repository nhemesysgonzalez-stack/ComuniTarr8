import React, { useState } from 'react';
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

  const NavItem: React.FC<{ to: string; label: string; icon: string; color: string; hasActivity?: boolean }> = ({ to, label, icon, color, hasActivity }) => {
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
        {hasActivity && !active && (
          <span className="flex size-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"></span>
        )}
      </Link>
    );
  };

  return (
    <aside className="w-80 bg-white dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 min-h-screen p-6 flex flex-col hidden lg:flex sticky top-0 h-screen font-sans">
      <div className="flex items-center gap-3 mb-8 px-2">
        <img src="/logo.svg" alt="ComuniTarr" className="w-12 h-12 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700" />
        <div>
          <h2 className="text-xl font-black dark:text-white tracking-tight leading-none uppercase">ComuniTarr</h2>
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Vecindario 2.0</span>
        </div>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto pr-2 custom-scrollbar pb-10">
        <div>
          <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('nav_main')}</p>
          <div className="space-y-1">
            <NavItem to="/" label={t('feed')} icon="grid_view" color="primary" />
            <NavItem to="/map" label={t('map')} icon="explore" color="primary" />
            <NavItem to="/announcements" label={t('announcements')} icon="campaign" color="red" hasActivity={true} />
            <NavItem to="/calendar" label={t('calendar')} icon="calendar_today" color="sky" />
            <NavItem to="/neighbors" label={t('neighbors')} icon="waving_hand" color="emerald" />
            <NavItem to="/incidents" label="Incidencias" icon="report_problem" color="red" />
            <NavItem to="/invite" label="Kits de Difusión" icon="campaign" color="orange" />
            <NavItem to="/community-info" label={t('about')} icon="info" color="primary" />
          </div>
        </div>

        <div>
          <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('nav_neighborhood')}</p>
          <div className="space-y-1">
            <div className="relative group">
              <NavItem to="/local-businesses" label={t('local_business')} icon="storefront" color="emerald" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-amber-500 animate-bounce pointer-events-none text-amber-900 uppercase">Ofertas</span>
            </div>
            <NavItem to="/clubs" label={t('clubs')} icon="groups" color="primary" />
            <NavItem to="/forum" label={t('forum')} icon="chat" color="indigo" hasActivity={true} />
            <NavItem to="/workshops" label={t('workshops')} icon="school" color="primary" />
          </div>
        </div>

        <div>
          <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('nav_social')}</p>
          <div className="space-y-1">
            <NavItem to="/challenges" label={t('challenges')} icon="military_tech" color="primary" />
            <NavItem to="/volunteering" label={t('volunteering')} icon="volunteer_activism" color="emerald" />
            <NavItem to="/support" label={t('support')} icon="diversity_1" color="purple" />
            <NavItem to="/stories" label={t('stories')} icon="photo_library" color="orange" />
            <NavItem to="/vital" label={t('vital_care')} icon="favorite" color="red" />
          </div>
        </div>

        <div>
          <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('nav_utils')}</p>
          <div className="space-y-1">
            <NavItem to="/market" label={t('market')} icon="shopping_bag" color="primary" />
            <NavItem to="/services" label={t('mutual_aid')} icon="handshake" color="emerald" />
            <NavItem to="/patrols" label={t('patrols')} icon="shield" color="red" hasActivity={true} />
            <NavItem to="/polls" label={t('polls')} icon="how_to_vote" color="primary" hasActivity={true} />
            <NavItem to="/emergency" label={t('emergency')} icon="emergency" color="red" />
            <NavItem to="/assistant" label={t('assistant')} icon="handshake" color="emerald" />
          </div>
        </div>

        {user?.email === 'nhemesysgonzalez@gmail.com' && (
          <div>
            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Administración</p>
            <div className="space-y-1">
              <NavItem to="/admin" label="Panel de Control" icon="shield_person" color="purple" />
            </div>
          </div>
        )}
      </nav>

      <RadioPlayer />

      <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
        {/* Language Selector */}
        <div className="flex justify-center gap-2">
          {(['es', 'ca', 'en', 'fr'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`text-[10px] font-black uppercase px-2 py-1 rounded-md transition-all ${language === lang ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowNeighborhoods(!showNeighborhoods)}
          className="w-full flex items-center justify-between px-4 py-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-black text-xs dark:text-white border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl">location_on</span>
            <span>{user?.user_metadata?.neighborhood || t('choose_neighborhood')}</span>
          </div>
          <span className={`material-symbols-outlined transition-transform ${showNeighborhoods ? 'rotate-180' : ''}`}>expand_more</span>
        </button>

        {showNeighborhoods && (
          <div className="mt-2 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
            {neighborhoods.map(n => (
              <button key={n} onClick={() => handleNeighborhoodChange(n)} className="w-full text-left px-5 py-3.5 text-xs font-black hover:bg-primary hover:text-white transition-all text-gray-500">
                {n}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 px-2">
          <Link to="/profile" className="relative">
            <img
              src={user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + (user?.user_metadata?.full_name || 'V')}
              className="size-12 rounded-2xl shadow-xl border-2 border-white dark:border-gray-700 object-cover"
              alt="Perfil"
            />
            <span className="absolute -top-1 -right-1 size-4 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full animate-pulse"></span>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black dark:text-white truncate">{user?.user_metadata?.full_name || t('my_profile')}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('active_neighbor')}</p>
          </div>
          <button onClick={() => signOut()} className="size-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
