
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { safeSupabaseInsert } from '../services/dataHandler';
import { supabase } from '../services/supabaseClient';

const Home: React.FC = () => {
  const { user, addKarma } = useAuth();
  const { t } = useLanguage();
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpType, setHelpType] = useState<'offer' | 'request'>('request');
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // Experience calculation
  const karma = user?.user_metadata?.karma || 0;
  const level = Math.floor(karma / 100) + 1;
  const expProgress = (karma % 100);

  // Form states
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentContact, setIncidentContact] = useState('');
  const [helpTitle, setHelpTitle] = useState('');
  const [helpDescription, setHelpDescription] = useState('');
  const [helpCategory, setHelpCategory] = useState('');
  const [helpContact, setHelpContact] = useState('');

  // Fetch real news from Supabase
  useEffect(() => {
    const fetchNews = async () => {
      setLoadingNews(true);
      const barrio = user?.user_metadata?.neighborhood || 'GENERAL';
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .or(`neighborhood.eq.${barrio},neighborhood.eq.GENERAL`)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) setNews(data);
      setLoadingNews(false);
    };

    fetchNews();
  }, [user?.user_metadata?.neighborhood]);

  const quickActions = [
    { icon: 'report_problem', label: t('report_incident'), action: () => setShowIncidentModal(true), color: 'bg-red-500', shadow: 'shadow-red-500/20' },
    { icon: 'shopping_basket', label: t('publish_product'), to: '/market', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
    { icon: 'event_available', label: t('create_event'), to: '/calendar', color: 'bg-sky-500', shadow: 'shadow-sky-500/20' },
    { icon: 'diversity_3', label: t('ask_offer_help'), action: () => setShowHelpModal(true), color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20' }
  ];

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { success } = await safeSupabaseInsert('incidents', {
        user_id: user?.id,
        title: incidentTitle,
        description: incidentDescription,
        contact_info: incidentContact,
        neighborhood: user?.user_metadata?.neighborhood || 'GENERAL',
        status: 'open'
      });
      if (success) {
        await addKarma(25);
        alert('¡Incidencia reportada! +25 XP');
        setShowIncidentModal(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { success } = await safeSupabaseInsert('services', {
        user_id: user?.id,
        type: helpType,
        title: helpTitle,
        description: helpDescription,
        category: helpCategory,
        contact_info: helpContact,
        neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
      });
      if (success) {
        await addKarma(15);
        alert('¡Publicado con éxito! +15 XP');
        setShowHelpModal(false);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 font-sans pb-20">
      {/* Hero */}
      <section className="relative h-[250px] md:h-[400px] rounded-[40px] overflow-hidden shadow-2xl group flex items-center px-6 md:px-16">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
        <img src="https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover" alt="Tarragona" />
        <div className="relative z-20 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
            {t('welcome_home')}, <span className="text-primary-light">{user?.user_metadata?.full_name?.split(' ')[0] || 'Vecino'}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 opacity-90">{t('neighbor_desc')}</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {quickActions.map((action, i) => (
          action.to ? (
            <Link key={i} to={action.to} className="group">
              <div className={`p-6 rounded-[32px] ${action.color} ${action.shadow} text-white transition-all duration-300 hover:scale-105 hover:-translate-y-2 h-full shadow-lg`}>
                <span className="material-symbols-outlined text-4xl mb-4 block group-hover:rotate-12 transition-transform">{action.icon}</span>
                <span className="text-lg font-bold leading-tight block">{action.label}</span>
              </div>
            </Link>
          ) : (
            <button key={i} onClick={action.action} className="group text-left h-full">
              <div className={`p-6 rounded-[32px] ${action.color} ${action.shadow} text-white transition-all duration-300 hover:scale-105 hover:-translate-y-2 h-full shadow-lg`}>
                <span className="material-symbols-outlined text-4xl mb-4 block group-hover:rotate-12 transition-transform">{action.icon}</span>
                <span className="text-lg font-bold leading-tight block">{action.label}</span>
              </div>
            </button>
          )
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Real News Feed */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">newspaper</span>
              {t('news_from')} {user?.user_metadata?.neighborhood || 'Tarragona'}
            </h2>
          </div>

          <div className="space-y-4">
            {loadingNews ? (
              <div className="bg-gray-100 animate-pulse h-40 rounded-3xl"></div>
            ) : news.length > 0 ? (
              news.map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 flex gap-6 hover:shadow-md transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">{item.category || 'AVISO'}</span>
                      <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{item.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-10 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-700 text-center space-y-4">
                <span className="material-symbols-outlined text-6xl text-gray-300">campaign</span>
                <p className="text-gray-500 font-medium">No hay noticias recientes en tu barrio.<br />¡Publica la primera información!</p>
                <Link to="/announcements" className="inline-flex py-3 px-6 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all">Publicar noticia</宣传Link>
              </div>
            )}
          </div>
        </section>

        {/* Level Widget */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black">{t('your_progress')}</h2>
          <div className="bg-gradient-to-br from-primary to-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-sm font-bold opacity-80 uppercase tracking-widest">{t('level')}</span>
                  <div className="text-5xl font-black">{level}</div>
                </div>
                <div className="size-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl tracking-tighter">stars</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>{karma} XP</span>
                  <span className="opacity-80">{100 - expProgress} XP para Niv. {level + 1}</span>
                </div>
                <div className="h-4 bg-white/20 rounded-full overflow-hidden p-1">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${expProgress}%` }} className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modals for Incident and Help would go here (same logic as before) */}
    </div>
  );
};

export default Home;
