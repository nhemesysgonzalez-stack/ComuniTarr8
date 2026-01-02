
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { safeSupabaseInsert } from '../services/dataHandler';
import { supabase } from '../services/supabaseClient';

const HomeNewsItem: React.FC<{ item: any }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className="bg-white dark:bg-gray-800 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4 hover:shadow-md transition-all cursor-pointer group"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{item.category || 'AVISO'}</span>
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">• {new Date(item.created_at).toLocaleDateString()}</span>
          <span className="flex items-center gap-0.5 text-[9px] font-black text-primary/50 uppercase">
            <span className="material-symbols-outlined text-[12px]">location_on</span>
            {item.neighborhood}
          </span>
        </div>
        <h3 className="text-xl font-black dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
        <p className={`text-gray-600 dark:text-gray-400 font-medium leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
          {item.content}
        </p>
      </div>

      <AnimatePresence>
        {isExpanded && (item.itinerary || item.link_url) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            {item.itinerary && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-primary/20">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Itinerario / Detalles</p>
                <div className="space-y-2">
                  {item.itinerary.split('\n').map((line: string, i: number) => (
                    <div key={i} className="flex gap-2 text-xs font-bold dark:text-gray-300">
                      <span className="text-primary">•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {item.link_url && (
              <a
                href={item.link_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 w-full justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                Ver noticia oficial
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between text-[10px] font-black text-primary uppercase tracking-widest mt-2">
        <span className="group-hover:translate-x-1 transition-transform">{isExpanded ? 'Ver menos ↑' : 'Leer más →'}</span>
      </div>
    </div>
  );
};

const DynamicThemeEffects: React.FC = () => {
  const currentMonth = new Date().getMonth(); // 0 = Jan
  const currentDay = new Date().getDate();

  // Three Kings (Jan 1-6)
  const isThreeKings = currentMonth === 0 && currentDay <= 6;

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {isThreeKings && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100vw' }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 left-0 flex items-end gap-10 opacity-30 dark:opacity-20"
        >
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-amber-500">bedroom_baby</span>
            <div className="w-20 h-1 bg-amber-500/20 rounded-full blur-sm"></div>
          </div>
          <div className="flex flex-col items-center scale-125 mb-4">
            <span className="material-symbols-outlined text-7xl text-amber-600">person_celebrate</span>
            <div className="w-24 h-1 bg-amber-600/20 rounded-full blur-sm"></div>
          </div>
          <div className="flex flex-col items-center mb-2">
            <span className="material-symbols-outlined text-6xl text-amber-500">auto_awesome</span>
            <div className="w-20 h-1 bg-amber-500/20 rounded-full blur-sm"></div>
          </div>
        </motion.div>
      )}

      {/* Subtle Starry Night Effect for Jan */}
      {currentMonth === 0 && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.1 }}
              animate={{ opacity: [0.1, 0.5, 0.1] }}
              transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
              className="absolute bg-white rounded-full"
              style={{
                width: Math.random() * 3 + 'px',
                height: Math.random() * 3 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Home: React.FC = () => {
  const { user, addKarma } = useAuth();
  const { t } = useLanguage();
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpType, setHelpType] = useState<'offer' | 'request'>('request');
  const [news, setNews] = useState<any[]>([]);
  const [recentNeighbors, setRecentNeighbors] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingNeighbors, setLoadingNeighbors] = useState(true);

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

  // Hero Image Selection (Dynamic)
  const heroImage = "https://images.unsplash.com/photo-1514774619374-278a2e519217?auto=format&fit=crop&q=80&w=1600"; // Stunning Tarragona Amphitheater

  // Fetch real news and recent neighbors from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoadingNews(true);
      setLoadingNeighbors(true);
      try {
        const barrio = user?.user_metadata?.neighborhood || 'GENERAL';

        // Fetch News
        const { data: newsData, error: newsError } = await supabase
          .from('announcements')
          .select('*')
          .or(`neighborhood.eq.${barrio},neighborhood.eq.GENERAL`)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!newsError && newsData) setNews(newsData);

        // Fetch Recent Neighbors
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('neighborhood', barrio)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!profilesError && profilesData && profilesData.length > 0) {
          setRecentNeighbors(profilesData);
        } else {
          console.log('Using fallback for neighbors');
          setRecentNeighbors([
            { id: 'f1', full_name: 'Maria Garcia', neighborhood: barrio, avatar_url: null },
            { id: 'f2', full_name: 'Joan Rebull', neighborhood: barrio, avatar_url: null },
            { id: 'f3', full_name: 'Elena Tarrago', neighborhood: barrio, avatar_url: null }
          ]);
        }
      } catch (e) {
        console.error('Error fetching Home data:', e);
      } finally {
        setLoadingNews(false);
        setLoadingNeighbors(false);
      }
    };

    fetchData();
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
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 font-sans pb-20 relative">
      <DynamicThemeEffects />
      {/* Hero */}
      <section className="relative h-[250px] md:h-[400px] rounded-[40px] overflow-hidden shadow-2xl group flex items-center px-6 md:px-16">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
        <img src={heroImage} className="absolute inset-0 w-full h-full object-cover" alt="Tarragona" />
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
                <HomeNewsItem key={item.id || i} item={item} />
              ))
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-10 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-700 text-center space-y-4">
                <span className="material-symbols-outlined text-6xl text-gray-300">campaign</span>
                <p className="text-gray-500 font-medium">No hay noticias recientes en tu barrio.<br />¡Publica la primera información!</p>
                <Link to="/announcements" className="inline-flex py-3 px-6 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all">Publicar noticia</Link>
              </div>
            )}
          </div>
        </section>

        {/* Side widgets */}
        <div className="space-y-8">
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

          {/* New Neighbors Widget */}
          <section className="space-y-4">
            <h2 className="text-xl font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">waving_hand</span>
              Nuevos Vecinos
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4 min-h-[200px] flex flex-col justify-center">
              {loadingNeighbors ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-12 bg-gray-100 rounded-2xl w-full"></div>
                  <div className="h-12 bg-gray-100 rounded-2xl w-full"></div>
                </div>
              ) : recentNeighbors && recentNeighbors.length > 0 ? (
                recentNeighbors.map((n, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={n.id || i}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-all group"
                  >
                    <img src={n.avatar_url || `https://ui-avatars.com/api/?name=${n.full_name || 'V'}`} className="size-10 rounded-xl object-cover" alt="V" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black dark:text-white truncate">{n.full_name || 'Nuevo Vecino'}</p>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">{n.neighborhood || 'Tarragona'}</p>
                    </div>
                    <Link
                      to="/forum"
                      className="text-[10px] text-primary font-black px-3 py-1.5 bg-primary/10 rounded-lg hover:bg-primary hover:text-white transition-all transform hover:scale-110"
                    >
                      HOLA
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6 opacity-40">
                  <span className="material-symbols-outlined text-4xl mb-2">group_off</span>
                  <p className="text-[10px] font-black uppercase tracking-widest">Sin vecinos nuevos</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showIncidentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowIncidentModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Reportar Incidencia</h3>
                <button onClick={() => setShowIncidentModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleIncidentSubmit} className="space-y-4">
                <input type="text" value={incidentTitle} onChange={(e) => setIncidentTitle(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white" placeholder="¿Qué ha pasado?" />
                <textarea value={incidentDescription} onChange={(e) => setIncidentDescription(e.target.value)} required rows={3} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white resize-none" placeholder="Describe los detalles..." />
                <input type="text" value={incidentContact} onChange={(e) => setIncidentContact(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white" placeholder="Tu contacto (opcional)" />
                <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">REPORTAR AHORA</button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showHelpModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowHelpModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Pedir u Ofrecer Ayuda</h3>
                <button onClick={() => setShowHelpModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex gap-4 mb-6">
                <button onClick={() => setHelpType('request')} className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${helpType === 'request' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>Necesito Ayuda</button>
                <button onClick={() => setHelpType('offer')} className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${helpType === 'offer' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>Quiero Ayudar</button>
              </div>
              <form onSubmit={handleHelpSubmit} className="space-y-4">
                <input type="text" value={helpTitle} onChange={(e) => setHelpTitle(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white" placeholder="Título corto..." />
                <textarea value={helpDescription} onChange={(e) => setHelpDescription(e.target.value)} required rows={3} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white resize-none" placeholder="¿En qué consistee?" />
                <button type="submit" className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg ${helpType === 'request' ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-emerald-600 text-white shadow-emerald-500/20'}`}>PUBLICAR ANUNCIO</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
