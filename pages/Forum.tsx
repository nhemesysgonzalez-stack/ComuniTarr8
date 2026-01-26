
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';
import { logActivity } from '../services/activityLogger';
import { getAssistantResponse } from '../services/geminiService';

interface Message {
  id: string;
  user_id: string;
  content: string;
  user_metadata: {
    full_name: string;
    avatar_url?: string;
  };
  neighborhood: string;
  created_at: string;
}

const NEIGHBORHOODS = [
  'GENERAL',
  'PART ALTA',
  'EIXAMPLE',
  'BARRIS MARÍTIMS',
  'LLEVANT',
  'PONENT',
  'NORD',
  'EL SERRALLO'
];

// Audio assets shared across component instances
const msgSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
const buzzSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1344/1344-preview.mp3');
msgSound.volume = 0.3;
buzzSound.volume = 0.5;

// Function to unlock audio context (call on user interaction)
const unlockAudio = () => {
  msgSound.play().then(() => {
    msgSound.pause();
    msgSound.currentTime = 0;
  }).catch(() => { });

  buzzSound.play().then(() => {
    buzzSound.pause();
    buzzSound.currentTime = 0;
  }).catch(() => { });
};

const Forum: React.FC = () => {
  const { user, addPoints } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = React.useTransition();
  const [currentNeighborhood, setCurrentNeighborhood] = useState(user?.user_metadata?.neighborhood || 'GENERAL');
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [showJobOffers, setShowJobOffers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [adminActivities, setAdminActivities] = useState<any[]>([]);
  const isAdmin = user?.email === 'nhemesysgonzalez@gmail.com';

  const tickerMessages = [
    { user: 'ComuniTarr 📢', text: '📻 ¡Novedad! Ya puedes escuchar Tarragona Ràdio en directo desde el menú lateral.' },
    { user: 'Pau T.', text: 'Primer café del lunes... ¡Ánimo con la semana! Que no se os olvide el paraguas 🌧️☕' },
    { user: 'Mireia R.', text: 'Mucho tráfico hoy en la entrada por la T-11, paciencia conductores 🚗😤' },
    { user: 'Joan B.', text: '¿Algún sitio abierto para desayunar por la Rambla que sea rápido? 🥐🥖' },
    { user: 'Carme S.', text: 'Lunes de planificación. Recordad que han abierto inscripciones para el Metropol 🎭' },
    { user: 'Luis M.', text: 'Cielo muy gris, parece que va a caer una buena a mediodía ☁️🌧️' }
  ];

  // Virtual Neighbors for Simulation
  const virtualNeighbors = [
    { id: 'v1', full_name: 'Pau T.', avatar_url: 'https://i.pravatar.cc/150?u=pau', status: 'online' },
    { id: 'v2', full_name: 'Mireia R.', avatar_url: 'https://i.pravatar.cc/150?u=mireia', status: 'busy' },
    { id: 'v3', full_name: 'Joan B.', avatar_url: 'https://i.pravatar.cc/150?u=joan', status: 'online' },
    { id: 'v4', full_name: 'Carme S.', avatar_url: 'https://i.pravatar.cc/150?u=carme', status: 'away' },
    { id: 'v5', full_name: 'Luis M.', avatar_url: 'https://i.pravatar.cc/150?u=luis', status: 'online' },
    { id: 'v6', full_name: 'Joe R.', avatar_url: 'https://i.pravatar.cc/150?u=joe', status: 'online' },
    { id: 'v7', full_name: 'Maria G.', avatar_url: 'https://i.pravatar.cc/150?u=maria', status: 'busy' }
  ];

  const handleReply = (name: string) => {
    setNewMessage(`@${name} `);
    inputRef.current?.focus();
  };

  // Simulation Logic: Seed messages about today Monday 19th morning
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      // 15% chance of a virtual message every 40s if no real activity
      if (Math.random() < 0.15) {
        generateVirtualMessage();
      }
    }, 40000);

    return () => clearInterval(simulationInterval);
  }, []);

  // Admin Insights Fetching
  useEffect(() => {
    if (isAdmin) {
      fetchAdminInsights();
      const channel = supabase.channel('admin_activity')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, () => {
          fetchAdminInsights();
        }).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [isAdmin]);

  const fetchAdminInsights = async () => {
    const { data } = await supabase
      .from('activity_logs')
      .select('*, profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(15);
    setAdminActivities(data || []);
  };

  const generateVirtualMessage = async (isReplyTo?: string, originalPrompt?: string, isChain?: boolean) => {
    // Broaden keywords for the Mediador
    const p = originalPrompt?.toLowerCase() || "";
    const isAssistant = isReplyTo && (
      p.includes('ayuda') ||
      p.includes('como') ||
      p.includes('qué') ||
      p.includes('que hago') ||
      p.includes('hacer') ||
      p.includes('saber') ||
      p.includes('@mediador') ||
      p.includes('pregunt') ||
      p.includes('llov') ||
      p.includes('tiempo')
    );

    // Choose neighbor (Mediador has priority for technical stuff)
    const neighbor = isAssistant
      ? { id: 'v-ai', full_name: 'Mediador Vecinal ⚖️', avatar_url: 'https://img.icons8.com/isometric/512/scales.png', status: 'online' }
      : virtualNeighbors[Math.floor(Math.random() * virtualNeighbors.length)];

    let scripts = [
      "¡Buenos días! Empezamos semana con ganas y mucho café ☕💪.",
      "Ojo que en la A-7 hay un poco de lío a la altura de la entrada centro. 🚗⚠️",
      "¿Sabemos si hoy lloverá mucho? He visto el cielo muy cerrado hacia el puerto. 🌧️",
      "Lunes de volver a la oficina. ¡Qué corto se me ha hecho el finde! 😅",
      "Reunión esta tarde sobre el proyecto de la Rambla Nova, ¡hay que ir! 🤝",
      "He visto que esta mañana reforzaban la línea escolar de buses, buena falta hacía. 🚌",
      "¿Alguna oferta de trabajo nueva para esta semana? Me paso por el canal empleo. 💼",
      "Café y a por el lunes. ¡Cuidado con los charcos que se van a montar! 🌂",
      "Ánimo vecinos, ¡que el viernes llega en nada! (o eso dicen) 😂✨"
    ];

    if (currentNeighborhood === 'EMPLEO') {
      scripts = [
        "He visto oferta de Operario de Lavandería en Constantí (Randstad). Urgente. 🧺",
        "Buscan Administrativo Logístico en Tarragona ciudad. Jornada completa. 📑",
        "En Reus necesitan Carretilleros (Eurofirms). Turnos rotativos. 📦",
        "Oferta de Ayudante de Camarero para fines de semana en el centro (Job Today). ☕",
        "Se busca Repartidor con carnet B para paquetería en Tarragona. 🚚",
        "Buscan recepcionista de noche con inglés para hotel en Llevant. 🏨",
        "¿Alguien con título para cuidar mayores? Hay vacante en residencia TGN. 👵",
        "En el Polígono Riu Clar buscan mozos de almacén para campaña. 🏭",
        "¿Sabéis si en el Port Aventura ya están contratando para la nueva temporada? 🎢",
        "He visto carteles de 'Se Busca Personal' en varias tiendas del Parc Central. 🛍️"
      ];
    }
    else if (currentNeighborhood === 'ENCUENTROS') {
      scripts = [
        "Soy nuevo en el barrio y me encantaría conocer gente para ir a caminar por la playa. 🏖️",
        "¿Algún soltero/a que se anime a ir al teatro el próximo fin de semana? 🎭",
        "Busco grupo para jugar a pádel o simplemente tomar algo tranquilo por el centro. 🍻",
        "¡Qué difícil es hacer amigos de adulto! ¿Alguien se apunta a un club de lectura por aquí? 📚",
        "Me encanta la historia romana de Tarragona. ¿Algún apasionado para ir de rutas juntos? 🏛️",
        "¿Gente joven para salir de fiesta o tomar algo por la noche? ¡Manifestaos! 💃",
        "Busco gente para practicar intercambio de idiomas: yo ofrezco catalán/español por inglés. 🌍",
        "¿Alguien se anima a una tarde de juegos de mesa en alguna cafetería? 🎲"
      ];
    } else if (currentNeighborhood === 'PREPPERS') {
      scripts = [
        "¿Alguien sabe qué hacer si suena la sirena de la petroquímica? ¿Evacuar o quedarse en casa? ⚠️",
        "He leído que debemos tener siempre un kit de emergencia. Agua, linternas, radio... ¿Qué más? 🎒",
        "En caso de fuga tóxica en el Polígono Sur, lo recomendable es cerrar ventanas y puertas. 🚪🔒",
        "Yo tengo baterías externas cargadas y velas por si hay apagón. Cada uno en su casa. 🕯️",
        "¿Sabéis dónde están los puntos de encuentro de emergencia en vuestro barrio? 🏛️",
        "Me gustaría que hicieran simulacros de evacuación más seguido. Mucha gente no sabe qué hacer. 🚨",
        "Recomiendo seguir @emergenciescat en Twitter. Avisan rápido de cualquier incidencia. 📱",
        "Tengo dudas sobre las mascarillas FFP3. ¿Son necesarias para una fuga química o con FFP2 vale? 😷",
        "¿Alguien tiene botiquines actualizados? El mío tiene tiritas de hace 5 años... 🩹"
      ];
    } else {
      // Fallback for other neighborhoods
      scripts = [
        "¡Qué buen ambiente hay hoy por aquí!",
        "¿Habéis visto las nuevas ofertas en el comercio local?",
        "Tarragona está preciosa con este sol. ✨",
        "¿Alguien recomienda algún sitio para cenar hoy?",
        "¡Qué alegría ver a tanta gente participando!"
      ];
    }

    // Respuestas específicas según el canal
    let replyScripts = [];

    if (currentNeighborhood === 'EMPLEO') {
      replyScripts = [
        `Interesante oferta, ${isReplyTo}. ¿Sabes si piden experiencia?`,
        `Yo también estoy buscando trabajo en ese sector, ${isReplyTo}.`,
        `Gracias por compartir la info, ${isReplyTo}. Voy a mirar esa oferta.`,
        `¿Alguien ha trabajado ahí? ¿Qué tal las condiciones?`,
        `Yo dejé CV la semana pasada y aún no me han llamado...`,
        `¿Sabéis si piden certificados específicos para ese puesto?`
      ];
    } else if (currentNeighborhood === 'PREPPERS') {
      replyScripts = [
        `Totalmente de acuerdo, ${isReplyTo}. La prevención es clave.`,
        `Yo también tengo esa duda, ${isReplyTo}. ¿Alguien lo sabe?`,
        `Gracias por la info, ${isReplyTo}. No lo sabía.`,
        `Es importante que todos estemos preparados para emergencias.`,
        `¿Habéis hecho algún curso de primeros auxilios?`,
        `Yo tengo guardado el número de Protecció Civil por si acaso.`
      ];
    } else if (currentNeighborhood === 'ENCUENTROS') {
      replyScripts = [
        `Me apunto, ${isReplyTo}! ¿Cuándo quedamos?`,
        `Yo también estoy buscando gente para hacer planes, ${isReplyTo}.`,
        `¡Qué buena idea, ${isReplyTo}! Cuenta conmigo.`,
        `¿Alguien más se anima? Cuantos más mejor.`,
        `Yo soy nuevo por aquí y me encantaría conocer gente.`,
        `¿Hacemos un grupo de WhatsApp para coordinar?`
      ];
    } else {
      // Respuestas generales para otros canales
      replyScripts = [
        `¡Totalmente de acuerdo, ${isReplyTo}!`,
        `¿Me puedes dar más detalles sobre eso, ${isReplyTo}?`,
        `¡Qué bueno saludarte ${isReplyTo}!`,
        `Opino lo mismo que tú, me parece interesante.`,
        `Gracias por la info, me sirve mucho.`,
        `¡Bienvenido al foro, ${isReplyTo}! Da gusto ver gente nueva por aquí.`
      ];
    }

    setIsTyping(neighbor.full_name);

    // Random delay between 2 and 5 seconds for realism
    const delay = isAssistant ? 2000 : (2000 + Math.random() * 3000);

    setTimeout(async () => {
      setIsTyping(null);
      let content = "";

      if (isAssistant && originalPrompt) {
        const aiRes = await getAssistantResponse(originalPrompt, currentNeighborhood);
        content = `@${isReplyTo} ${aiRes.text}`;
      } else {
        content = isReplyTo
          ? `@${isReplyTo} ${replyScripts[Math.floor(Math.random() * replyScripts.length)]}`
          : scripts[Math.floor(Math.random() * scripts.length)];
      }

      const mockMsg: Message = {
        id: `sim-${Date.now()}-${neighbor.id}`,
        user_id: neighbor.id,
        content: content,
        user_metadata: { full_name: neighbor.full_name, avatar_url: neighbor.avatar_url },
        neighborhood: currentNeighborhood,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, mockMsg]);
      playSound('msg');

      // Trigger a Follow-up message (Create a "Burst" of conversation)
      if (!isChain && Math.random() < 0.7) {
        setTimeout(() => {
          generateVirtualMessage(neighbor.full_name.split(' ')[0], content, true);
        }, 3000 + Math.random() * 4000);
      }
    }, delay);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % tickerMessages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Sound Utility using shared Audio objects
  const playSound = (type: 'msg' | 'buzz') => {
    if (isMuted) return;
    const sound = type === 'msg' ? msgSound : buzzSound;
    sound.currentTime = 0;
    sound.play().catch(e => console.warn('Audio playback blocked:', e));
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:forum_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'forum_messages',
        filter: `neighborhood=eq.${currentNeighborhood}`
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          // Filtrar el mensaje temporal optimista para evitar duplicados
          const filtered = prev.filter(m => !(m.id.toString().startsWith('temp-') && m.content === newMsg.content && m.user_id === newMsg.user_id));
          return [...filtered, newMsg];
        });

        // Trigger reply logic (already handled locally but good for other users)
        if (newMsg.user_id !== user?.id) {
          if (newMsg.content.includes('<<ZUMBIDO>>')) {
            playSound('buzz');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
          } else {
            playSound('msg');
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentNeighborhood]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await safeSupabaseFetch('forum_messages',
        supabase
          .from('forum_messages')
          .select('*')
          .eq('neighborhood', currentNeighborhood)
          .order('created_at', { ascending: true })
          .limit(100)
      );

      setMessages(data || []);
      fetchActiveUsers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveUsers = (msgs: Message[]) => {
    const virtuals = virtualNeighbors.map(v => ({ ...v, isVirtual: true }));
    const seen = new Set();
    const uniqueUsers: any[] = [...virtuals];

    msgs.forEach(m => {
      if (m.user_id && !seen.has(m.user_id) && !m.id.startsWith('sim-')) {
        seen.add(m.user_id);
        uniqueUsers.push({
          id: m.user_id,
          avatar_url: m.user_metadata?.avatar_url,
          full_name: m.user_metadata?.full_name,
          status: 'online'
        });
      }
    });
    setActiveUsers(uniqueUsers.slice(0, 12)); // Show more "online" users
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const sendBuzz = async () => {
    if (loading) return;
    try {
      playSound('buzz');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      await logActivity('Enviar Zumbido', { neighborhood: currentNeighborhood });
      await safeSupabaseInsert('forum_messages', {
        user_id: user?.id,
        content: '🔔 ¡ZUMBIDO! <<ZUMBIDO>>',
        user_metadata: {
          full_name: user?.user_metadata?.full_name || 'Alguien',
          avatar_url: user?.user_metadata?.avatar_url
        },
        neighborhood: currentNeighborhood
      });
      await addPoints(10, 2);
    } catch (e) { console.error(e); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      user_id: user?.id || 'anon',
      content: newMessage,
      user_metadata: {
        full_name: user?.user_metadata?.full_name || 'Vecino Anónimo',
        avatar_url: user?.user_metadata?.avatar_url
      },
      neighborhood: currentNeighborhood,
      created_at: new Date().toISOString()
    };

    // Optimistic Update
    setMessages(prev => [...prev, tempMsg]);
    const messageToSend = newMessage;
    setNewMessage('');

    // Trigger AI/Neighbor response IMMEDIATELY locally for the current user
    generateVirtualMessage(user?.user_metadata?.full_name?.split(' ')[0] || 'Vecino', messageToSend);

    try {
      const { success } = await safeSupabaseInsert('forum_messages', {
        user_id: user?.id,
        content: messageToSend,
        user_metadata: {
          full_name: user?.user_metadata?.full_name || 'Vecino Anónimo',
          avatar_url: user?.user_metadata?.avatar_url
        },
        neighborhood: currentNeighborhood
      });

      if (!success) {
        // Remove temp message if failed
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        throw new Error('Falló envío');
      }

      await addPoints(5, 1);
      await logActivity('Mensaje Foro', { neighborhood: currentNeighborhood, content: messageToSend.substring(0, 30) });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTopicClick = (topicId: string) => {
    if (topicId === 'candlelight') {
      setNewMessage('¡Qué ganas del concierto de Hans Zimmer esta noche! 🕯️🎻 ¿Alguien más va?');
    } else if (topicId === 'sant-antoni') {
      setNewMessage('¿Habéis visto los Tres Tombs en Vila-seca? ¡Qué ambiente! 🐎✨');
    } else if (topicId === 'viento-costa') {
      setNewMessage('Ojo con las olas en el Miracle, están llegando al paseo casi 🌊⚠️');
    } else if (topicId === 'rebajas-finde') {
      setNewMessage('Voy al centro de compras. ¿Quedan tallas o ya está todo arrasado? 🛍️👀');
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const trendingTopics = [
    {
      id: 'candlelight',
      title: '🕯️ Candlelight Hans Zimmer',
      description: 'Concierto tributo hoy a las 21h en El Seminario. Entradas agotadas.',
      participating: 124
    },
    {
      id: 'sant-antoni',
      title: '🐎 Sant Antoni Vila-seca',
      description: 'Fiesta mayor de invierno cerca: Tres Tombs y Castells.',
      participating: 98
    },
    {
      id: 'viento-costa',
      title: '🌊 Alerta Oleaje',
      description: 'Aviso amarillo en la costa. Precaución en zonas expuestas.',
      participating: 76
    }
  ];

  return (
    <div className={`flex h-[calc(100vh-80px)] font-sans transition-transform duration-100 ${isShaking ? 'translate-x-2 -translate-y-2' : ''} bg-[#f0f2f5] dark:bg-background-dark/30`} onClick={unlockAudio}>
      {/* Admin Activity Sidebar (Real Users only for admin nhemesysgonzalez@gmail.com) */}
      {isAdmin && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="hidden xl:flex w-72 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-r border-gray-100 dark:border-gray-800 flex-col shrink-0 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-primary/5">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Admin Insights</h3>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Actividad Real del Sistema</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {adminActivities.length === 0 ? (
              <p className="text-[9px] text-center text-gray-400 py-10">Esperando actividad...</p>
            ) : (
              adminActivities.map((act, i) => (
                <div key={i} className="bg-white dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex gap-3 items-start animate-in fade-in slide-in-from-left-4">
                  <img src={act.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${act.profiles?.full_name || 'V'}`} className="size-6 rounded-lg" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black dark:text-white truncate">{act.profiles?.full_name || 'Alguien'}</p>
                    <p className="text-[8px] font-bold text-primary uppercase tracking-tighter">{act.action}</p>
                    <p className="text-[7px] text-gray-400 font-bold uppercase mt-1">{new Date(act.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Main Forum Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 relative overflow-hidden glass">

          {/* MSN style top bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-green-400 to-blue-400"></div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-3xl font-black dark:text-white tracking-tighter uppercase leading-none">COMMUNITY MESSENGER</h2>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-lg">
                <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">{activeUsers.length + 8} ACTIVOS</span>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <button
                onClick={() => startTransition(() => setCurrentNeighborhood('GENERAL'))}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${currentNeighborhood === 'GENERAL' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
                aria-label="Canal General"
              >
                🌍 Canal General
              </button>
              <button
                onClick={() => startTransition(() => setCurrentNeighborhood(user?.user_metadata?.neighborhood || 'GENERAL'))}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${currentNeighborhood !== 'GENERAL' && currentNeighborhood !== 'EMPLEO' && currentNeighborhood !== 'ENCUENTROS' && currentNeighborhood !== 'PREPPERS' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
              >
                🏠 Mi Barrio
              </button>
              <button
                onClick={() => startTransition(() => setCurrentNeighborhood('EMPLEO'))}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${currentNeighborhood === 'EMPLEO' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-gray-100 text-emerald-600 hover:bg-emerald-50 dark:bg-gray-800 dark:text-emerald-400'}`}
              >
                💼 Empleo
              </button>
              <button
                onClick={() => startTransition(() => setCurrentNeighborhood('ENCUENTROS'))}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${currentNeighborhood === 'ENCUENTROS' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-gray-100 text-pink-500 hover:bg-pink-50 dark:bg-gray-800 dark:text-pink-400'}`}
              >
                ❤️ Encuentros
              </button>
              <button
                onClick={() => startTransition(() => setCurrentNeighborhood('PREPPERS'))}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${currentNeighborhood === 'PREPPERS' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-gray-100 text-orange-600 hover:bg-orange-50 dark:bg-gray-800 dark:text-orange-400'}`}
              >
                🛡️ Preppers / TGN Segura
              </button>
            </div>
          </div>

          {/* Status Bar / Avatars */}
          <div className="flex items-center gap-2">
            {activeUsers.slice(0, 6).map((u, i) => (
              <div key={i} className="relative group cursor-help">
                <img src={u.avatar_url || `https://i.pravatar.cc/100?u=${u.id}`} className="size-10 rounded-xl border-2 border-white dark:border-gray-800 shadow-md grayscale-[0.5] hover:grayscale-0 transition-all" alt="" />
                <span className={`absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-white dark:border-gray-800 ${u.status === 'online' ? 'bg-green-500' : u.status === 'busy' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-[8px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {u.full_name} ({u.status || 'online'})
                </div>
              </div>
            ))}
            <div className="size-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-400">+12</div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 bg-[#f5f7fa] dark:bg-background-dark/30 custom-scrollbar">

          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
              <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Estableciendo conexión...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center mb-8">
                <span className="px-6 py-2 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Lunes 26 Enero 2026 - Inicio de Semana y Rutina
                </span>
              </div>

              {messages.map((msg, i) => {
                const isMine = msg.user_id === user?.id;
                const isBuzz = msg.content.includes('<<ZUMBIDO>>');

                if (isBuzz) {
                  return (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.1, opacity: 1 }}
                      key={msg.id}
                      className="flex justify-center my-6"
                    >
                      <div className="bg-red-500 text-white px-10 py-5 rounded-[40px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(239,68,68,0.3)] animate-pulse flex items-center gap-4 border-4 border-white">
                        <span className="material-symbols-outlined shrink-0">notifications_active</span>
                        ¡ZUMBIDO DE {msg.user_metadata?.full_name}!
                        <span className="material-symbols-outlined shrink-0">notifications_active</span>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="shrink-0 pt-1">
                        <div className="relative group">
                          <img src={msg.user_metadata?.avatar_url || `https://i.pravatar.cc/100?u=${msg.user_id}`} className="size-10 rounded-2xl object-cover border-2 border-white dark:border-gray-800 shadow-sm" alt="" />
                          <span className="absolute -bottom-1 -right-1 size-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
                        </div>
                      </div>
                      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span
                            onClick={() => !isMine && handleReply(msg.user_metadata?.full_name?.split(' ')[0] || 'Vecino')}
                            className={`text-[9px] font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors ${isMine ? 'dark:text-gray-400' : 'text-primary animate-pulse'}`}
                          >
                            {msg.user_metadata?.full_name} {isMine ? '(Tú)' : '← Responder'}
                          </span>
                          <span className="text-[8px] font-bold text-gray-400">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={`p-4 rounded-[28px] font-bold text-sm leading-relaxed shadow-lg ${isMine ? 'bg-[#3b82f6] text-white rounded-tr-none' : 'bg-white dark:bg-surface-dark dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-800'}`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-gray-400 ml-14">
                  <div className="flex gap-1">
                    <span className="size-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                    <span className="size-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="size-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{isTyping} está escribiendo...</span>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 md:p-10 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark shrink-0">

          <form onSubmit={sendMessage} className="relative max-w-5xl mx-auto flex items-center gap-4">
            <button
              type="button"
              onClick={sendBuzz}
              className="size-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90 group border-2 border-red-100"
              title="Enviar Zumbido"
            >
              <span className="material-symbols-outlined text-2xl group-hover:animate-ping">notifications_active</span>
            </button>

            <div className="flex-1 relative group">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onFocus={() => { if (messages.length === 0) unlockAudio(); }}
                placeholder={`Escribe un mensaje en ${currentNeighborhood}...`}
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl px-6 py-4 font-bold dark:text-white outline-none ring-primary/20 focus:ring-4 focus:border-primary transition-all pr-20"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 transition-colors ${showEmojiPicker ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-xl">mood</span>
                </button>
              </div>

              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-full right-0 mb-4 p-4 bg-white dark:bg-surface-dark rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 grid grid-cols-6 gap-2 z-50 w-64"
                  >
                    {['❤️', '😂', '🙌', '🎉', '🔥', '👏', '🐎', '☀️', '💼', '💪', '🏠', '📍'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setNewMessage(prev => prev + emoji);
                          setShowEmojiPicker(false);
                          inputRef.current?.focus();
                        }}
                        className="size-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-lg transition-transform hover:scale-125"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              className="size-14 rounded-2xl bg-[#3b82f6] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-50 border-b-4 border-blue-700"
              disabled={!newMessage.trim()}
            >
              <span className="material-symbols-outlined font-black">send</span>
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {trendingTopics.map(topic => (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic.id)}
                className="px-4 py-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-full text-[9px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all"
              >
                #{topic.title.replace(' ', '')}
              </button>
            ))}
            {/* Job Offers Button */}
            <button
              onClick={() => setShowJobOffers(true)}
              className="ml-2 px-4 py-2 bg-green-500/10 border border-green-500 dark:border-green-400 rounded-full text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
              aria-label="Abrir lista de ofertas laborales"
            >
              Ver Ofertas Laborales
            </button>
          </div>

          {/* Job Offers Modal */}
          {showJobOffers && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50" role="dialog" aria-modal="true">
              <div className="bg-white dark:bg-surface-dark rounded-xl shadow-2xl max-w-md w-full p-6 overflow-y-auto max-h-[80vh] relative">
                <button
                  onClick={() => setShowJobOffers(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Cerrar ofertas laborales"
                >
                  ✕
                </button>
                <h2 className="text-xl font-black mb-4 text-center">Ofertas Laborales en Tarragona</h2>
                <ul className="space-y-2">
                  <li>🧺 <strong>Operario/a Lavandería - Constantí</strong> (Randstad) – Incorporación Inmediata</li>
                  <li>📑 <strong>Administrativo/a Logístico - Tarragona</strong> (Randstad) – Jornada Completa</li>
                  <li>📦 <strong>Carretillero/a - Reus</strong> (Eurofirms) – Turnos rotativos</li>
                  <li>☕ <strong>Ayudante de Camarero/a - TGN Centro</strong> (Job Today) – Fines de semana</li>
                  <li>🚚 <strong>Repartidor Carnet B - Tarragona</strong> – Urge contratación</li>
                  <li>🏨 <strong>Recepcionista de Noche - Hotel Llevant</strong> – Inglés alto</li>
                  <li>👵 <strong>Cuidador/a Mayores - Residencia TGN</strong> – Turno tarde</li>
                  <li>🏭 <strong>Mozos de Almacén - Polígono Riu Clar</strong> – Campaña puntual</li>
                  <li>🛍️ <strong>Dependienta/e Refuerzo - Parc Central</strong> – Fines de semana</li>
                </ul>
                <button
                  onClick={() => setShowJobOffers(false)}
                  className="mt-4 w-full py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-black uppercase hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  aria-label="Cerrar ofertas laborales"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;
