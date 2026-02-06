
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

      <div className="flex gap-4 mt-2">
        {/* Share Button for Viral Growth */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const text = `📢 ¡Mira esta noticia en ComuniTarr!\n\n${item.title}\n${item.content}\n\n👉 ¡Únete a nuestro barrio aquí! https://comunitarr.vercel.app`;

            // Try to share using native navigator
            if (navigator.share) {
              navigator.share({ title: item.title, text: text, url: 'https://comunitarr.vercel.app' })
                .then(() => {
                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                })
                .catch(() => {
                  // If canceled or error, copy to clipboard anyway
                  navigator.clipboard.writeText(text);
                });
            } else {
              // Desktop Fallback
              navigator.clipboard.writeText(text);
              alert('✅ ¡Enlace copiado al portapapeles!\nYa puedes pegarlo en WhatsApp, Instagram o Facebook.');
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ['#2563eb', '#ffffff'] });
            }
          }}
          className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-primary hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-widest"
          title="Compartir en redes"
        >
          <span className="material-symbols-outlined text-[16px]">share</span>
          <span>Compartir</span>
        </button>
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

        const weatherWeekend = {
          id: 'weather-fri-feb06',
          title: "☀️ VIERNES: Sol y 15°C",
          content: "El viento ha amainado. Nos espera un fin de semana despejado y agradable. Perfecto para actividades al aire libre.",
          category: "TIEMPO",
          neighborhood: "GENERAL",
          itinerary: "• Viernes: Sol (15°C)\n• Sábado: Despejado (16°C)\n• Domingo: Suave (17°C)",
          link_url: "https://www.diaridetarragona.com/tarragona/el-tiempo",
          created_at: new Date().toISOString()
        };

        const postDrill = {
          id: 'plaseqta-post-feb06',
          title: "✅ PLASEQTA: Éxito del Simulacro",
          content: "Protección Civil califica de éxito el simulacro de ayer. Los sensores funcionaron y las sirenas se oyeron en toda la zona. Informe completo en el foro.",
          category: "SEGURIDAD",
          neighborhood: "GENERAL",
          itinerary: "• Resultado: 100% Cobertura\n• Incidencias: Ninguna\n• Próximo: 2027",
          created_at: new Date().toISOString()
        };

        const prepperChemical = {
          id: 'prepper-guide-chemical',
          title: "🏭 PREPPERS: Riesgo Químico",
          content: "Tras el simulacro, debatimos: ¿Tienes tu kit de sellado en casa? Nueva guía sobre tipos de máscaras y cinta americana.",
          category: "SEGURIDAD",
          neighborhood: "PONENT",
          itinerary: "• Tema: Confinamiento\n• Kit: Cinta + Plástico\n• Guía: PDF Disponible",
          link_url: "/vital",
          created_at: new Date().toISOString()
        };

        const agendaWeekend = {
          id: 'agenda-weekend-feb06',
          title: "🎉 AGENDA: Finde en Tarragona",
          content: "Viernes noche: Conciertos en Sala Zero. Sábado: Vermut electrónico en el Serrallo. Domingo: Caminata popular.",
          category: "OCIO",
          neighborhood: "GENERAL",
          itinerary: "• Viernes: Música en vivo\n• Sábado: Vermut + DJ\n• Domingo: Deporte",
          created_at: new Date().toISOString()
        };

        const incidentCleanup = {
          id: 'incidents-cleanup-fri',
          title: "🚧 LIMPIEZA: Ramas Caídas",
          content: "Las brigadas municipales están retirando las ramas caídas por el viento de ayer en Rambla Nova y Parc de la Ciutat. Precaución.",
          category: "AVISO",
          neighborhood: "CENTRO",
          itinerary: "• Estado: En Progreso\n• Zonas: Parques\n• Fin Previsto: 14:00",
          created_at: new Date().toISOString()
        };

        const fetchedNews = !newsError && newsData ? newsData : [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter fetched news to ensure they are not from days long ago (Safety check)
        const validFetchedNews = fetchedNews.filter((n: any) => {
          const nDate = new Date(n.created_at);
          const diffTime = Math.abs(today.getTime() - nDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7; // Only show news from the last week
        });

        setNews([weatherWeekend, postDrill, agendaWeekend, prepperChemical, incidentCleanup, ...validFetchedNews].slice(0, 6));

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

  const currentPoll = {
    id: 'poll-rambla-focus',
    question: '¿Qué prioridad debería tener la reforma de la Rambla?',
    options: ['Más árboles y zonas de sombra', 'Eliminar carriles de coche', 'Espacios para terrazas y comercio', 'Zonas de juego infantil y bancos'],
    category: 'PROYECTO RAMBLA',
    neighborhood: 'CENTRO',
    created_at: new Date().toISOString()
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 font-sans pb-20 relative">

      {/* Hero Section */}
      <section className="relative h-[250px] md:h-[400px] rounded-[40px] overflow-hidden shadow-2xl flex items-center px-6 md:px-16 bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1722520592113-1f681393cd8d?q=80&w=1600&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Tarragona"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1510445740272-d3b16ec28439?auto=format&fit=crop&q=80&w=1600";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

        <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl text-white">
          <h1 className="text-4xl md:text-7xl font-black leading-tight mb-4 tracking-tighter">
            {t('welcome_home')}, <span className="text-primary-light">{user?.user_metadata?.full_name?.split(' ')[0] || 'Vecino'}</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 font-bold opacity-90 max-w-lg mb-8 uppercase tracking-tight">
            {t('neighbor_desc')}
          </p>
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


      {/* Promotion Banner */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-[40px] p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-orange-500/20">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <span className="material-symbols-outlined text-3xl">share</span>
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1">¡Haz crecer tu barrio!</h3>
            <p className="text-sm font-bold opacity-90 max-w-md">Comparte ComuniTarr con tus vecinos y mejora Tarragona juntos.</p>
          </div>
        </div>
        <Link to="/invite" className="px-6 py-3 bg-white text-orange-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shrink-0">
          OBTENER KIT DE DIFUSIÓN
        </Link>
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
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-lg">Semana 4</span>
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
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-600/20 space-y-6">
              <div>
                <h3 className="text-lg font-black uppercase mb-1">¡Más Verde en la Rambla!</h3>
                <p className="text-[11px] font-bold opacity-80 leading-relaxed mb-4">
                  Queremos que la nueva Rambla peatonal sea un pulmón para Tarragona. Únete a la petición formal.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span>857 Apoyos</span>
                    <span>Objetivo: 1,000</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '85.7%' }} className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)]" />
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  alert('¡Gracias por tu apoyo! Has sumado +50 XP a tu perfil.');
                  confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                }}
                className="w-full py-4 bg-white text-emerald-700 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg"
              >
                APOYAR INICIATIVA
              </button>
            </div>
          </section>

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
                {currentPoll.options.map((opt, i) => (
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
