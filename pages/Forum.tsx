
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
    { user: 'ComuniTarr 📢', text: '🎭 LUNES: ¡Empieza la semana de Carnaval! Revisa el calendario.' },
    { user: 'Marta L.', text: 'Busco grupo para salir en una comparsa, me han fallado mis amigas. 💃' },
    { user: 'PrepperTGN', text: 'NUEVO HILO: Cómo mantener la cadena de frío sin electricidad. Vital en riesgo químico. ❄️' },
    { user: 'Juan R.', text: 'El tráfico en Av. Catalunya está fluido hoy, sorprendente. 🚗' },
    { user: 'Sonia P.', text: 'Vendo 2 entradas para la Disbauxa (sábado noche) porque trabajo. 🎟️' },
    { user: 'Pedro A.', text: '¿Algún fontanero urgente? Se me ha roto una tubería. 🔧' }
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
    const p = originalPrompt?.toLowerCase() || "";

    // Improved detection logic
    const isQuestion = p.includes('?') || p.includes('cómo') || p.includes('como') || p.includes('qué') || p.includes('que ') || p.includes('sabéis') || p.includes('sabeis') || p.includes('donde') || p.includes('dónde');
    const isHelpRequest = p.includes('ayuda') || p.includes('primera vez') || p.includes('no sé') || p.includes('no se') || p.includes('funciona') || p.includes('hacer') || p.includes('hace');
    const isGreeting = p.includes('hola') || p.includes('buenos días') || p.includes('buenas tardes') || p.includes('saludos') || p.includes('buenas');

    // Priority for Mediator if it's a question or app help
    const isAssistant = isReplyTo && (isQuestion || isHelpRequest || p.includes('@mediador') || p.includes('mediador'));

    // Base initiation scripts
    let scripts = [
      "¡Qué sueño tengo hoy! La vuelta a la rutina cuesta... ☕",
      "¿Alguien sabe si quedan sillas para la Rua del sábado? En la web da error. 🎭",
      "He comprado 3kg de hielo para probar el truco de la nevera de los preppers. ❄️",
      "Busco alguien que sepa coser bajo para mi disfraz, pago bien. 🪡",
      "El mercadillo de Bonavista está imposible de gente, id con tiempo. 🛍️",
      "¡Venga ánimo con el lunes que el jueves ya estamos comiendo butifarra! 🌭"
    ];

    // Base reply scripts
    let replyScripts = [
      `¡Totalmente de acuerdo, ${isReplyTo}! Miércoles tranquilo.`,
      `¿Me puedes dar más detalles sobre eso, ${isReplyTo}?`,
      `¡Buenos días ${isReplyTo}! Mitad de semana ya.`,
      `Yo también me pasaré luego, nos vemos allí.`,
      `Gracias por el aviso, ${isReplyTo}.`,
      `¡Vaya, no lo sabía! Gracias por comentarlo, ${isReplyTo}.`
    ];

    if (currentNeighborhood === 'EMPLEO') {
      scripts = ["¿Habéis visto las nuevas ofertas de Randstad para esta semana? 📦", "Empiezo hoy en el nuevo curro, ¡deseadme suerte! 🤞"];
      replyScripts = [`¡Mucha suerte en tu primer día, ${isReplyTo}!`, `Voy a echar un vistazo a Infojobs, gracias.`];
    } else if (currentNeighborhood === 'ENCUENTROS') {
      scripts = [
        "¿Quién se anima a un afterwork hoy para relajarnos? 🍻",
        "Busco compi de gym para ir por las tardes. 💪",
        "¡Mitad de semana! ¿Un café para aguantar? ☕✨",
        "Ayer conocí gente majísima en la asamblea. ¿Repetimos quedada? 😊",
        "Si alguien quiere ir a correr por el milagro a las 19h, avisad. 🏃‍♂️",
        "¡Hola! Buscando planes tranquilos para entre semana. 👋"
      ];
      replyScripts = [
        `¡Me apunto a ese afterwork, ${isReplyTo}!`,
        `Yo voy al gimnasio del puerto, si te va bien...`,
        `¡Café necesario! Dime sitio y hora, ${isReplyTo}.`,
        `Yo también salgo a correr, si quieres hoy coincidimos. 🏃‍♂️`
      ];
    } else if (isHelpRequest) {
      replyScripts = [
        `¡Bienvenida ${isReplyTo}! Es muy fácil: este es el Foro para hablar. Tienes el Mapa 📍 para avisos y el Inicio 🏠 para noticias.`,
        `¡Hola! No te preocupes ${isReplyTo}. Usa el menú lateral para moverte y no olvides la Radio 📻.`,
        `¡Bienvenida! Si participas ganas XP y subes en el Top Vecinos 🏆.`,
        `¡Hola ${isReplyTo}! Aquí nos ayudamos todos. Si ves algo roto, repórtalo en 'Incidencias' en el Inicio.`
      ];
    }

    // Choose character
    const neighbor = isAssistant
      ? { id: 'v-ai', full_name: 'Mediador Vecinal ⚖️', avatar_url: 'https://img.icons8.com/isometric/512/scales.png', status: 'online' }
      : virtualNeighbors[Math.floor(Math.random() * virtualNeighbors.length)];

    // Show typing indicator immediately
    setIsTyping(neighbor.full_name);

    // Dynamic delay: faster for AI help, slower for casual chat
    const delay = isAssistant ? 1500 : (2000 + Math.random() * 3000);

    setTimeout(async () => {
      let finalContent = "";

      if (isAssistant && originalPrompt) {
        // Real or simulated AI response
        try {
          const aiRes = await getAssistantResponse(originalPrompt, currentNeighborhood);
          finalContent = `@${isReplyTo} ${aiRes.text}`;
        } catch (e) {
          finalContent = `@${isReplyTo} ¡Hola! Soy el mediador. Parece que tengo un problema de conexión, but dime: ¿en qué puedo ayudarte?`;
        }
      } else if (isReplyTo) {
        // Context-aware reply scripts
        let possibleReplies = [];
        if (isGreeting) {
          possibleReplies = [
            `¡Hola, ${isReplyTo}! A por el miércoles con ganas. 💪`,
            `¡Muy buenas! ¿Qué tal la semana? @${isReplyTo}.`,
            `¡Hola ${isReplyTo}! Aquí arrancando motores. ☕`,
            `¡Buenos días! ¿Nos vemos en la asamblea de tarde?`
          ];
        } else {
          possibleReplies = replyScripts;
        }
        finalContent = possibleReplies[Math.floor(Math.random() * possibleReplies.length)];
        // Ensure it mentions the user if it's a reply and doesn't already
        if (!finalContent.includes(isReplyTo)) finalContent = `@${isReplyTo} ${finalContent}`;
      } else {
        // Random initiation scripts
        finalContent = scripts[Math.floor(Math.random() * scripts.length)];
      }

      // Final sanity check for content
      if (!finalContent) finalContent = "¡Vaya día hace hoy! ✨";

      const mockMsg: Message = {
        id: `sim-${Date.now()}-${neighbor.id}`,
        user_id: neighbor.id,
        content: finalContent,
        user_metadata: { full_name: neighbor.full_name, avatar_url: neighbor.avatar_url },
        neighborhood: currentNeighborhood,
        created_at: new Date().toISOString()
      };

      // Add message and hide indicator
      setMessages(prev => [...prev, mockMsg]);
      setIsTyping(null);
      playSound('msg');

      // Occasional chain follow-up
      if (!isChain && !isAssistant && Math.random() < 0.4) {
        setTimeout(() => {
          generateVirtualMessage(neighbor.full_name.split(' ')[0], finalContent, true);
        }, 4000 + Math.random() * 4000);
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

        // Trigger reply logic (AI / Simulation)
        if (newMsg.user_id !== user?.id && !newMsg.id.toString().startsWith('sim-')) {
          if (newMsg.content.includes('<<ZUMBIDO>>')) {
            playSound('buzz');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
          } else {
            playSound('msg');
            // Important: Trigger simulated response so everyone sees the Mediator answering real users
            generateVirtualMessage(newMsg.user_metadata?.full_name?.split(' ')[0] || 'Vecino', newMsg.content);
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
    if (topicId === 'asamblea-vecinal') {
      setNewMessage('¿Alguien tiene la orden del día de la asamblea de las 19:00? 📢');
    } else if (topicId === 'directorio-negocios') {
      setNewMessage('¿Cómo añado mi negocio al nuevo directorio? Me interesa mucho. 🏪');
    } else if (topicId === 'mercadillo-jueves') {
      setNewMessage('¿Qué tipo de artesanía suele haber en el mercadillo? 🛍️');
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const trendingTopics = [
    {
      id: 'ideas-carnaval',
      title: '🎭 Ideas Disfraz',
      description: 'Comparte tu diseño o pide ayuda.',
      participating: 845
    },
    {
      id: 'preppers-nevera',
      title: '❄️ Nevera sin Luz',
      description: 'Trucos conservación alimentos.',
      participating: 312
    },
    {
      id: 'empleo-lunes',
      title: '💼 Ofertas Lunes',
      description: 'Refuerzos para Carnaval.',
      participating: 245
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

        {/* Specialized UI for ENCUENTROS */}
        {currentNeighborhood === 'ENCUENTROS' && (
          <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 py-4 px-8 border-b border-pink-100 dark:border-pink-900/30 overflow-hidden relative">
            <motion.div
              animate={{ x: [0, -100, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20"
            >
              <span className="material-symbols-outlined absolute top-2 left-10 text-pink-500 animate-bounce">favorite</span>
              <span className="material-symbols-outlined absolute top-5 left-1/2 text-purple-500 animate-pulse">favorite</span>
              <span className="material-symbols-outlined absolute top-2 right-20 text-pink-400 animate-bounce [animation-delay:1s]">favorite</span>
            </motion.div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                  <span className="material-symbols-outlined">favorite</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-pink-600 dark:text-pink-400 uppercase tracking-widest">Cupido Vecinal</h3>
                  <p className="text-[10px] font-bold text-gray-500">Conoce a tus vecinos en un ambiente relajado y divertido.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-[9px] font-black text-pink-500 border border-pink-100 uppercase tracking-tighter">14 Candidatos hoy</span>
                <span className="px-3 py-1 bg-pink-500 text-white rounded-full text-[9px] font-black uppercase tracking-tighter shadow-md">Modo Love Activo</span>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} className={`flex-1 overflow-y-auto p-6 md:p-12 space-y-8 custom-scrollbar transition-colors ${currentNeighborhood === 'ENCUENTROS' ? 'bg-pink-50/30 dark:bg-pink-900/5' : 'bg-[#f5f7fa] dark:bg-background-dark/30'}`}>

          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
              <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Estableciendo conexión...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center mb-8">
                <span className="px-6 py-2 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Lunes 9 Febrero 2026 - Semana de Carnaval 🎭✨
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
                        <div className={`p-4 rounded-[28px] font-bold text-sm leading-relaxed shadow-lg ${isMine
                          ? (currentNeighborhood === 'ENCUENTROS' ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-tr-none shadow-pink-500/20' : 'bg-[#3b82f6] text-white rounded-tr-none')
                          : (currentNeighborhood === 'ENCUENTROS' ? 'bg-white dark:bg-surface-dark dark:text-white rounded-tl-none border-2 border-pink-100 dark:border-pink-900/30' : 'bg-white dark:bg-surface-dark dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-800')}`}>
                          {msg.content}
                          {currentNeighborhood === 'ENCUENTROS' && !isMine && Math.random() > 0.8 && (
                            <div className="absolute -right-2 -bottom-2 size-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-[8px] animate-bounce shadow-lg">❤️</div>
                          )}
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
              className={`size-14 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 border-b-4 ${currentNeighborhood === 'ENCUENTROS' ? 'bg-pink-500 border-pink-700 shadow-pink-500/30' : 'bg-[#3b82f6] border-blue-700 shadow-blue-500/30'} text-white`}
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
                <h2 className="text-xl font-black mb-4 text-center">Ofertas Tarragona - Lunes 09/02</h2>
                <ul className="space-y-2">
                  <li>🎭 <strong>Seguridad Eventos Carnaval</strong> – 20 vacantes para los desfiles (Sáb/Dom)</li>
                  <li>🍹 <strong>Camareros/as Barra Móvil</strong> – Para la Rua de l'Artesania (Sábado)</li>
                  <li>🧵 <strong>Costurero/a Express</strong> – Taller de disfraces en Torreforta (Urgente)</li>
                  <li>🚛 <strong>Conductor Carroza</strong> – Necesario permiso C+E (Sábado tarde)</li>
                  <li>🧹 <strong>Limpieza Viaria Especial</strong> – Refuerzo nocturno Carnaval</li>
                  <li>💄 <strong>Maquillador/a Fantasía</strong> – Para comparsa grande (Sábado mañana)</li>
                  <li>📦 <strong>Mozo de Almacén</strong> – Carga y descarga material festivo</li>
                  <li>👴 <strong>Cuidador/a</strong> – Noche del sábado (padres salen de fiesta)</li>
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
