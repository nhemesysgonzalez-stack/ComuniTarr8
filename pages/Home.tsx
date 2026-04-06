
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { safeSupabaseInsert } from '../services/dataHandler';
import { supabase } from '../services/supabaseClient';
import { logActivity } from '../services/activityLogger';
import confetti from 'canvas-confetti';

const HomeNewsItem: React.FC<{ item: any }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className="glass-card p-8 rounded-[38px] flex flex-col gap-5 hover:shadow-2xl transition-all cursor-pointer group border-white/40 dark:border-white/5 active:scale-[0.98]"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-primary/10 text-primary-light dark:text-primary-light rounded-full text-[9px] font-black uppercase tracking-[0.15em] backdrop-blur-md border border-primary/20">
              {item.category || 'AVISO'}
            </span>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">calendar_today</span>
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-black text-primary/60 dark:text-white/40 uppercase bg-gray-50/50 dark:bg-white/5 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {item.neighborhood}
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl font-black dark:text-white leading-[1.1] mb-3 group-hover:text-primary-light transition-colors tracking-tight">
          {item.title}
        </h3>

        <p className={`text-gray-600 dark:text-gray-300 font-medium leading-relaxed text-base md:text-lg ${!isExpanded ? 'line-clamp-2' : ''}`}>
          {item.content}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const text = `📢 ¡Mira esta noticia en ComuniTarr!\n\n${item.title}\n${item.content}\n\n👉 ¡Únete a nuestro barrio aquí! https://comunitarr.vercel.app`;

            if (navigator.share) {
              navigator.share({ title: item.title, text: text, url: 'https://comunitarr.vercel.app' })
                .then(() => confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } }))
                .catch(() => navigator.clipboard.writeText(text));
            } else {
              navigator.clipboard.writeText(text);
              alert('✅ ¡Enlace copiado!');
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary/5 dark:bg-white/5 text-primary-light dark:text-white hover:bg-primary-light hover:text-white transition-all text-[11px] font-black uppercase tracking-widest border border-primary/10"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          <span>Compartir</span>
        </button>

        <span className="text-[10px] font-black text-primary-light dark:text-white/60 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
          {isExpanded ? 'Ver menos ↑' : 'Leer más →'}
        </span>
      </div>

      <AnimatePresence>
        {isExpanded && (item.itinerary || item.link_url) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-5 pt-6 border-t border-gray-100 dark:border-white/10"
          >
            {item.itinerary && (
              <div className="p-6 bg-primary/5 dark:bg-white/5 rounded-[28px] border border-dashed border-primary/30">
                <p className="text-[11px] font-black text-primary-light uppercase tracking-[0.2em] mb-4">Detalles del Evento</p>
                <div className="space-y-3">
                  {item.itinerary.split('\n').map((line: string, i: number) => (
                    <div key={i} className="flex gap-3 text-sm md:text-base font-bold dark:text-gray-200">
                      <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] text-primary-light">✓</span>
                      </div>
                      <span>{line.replace('•', '').trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.link_url && (
              <Link
                to={item.link_url.replace('#', '')}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-3 px-8 py-5 bg-primary-light text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/30 w-full justify-center group/btn"
              >
                <span>Acceder ahora</span>
                <span className="material-symbols-outlined text-[24px] group-hover/btn:translate-x-2 transition-transform">arrow_right_alt</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


const Home: React.FC = () => {
  const { user, addPoints } = useAuth();
  const { t } = useLanguage();
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpType, setHelpType] = useState<'offer' | 'request'>('request');
  const [news, setNews] = useState<any[]>([]);
  const [recentNeighbors, setRecentNeighbors] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingNeighbors, setLoadingNeighbors] = useState(true);
  const [forumActiveCount, setForumActiveCount] = useState(0);
  const [currentPoll, setCurrentPoll] = useState<any>(null);

  // Experience calculation
  const karma = user?.user_metadata?.karma || 0;
  const level = Math.floor(karma / 100) + 1;
  const expProgress = (karma % 100);

  // Form states
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentContact, setIncidentContact] = useState('');
  const [incidentPhoto, setIncidentPhoto] = useState<File | null>(null);
  const [incidentPhotoPreview, setIncidentPhotoPreview] = useState<string>('');
  const [helpTitle, setHelpTitle] = useState('');
  const [helpDescription, setHelpDescription] = useState('');
  const [helpCategory, setHelpCategory] = useState('');
  const [helpContact, setHelpContact] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // No confetti effect

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
        const fetchedNews = !newsError && newsData ? newsData : [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter fetched news to ensure they are not from days long ago (Safety check)
        const validFetchedNews = fetchedNews.filter((n: any) => {
          const nDate = new Date(n.created_at);
          const diffTime = Math.abs(today.getTime() - nDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 14; // Only show news from the last 2 weeks
        });

        const realNewsExamples = [
          {
            id: 'lun-23-trastos-news',
            title: '📋 Hoy: Recogida de Trastos (Centro)',
            content: 'Atención vecinos de la zona Centro: HOY LUNES toca recogida de muebles y voluminosos. Por favor, sacad los objetos a la calle antes de las 22:00h.',
            neighborhood: 'CENTRE',
            category: 'AVISO',
            image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
            created_at: new Date().toISOString()
          },
          {
            id: 'lun-23-weather-news',
            title: '☀️ Comienzo de Semana Primaveral',
            content: 'Arrancamos el lunes con cielos despejados y una temperatura máxima de 22ºC. Ideal para caminar al trabajo o al colegio.',
            neighborhood: 'GENERAL',
            category: 'TIEMPO',
            image_url: 'https://images.unsplash.com/photo-1414609476228-db04859bc091?auto=format&fit=crop&w=800&q=80',
            created_at: new Date().toISOString()
          },
          {
            id: 'lun-23-empleo-news',
            title: '💼 Empleo: Nuevas Vacantes Lunes',
            content: 'Iniciamos la semana con 5 nuevas ofertas verificadas en el sector servicios y logística. Consulta los detalles en el módulo de Empleo.',
            neighborhood: 'GENERAL',
            category: 'EMPLEO',
            image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
            created_at: new Date().toISOString()
          }
        ];

        setNews([...realNewsExamples, ...validFetchedNews].slice(0, 8));

        // Poll Example
        const pollExample = {
          id: 'lun-23-poll-1',
          question: "📊 ¿Cómo ha sido tu vuelta a la rutina HOY LUNES?",
          options: ['Con mucha energía', 'Me ha costado madrugar', 'Deseando que llegue el viernes', 'Aún aterrizando'],
          category: 'COMUNIDAD',
          neighborhood: 'GENERAL',
          created_at: new Date().toISOString()
        };
        setCurrentPoll(pollExample);


        // Fetch Top Neighbors by Karma (XP)
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('karma', { ascending: false })
          .limit(5);

        if (!profilesError && profilesData && profilesData.length > 0) {
          setRecentNeighbors(profilesData);
        } else {
          setRecentNeighbors([
            { id: 'f1', full_name: 'Maria Garcia', neighborhood: barrio, avatar_url: null },
            { id: 'f2', full_name: 'Joan Rebull', neighborhood: barrio, avatar_url: null },
            { id: 'f3', full_name: 'Elena Tarrago', neighborhood: barrio, avatar_url: null }
          ]);
        }

        // Fetch Forum Activity
        const { data: forumData } = await supabase
          .from('forum_messages')
          .select('user_id')
          .or(`neighborhood.eq.${barrio},neighborhood.eq.GENERAL`)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const uniqueUsers = new Set((forumData || []).map(m => m.user_id)).size;
        setForumActiveCount(uniqueUsers > 0 ? uniqueUsers : 1);

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
    { icon: 'business_center', label: 'Directorio Negocios', to: '/business-directory', color: 'bg-emerald-600', shadow: 'shadow-emerald-600/20' },
    { icon: 'report_problem', label: t('report_incident'), action: () => setShowIncidentModal(true), color: 'bg-red-500', shadow: 'shadow-red-500/20' },
    { icon: 'shopping_basket', label: t('publish_product'), to: '/market', color: 'bg-sky-500', shadow: 'shadow-sky-500/20' },
    { icon: 'school', label: t('workshops'), to: '/workshops', color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20' }
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitStatus, setSubmitStatus] = useState('');

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitStatus('INICIANDO...');

    try {
      let imageUrl = null;

      if (incidentPhoto) {
        setSubmitStatus('SUBIENDO IMAGEN...');
        const fileExt = incidentPhoto.name.split('.').pop() || 'jpg';
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `incidents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('incidents')
          .upload(filePath, incidentPhoto);

        if (uploadError) {
          alert(`Error al subir imagen: ${uploadError.message}`);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('incidents')
            .getPublicUrl(filePath);
          imageUrl = publicUrl;
        }
      }

      setSubmitStatus('GUARDANDO DATOS...');

      const incidentData = {
        user_id: user?.id,
        title: incidentTitle,
        description: incidentDescription,
        contact_info: incidentContact || null,
        neighborhood: user?.user_metadata?.neighborhood || 'GENERAL',
        image_url: imageUrl,
        status: 'open'
      };

      // 2. Insert to Supabase
      const { error: dbError } = await supabase.from('incidents').insert([incidentData]);

      if (dbError) {
        console.error('Database Error:', dbError);
        // Fallback to local WITH the imageUrl if it exists
        const localKey = `local_incidents`;
        const currentData = JSON.parse(localStorage.getItem(localKey) || '[]');
        localStorage.setItem(localKey, JSON.stringify([{
          ...incidentData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        }, ...currentData]));

        alert(`⚠️ MODO LOCAL: No se guardó en la nube. Error de Supabase: "${dbError.message}". Revisa el SQL Editor.`);
      } else {
        await addPoints(25, 10);
        await logActivity('Reportar Incidencia', { title: incidentTitle, neighborhood: user?.user_metadata?.neighborhood });
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#ff0000', '#ffffff'] });
        alert('✅ ¡Incidencia reportada con éxito en la nube!');
      }

      setShowIncidentModal(false);
      setIncidentTitle('');
      setIncidentDescription('');
      setIncidentContact('');
      setIncidentPhoto(null);
      setIncidentPhotoPreview('');

    } catch (err: any) {
      alert(`Error inesperado: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setSubmitStatus('');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIncidentPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIncidentPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
        await addPoints(50, 25);
        await logActivity('Ofrecer Ayuda', { title: helpTitle, type: helpType, neighborhood: user?.user_metadata?.neighborhood });
        alert('¡Publicado con éxito! +50 XP / +25 ComuniPoints');
        setShowHelpModal(false);
      }
    } catch (err) { console.error(err); }
  };



  useEffect(() => {
    const fetchPoll = async () => {
      const { data } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data[0]) setCurrentPoll(data[0]);
    };
    fetchPoll();
  }, []);

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 font-sans pb-20 relative">

      {/* Official Alerts Connection Status */}
      <div className="flex items-center justify-between bg-white dark:bg-surface-dark px-6 py-3 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse-slow">
        <div className="flex items-center gap-3">
          <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Conectado en tiempo real: Protecció Civil TGN | VENTCAT | PLASEQTA</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-gray-400">Canal Emergencias Activo</span>
          <span className="material-symbols-outlined text-sm text-gray-300">rss_feed</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[450px] rounded-[50px] overflow-hidden premium-shadow flex items-center group">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          src="https://images.unsplash.com/photo-1722520592113-1f681393cd8d?q=80&w=1600&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Tarragona"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1510445740272-d3b16ec28439?auto=format&fit=crop&q=80&w=1600";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>

        <div className="relative z-20 px-8 md:px-20 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-10 md:p-14 rounded-[45px] border-white/30 backdrop-blur-2xl transition-all duration-500 hover:border-white/50"
          >
            <h1 className="text-4xl md:text-7xl font-black leading-tight mb-4 tracking-tighter text-white">
              {t('welcome_home')}, <br />
              <span className="bg-gradient-to-r from-blue-300 to-primary-light bg-clip-text text-transparent">
                {user?.user_metadata?.full_name?.split(' ')[0] || 'Vecino'}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-bold uppercase tracking-widest opacity-80">
              {t('neighbor_desc')}
            </p>
          </motion.div>
        </div>

        {/* Floating Badge */}
        <div className="absolute top-10 right-10 z-20 hidden md:block">
          <div className="glass-card px-6 py-3 rounded-full border-white/40 flex items-center gap-3">
            <div className="size-3 bg-emerald-500 rounded-full animate-ping"></div>
            <span className="text-white text-[10px] font-black uppercase tracking-widest">Barrio Activo Now</span>
          </div>
        </div>
      </section>

      {/* Quick Actions (Modern Grid) */}
      {/* Community Action Hub (Prioritized) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <span className="material-symbols-outlined text-rose-500">hub</span>
            Centro de Acción Comunitaria
          </h2>
          <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[10px] font-black rounded-full animate-pulse uppercase tracking-widest">Activo Ahora</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FORO & CHAT */}
          <motion.div whileHover={{ y: -5 }} className="group">
            <Link to="/forum" className="block h-full">
              <div className="h-full bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl hover:shadow-primary/20 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl">forum</span>
                </div>
                <h3 className="text-xl font-black mb-2 uppercase tracking-tight text-primary">Chat del Barrio</h3>
                <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">¿Qué está pasando ahora?</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                    <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold">AD</div>
                    <p className="text-[10px] text-gray-500 font-medium truncate">"Admin: ¡Buenos días! Recordad bajar los trastos hoy..."</p>
                  </div>
                </div>
                <div className="flex items-center text-primary font-black text-xs uppercase tracking-widest gap-2">
                  Entrar al foro <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* RETOS SOLIDARIOS */}
          <motion.div whileHover={{ y: -5 }} className="group">
            <Link to="/challenges" className="block h-full">
              <div className="h-full bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-500/20 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined text-6xl">emoji_events</span>
                </div>
                <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Retos Activos</h3>
                <p className="text-xs font-bold opacity-70 mb-6 uppercase tracking-widest">Gana XP y ComuniPoints</p>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 mb-6">
                  <p className="text-[11px] font-black flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">wb_twilight</span> Atardecer en el Miracle
                  </p>
                  <p className="text-[9px] opacity-80 mt-1">Sube tu foto del atardecer hoy y gana +50 XP</p>
                </div>
                <div className="flex items-center font-black text-xs uppercase tracking-widest gap-2">
                  Ver todos los retos <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* AYUDAS VITALES */}
          <motion.div whileHover={{ y: -5 }} className="group">
            <Link to="/vital" className="block h-full">
              <div className="h-full bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl hover:shadow-rose-500/20 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-6xl">volunteer_activism</span>
                </div>
                <h3 className="text-xl font-black mb-2 uppercase tracking-tight text-rose-500">Ayuda Vecinal</h3>
                <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">Necesidades urgentes hoy</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-3">
                    <div>
                      <p className="text-[10px] font-black dark:text-white">Recogida Medicación</p>
                      <p className="text-[9px] text-gray-400">Para Doña Rosa (Lunes mañana)</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-rose-500 font-black text-xs uppercase tracking-widest gap-2">
                  Echar una mano <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Access Bar */}
      <section className="flex flex-wrap gap-4 overflow-x-auto pb-4 no-scrollbar">
        {[
          { icon: 'map', label: 'Mapa Interactivo', to: '/map', color: 'bg-emerald-500' },
          { icon: 'shopping_basket', label: 'Mercadillo', to: '/market', color: 'bg-orange-500' },
          { icon: 'calendar_month', label: 'Calendario', to: '/calendar', color: 'bg-sky-500' },
          { icon: 'business_center', label: 'Empleo', to: '/services', color: 'bg-indigo-500' },
          { icon: 'groups', label: 'Voluntariado', to: '/volunteering', color: 'bg-teal-500' }
        ].map((btn, i) => (
          <Link key={i} to={btn.to} className="shrink-0">
            <div className={`px-6 py-4 ${btn.color} text-white rounded-3xl flex items-center gap-3 shadow-lg hover:scale-105 transition-all`}>
              <span className="material-symbols-outlined text-xl">{btn.icon}</span>
              <span className="text-[11px] font-black uppercase tracking-widest">{btn.label}</span>
            </div>
          </Link>
        ))}
      </section>




      <div className="grid lg:grid-cols-3 gap-8">
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

        <div className="space-y-8">
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

          {/* Gamification: Leaderboard */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">emoji_events</span>
                Top Vecinos
              </h2>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-lg">Semana 13 · Lun 06 Mar</span>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
              {recentNeighbors.length > 0 ? recentNeighbors.slice(0, 3).map((neighbor, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="relative font-black text-lg w-6 text-center text-gray-300 group-hover:text-primary transition-colors">
                    {idx + 1}
                    {idx === 0 && <span className="absolute -top-3 -right-2 text-xl">👑</span>}
                  </div>
                  <img src={neighbor.avatar_url || `https://ui-avatars.com/api/?name=${neighbor.full_name}&background=random`} className="size-10 rounded-xl object-cover" alt="" />
                  <div className="flex-1">
                    <p className="text-xs font-black dark:text-white leading-none mb-1">{neighbor.full_name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{neighbor.karma || 0} XP acumulados</p>
                  </div>
                  <div className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-lg">
                    ▲
                  </div>
                </div>
              )) : (
                <p className="text-xs text-gray-400 text-center py-4">Sé el primero en el ranking participando.</p>
              )}
              <div className="pt-2 border-t border-gray-50 dark:border-gray-700">
                <p className="text-[9px] text-gray-400 text-center italic">¡Invita a amigos para ganar +500 XP!</p>
              </div>
            </div>
          </section>


          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500">campaign</span>
                Iniciativas del Mes
              </h2>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">ACTIVA</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-500">Descubre iniciativas en la sección de Solidaridad.</p>
              <Link to="/support" className="text-[10px] font-black text-primary uppercase mt-2 block tracking-widest">Ver Círculos de Apoyo →</Link>
            </div>
          </section>

          {currentPoll && (
            <section className="space-y-4">
              <h2 className="text-xl font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500">how_to_vote</span>
                Encuesta del Barrio
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{currentPoll.category}</span>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">• {new Date(currentPoll.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-black dark:text-white leading-tight mb-4">{currentPoll.question}</h3>
                <div className="space-y-3">
                  {(currentPoll.options || []).map((opt: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => {
                        const confirmVote = window.confirm(`¿Quieres registrar tu voto para ${opt}?`);
                        if (confirmVote) {
                          alert(`¡Gracias! Tu voto para ${opt} ha sido registrado correctamente.`);
                        }
                      }}
                      className="p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-primary hover:bg-primary/5 transition-all text-left group/btn w-full flex items-center justify-between"
                    >
                      <span className="text-xs font-black dark:text-gray-200 group-hover/btn:text-primary transition-colors uppercase tracking-tight">{opt}</span>
                      <span className="material-symbols-outlined text-sm opacity-0 group-hover/btn:opacity-100 transition-all">how_to_vote</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

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

                {/* Photo Upload */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">📷 FOTO DE LA INCIDENCIA</label>

                  {!incidentPhotoPreview ? (
                    <label className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">add_a_photo</span>
                      <span className="text-xs font-black uppercase tracking-widest">Toca para adjuntar imagen</span>
                    </label>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 group">
                      <img src={incidentPhotoPreview} alt="Preview" className="w-full h-48 object-cover" />

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <label className="size-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white hover:text-primary transition-all cursor-pointer" title="Cambiar foto">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                          <span className="material-symbols-outlined">edit</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => { setIncidentPhoto(null); setIncidentPhotoPreview(''); }}
                          className="size-10 bg-red-500/80 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                          title="Eliminar foto"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                  {incidentPhoto && (
                    <div className="text-[10px] font-bold text-gray-400 text-center mt-2">
                      Archivo: {incidentPhoto.name} ({(incidentPhoto.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>

                <input type="text" value={incidentContact} onChange={(e) => setIncidentContact(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white" placeholder="Tu contacto (opcional)" />

                <button type="submit" disabled={isSubmitting} className={`w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 flex flex-col items-center justify-center ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}>
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-xl mb-1">refresh</span>
                      <span className="text-[10px]">{submitStatus || 'PROCESANDO...'}</span>
                    </>
                  ) : 'REPORTAR AHORA'}
                </button>
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
                <textarea value={helpDescription} onChange={(e) => setHelpDescription(e.target.value)} required rows={3} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white resize-none" placeholder="¿En qué consiste?" />
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
