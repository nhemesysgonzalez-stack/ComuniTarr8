
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
  image_url?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [adminActivities, setAdminActivities] = useState<any[]>([]);
  const isAdmin = user?.email === 'nhemesysgonzalez@gmail.com';

  const tickerMessages = [
    { user: 'Admin ComuniTarr', text: '💜 Feliz normal! Manifestación a las 18h desde Plaça de la Font.' },
    { user: 'Meteo TGN', text: '☁️ viernes soleado, 13ºC. Sin previsión de lluvia.' },
    { user: 'Ajuntament TGN', text: '🏛️ Hoy entrada gratuita a todos los recintos monumentales para mujeres.' },
    { user: 'Trànsit TGN', text: '🚗 Cortes previstos en el centro desde las 17:30h por la manifestación del normal.' },
    { user: 'AAVV Part Alta', text: '📋 El mural participativo del normal ya está terminado en el Fòrum. ✅' }
  ];


  // Virtual Neighbors for Simulation
  const virtualNeighbors = [
    { id: 'v1', full_name: 'Pau T.', avatar_url: 'https://i.pravatar.cc/150?u=pau', status: 'online' },
    { id: 'v2', full_name: 'Mireia R.', avatar_url: 'https://i.pravatar.cc/150?u=mireia', status: 'busy' },
    { id: 'v3', full_name: 'Joan B.', avatar_url: 'https://i.pravatar.cc/150?u=joan', status: 'online' },
    { id: 'v4', full_name: 'Carme S.', avatar_url: 'https://i.pravatar.cc/150?u=carme', status: 'away' },
    { id: 'v5', full_name: 'Luis M.', avatar_url: 'https://i.pravatar.cc/150?u=luis', status: 'online' },
    { id: 'v6', full_name: 'Joe R.', avatar_url: 'https://i.pravatar.cc/150?u=joe', status: 'online' },
    { id: 'v7', full_name: 'Maria G.', avatar_url: 'https://i.pravatar.cc/150?u=maria', status: 'busy' },
    { id: 'v8', full_name: 'Sandra L.', avatar_url: 'https://i.pravatar.cc/150?u=sandra', status: 'online' },
    { id: 'v9', full_name: 'Elena V.', avatar_url: 'https://i.pravatar.cc/150?u=elena', status: 'online' },
    { id: 'v10', full_name: 'Nuria P.', avatar_url: 'https://i.pravatar.cc/150?u=nuria', status: 'busy' }
  ];

  const handleReply = (name: string) => {
    setNewMessage(`@${name} `);
    inputRef.current?.focus();
  };

  // Keep a ref to generateVirtualMessage so the interval always calls the latest version (fixes stale closure)
  const generateVirtualMessageRef = React.useRef<() => void>(() => { });

  // ============================================================
  // THREADED CONVERSATION SYSTEM — Scripted flowing dialogues
  // Each thread is a sequence of messages that play one-by-one
  // ============================================================
  const threadIndexRef = useRef(0);
  const stepIndexRef = useRef(0);

  const conversationThreads: Record<string, Array<Array<{ who: string; text: string }>>> = {
    'GENERAL': [
      [
        { who: 'Mireia R.', text: '💜 ¡Feliz Día de la Mujer a todas las vecinas! ¿Nos vemos hoy en la concentración de las 18h?' },
        { who: 'Joan B.', text: '@Mireia ¡Allí estaremos! Cada año vamos en familia. Importante recordar los cortes de tráfico en el centro.' },
        { who: 'Carme S.', text: '@Mireia @Joan Hemos preparado pancartas desde la AAVV de Llevant. ¡Nos uniremos en la Imperial!' },
        { who: 'Mireia R.', text: '@Carme ¡Genial! Estaré atenta a ver si os veo. Cuantas más seamos, mejor.' },
        { who: 'Maria G.', text: '💜 Seguimos en la lucha compañeras. Un abrazo a todas desde Ponent.' },
      ],
      [
        { who: 'Luis M.', text: '🚗 ¿Alguien sabe a qué hora exactamente cortan la Rambla hoy por el normal?' },
        { who: 'Carme S.', text: '@Luis La Guardia Urbana ha anunciado que sobre las 17:30h cerrarán el paso por Rambla Nova e Imperial.' },
        { who: 'Luis M.', text: '@Carme ¡Gracias! Intentaré mover el coche antes de las 17h entonces.' },
        { who: 'Joan B.', text: '@Luis Sí, los domingos como hoy la zona se colapsa en los aledaños. Mejor dejarlo en un parking periférico. ✅' },
      ],
      [
        { who: 'Joe R.', text: '⚽ ¿Alguien sabe si el polideportivo de Campclar abre Hoy viernes con normalidad?' },
        { who: 'Pau T.', text: '@Joe Sí, abre hasta las 14h como todos los domingos. Yo voy a tirar unas canastas ahora mismo.' },
        { who: 'Sandra L.', text: '@Joe @Pau Cuidado que hace fresquito y el suelo está un poco húmedo de la noche.' },
        { who: 'Joe R.', text: '@Sandra ¡Gracias por avisar! Me llevaré chándal largo.' },
      ],
    ],
    'APOYO': [
      [
        { who: 'Sandra L.', text: '💜 Buenos días. Hoy viernes me siento un poco abrumada. ¿Cómo gestionáis vosotros el estrés de final de semana?' },
        { who: 'Elena V.', text: '@Sandra Yo intento desconectar paseando por la playa los domingos. ¿Te vienes luego?' },
        { who: 'Joan B.', text: '@Sandra @Elena Yo camino por la playa del Miracle 20 min al salir. Ayuda mucho a limpiar la cabeza. 🌊' },
        { who: 'Nuria P.', text: '@Sandra Es normal, Sandra. Mañana a empezar la semana con energía. 🫂' },
        { who: 'Sandra L.', text: '@Nuria Tienes razón. Me apunto lo del Club de Lectura, Elena. Pásame info por privado.' },
        { who: 'Elena V.', text: '@Sandra ¡Hecho! Es gratuito y los vecinos somos muy majos.' },
        { who: 'Joan B.', text: '@Elena Contad conmigo también. ¡Mañana nos vemos!' },
        { who: 'Nuria P.', text: '@Elena @Joan @Sandra ¡Esto es red vecinal! Si alguien más se siente así, que hable. 💪' },
      ],
    ],
    'EMPLEO': [
      [
        { who: 'Luis M.', text: '💼 ¿Alguien sabe de trabajo de tarde? Estoy buscando algo en hostelería o comercio, tengo experiencia.' },
        { who: 'Pau T.', text: '@Luis En la sección de Servicios de la app hay 3-4 ofertas nuevas. Un bar en Part Alta busca camarero para mediodías.' },
        { who: 'Joan B.', text: '@Luis También he visto que en el Mercadona del Eixample buscan reponedor, turno de tarde. Pregunta directamente en tienda.' },
        { who: 'Luis M.', text: '@Joan @Pau ¡Gracias a los dos! Mañana me paso por ambos sitios. Este foro es oro, en serio. 🙏' },
        { who: 'Carme S.', text: '@Luis ¡Mucha suerte! Si necesitas que alguien te eche un ojo al currículum, dime. Trabajé en RRHH 10 años. 💪' },
      ],
    ],
    'ENCUENTROS': [
      [
        { who: 'Joe R.', text: 'Hola a todos 👋 Soy nuevo en esto del "First Dates Comunitario". ¿Alguien se anima a tomar un café o una caña por la Part Alta este finde?' },
        { who: 'Elena V.', text: '@Joe ¡Bienvenido! Yo me apunto a esa caña. Hace tiempo que busco conocer gente nueva sin las apps típicas.' },
        { who: 'Joe R.', text: '@Elena ¡Perfecto! ¿Te parece bien el sábado sobre las 19h en la plaza del Fòrum?' },
        { who: 'Elena V.', text: '@Joe Hecho. Nos vemos allí 😊' },
      ],
      [
        { who: 'Nuria P.', text: '¡Qué buen ambiente hay por aquí! ¿Algún chico deportista de 35-45 años para hacer rutas y luego vermut?' },
        { who: 'Pau T.', text: '@Nuria ¡Hola! Yo suelo hacer rutas por el Pont del Diable los domingos. Y el vermut es innegociable 😉' },
        { who: 'Nuria P.', text: '@Pau ¡Te tomo la palabra! Te escribo por privado y organizamos.' },
      ],
    ],
  };

  // Determine weather context for simulation
  const isActuallyRaining = false; // Context for today's TGN weather (Nublado but no rain)
  const isWomensDay = true;
  const todayName = new Date().toLocaleDateString('es-ES', { weekday: 'long' });

  // Threaded conversation engine + REALTIME
  useEffect(() => {
    // 1. REALTIME SUBSCRIPTION
    const channel = supabase.channel(`public:forum_messages:${currentNeighborhood}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'forum_messages',
        filter: `neighborhood=eq.${currentNeighborhood}`
      }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as Message].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
        if (payload.new.user_id !== user?.id) playSound('msg');
      })
      .subscribe();

    const threadsBase = conversationThreads[currentNeighborhood] || conversationThreads['GENERAL'];
    if (!threadsBase || threadsBase.length === 0) return;

    const playNextMessage = () => {
      // Filter out threads that mention sun if it's raining
      const threads = threadsBase.filter(t => {
        const mentionsSun = t.some(m => m.text.toLowerCase().includes('sol') || m.text.toLowerCase().includes('solazo'));
        return isActuallyRaining ? !mentionsSun : true;
      });

      if (threads.length === 0) return;
      const currentThread = threads[threadIndexRef.current % threads.length];
      if (!currentThread) return;

      const step = currentThread[stepIndexRef.current];
      if (!step) {
        threadIndexRef.current = (threadIndexRef.current + 1) % threads.length;
        stepIndexRef.current = 0;
        return;
      }

      const neighbor = virtualNeighbors.find(v => v.full_name === step.who) ||
        { id: `v-${step.who}`, full_name: step.who, avatar_url: `https://i.pravatar.cc/150?u=${step.who.split(' ')[0].toLowerCase()}` };

      setIsTyping(neighbor.full_name);

      const typingDelay = 2000 + Math.random() * 3000;
      setTimeout(() => {
        const msg: Message = {
          id: `sim-${Date.now()}-${neighbor.id}`,
          user_id: neighbor.id,
          content: step.text,
          user_metadata: { full_name: neighbor.full_name, avatar_url: neighbor.avatar_url },
          neighborhood: currentNeighborhood,
          created_at: new Date().toISOString()
        };
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
        setIsTyping(null);
        playSound('msg');

        // LOCAL PERSISTENCE
        const localKey = `forum_pers_v2_${currentNeighborhood}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        localStorage.setItem(localKey, JSON.stringify([...existing, msg].slice(-80)));

        stepIndexRef.current++;
      }, typingDelay);
    };

    const interval = setInterval(() => {
      if (Math.random() < 0.3) playNextMessage();
    }, 15000 + Math.random() * 8000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [currentNeighborhood]);

  // ALWAYS inject seed messages dynamic based on weather
  const seedsInjectedRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (!loading && seedsInjectedRef.current !== currentNeighborhood) {
      seedsInjectedRef.current = currentNeighborhood;
      const now = Date.now();

      const seedsByChannel: Record<string, Message[]> = {
        'GENERAL': [
          { id: 'seed-cloud-101', user_id: 'v3', content: `💜 ¡Feliz ${todayName} amigues! Recordad que hoy por el normal tenemos actos todo el día en Tarragona.`, user_metadata: { full_name: 'Joan B.', avatar_url: 'https://i.pravatar.cc/150?u=joan' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 3600).toISOString() },
          { id: 'seed-cloud-102', user_id: 'v2', content: '☁️ Hace un poco de fresco hoy, ideal para coger una chaqueta si venís al centro.', user_metadata: { full_name: 'Mireia R.', avatar_url: 'https://i.pravatar.cc/150?u=mireia' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 1800).toISOString() },
        ] as Message[],
      };

      const channelSeeds = seedsByChannel[currentNeighborhood] || seedsByChannel['GENERAL'] || [];
      setMessages(prev => {
        const existingIds = new Set(prev.map((m: Message) => m.id));
        const newSeeds = channelSeeds.filter(s => !existingIds.has(s.id));
        return [...newSeeds, ...prev].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });
    }
  }, [loading, currentNeighborhood]);

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
    const isQuestion = p.includes('?') || p.includes('cómo') || p.includes('qué') || p.includes('sabéis') || p.includes('dónde');
    const isHelpRequest = p.includes('ayuda') || p.includes('no sé') || p.includes('funciona');
    const isGreeting = p.includes('hola') || p.includes('buenos días') || p.includes('buenas');

    const selectedNeighbor = virtualNeighbors[Math.floor(Math.random() * virtualNeighbors.length)];
    setIsTyping(selectedNeighbor.full_name);

    const delay = 2000 + Math.random() * 2000;

    setTimeout(async () => {
      let finalContent = "";
      try {
        const aiRes = await getAssistantResponse(originalPrompt || "", currentNeighborhood, selectedNeighbor.full_name);
        finalContent = aiRes.text;
        if (isReplyTo && !finalContent.includes(isReplyTo)) {
          finalContent = `@${isReplyTo} ${finalContent}`;
        }
      } catch (e) {
        finalContent = isReplyTo ? `@${isReplyTo} ¡Qué razón tienes! El barrio está cambiando mucho.` : "¡Qué buen día para charlar por aquí!";
      }

      const mockMsg: Message = {
        id: `sim-${Date.now()}-${selectedNeighbor.id}`,
        user_id: selectedNeighbor.id,
        content: finalContent,
        user_metadata: { full_name: selectedNeighbor.full_name, avatar_url: selectedNeighbor.avatar_url },
        neighborhood: currentNeighborhood,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, mockMsg]);
      setIsTyping(null);
      playSound('msg');

      const localKey = `forum_pers_v2_${currentNeighborhood}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      localStorage.setItem(localKey, JSON.stringify([...existing, mockMsg].slice(-80)));
    }, delay);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % tickerMessages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const playSound = (type: 'msg' | 'buzz') => {
    if (isMuted) return;
    const sound = type === 'msg' ? msgSound : buzzSound;
    sound.currentTime = 0;
    sound.play().catch(e => console.warn('Audio playback blocked:', e));
  };

  useEffect(() => {
    fetchMessages();
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
          const filtered = prev.filter(m => !(m.id.toString().startsWith('temp-') && m.content === newMsg.content && m.user_id === newMsg.user_id));
          return [...filtered, newMsg];
        });

        if (newMsg.user_id !== user?.id && !newMsg.id.toString().startsWith('sim-')) {
          if (newMsg.content.includes('<<ZUMBIDO>>')) {
            playSound('buzz');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
          } else {
            playSound('msg');
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

      const localKey = `forum_pers_v2_${currentNeighborhood}`;
      const localPersistence = JSON.parse(localStorage.getItem(localKey) || '[]');

      const combined = [...(data || []), ...localPersistence];
      const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());

      const sorted = unique.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(sorted);
      fetchActiveUsers(sorted);
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
    setActiveUsers(uniqueUsers.slice(0, 12));
  };

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Imagen demasiado grande (Máx 5MB)');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !imageFile) return;

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      user_id: user?.id || 'anon',
      content: newMessage,
      user_metadata: {
        full_name: user?.user_metadata?.full_name || 'Vecino Anónimo',
        avatar_url: user?.user_metadata?.avatar_url
      },
      neighborhood: currentNeighborhood,
      created_at: new Date().toISOString(),
      image_url: selectedImage || undefined
    };

    setMessages(prev => [...prev, tempMsg]);
    const messageToSend = newMessage;
    setNewMessage('');
    setSelectedImage(null);

    generateVirtualMessage(user?.user_metadata?.full_name?.split(' ')[0] || 'Vecino', messageToSend);

    try {
      let publicUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `forum-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('forum-images').upload(fileName, imageFile);
        if (!uploadError) {
          const { data } = supabase.storage.from('forum-images').getPublicUrl(fileName);
          publicUrl = data.publicUrl;
        }
      }

      await safeSupabaseInsert('forum_messages', {
        user_id: user?.id,
        content: messageToSend,
        user_metadata: {
          full_name: user?.user_metadata?.full_name || 'Vecino Anónimo',
          avatar_url: user?.user_metadata?.avatar_url
        },
        neighborhood: currentNeighborhood,
        image_url: publicUrl
      });
      setImageFile(null);
      await addPoints(5, 1);
    } catch (e) { console.error(e); }
  };

  const quickEmojis = ['👋', '😂', '😎', '😮', '😢', '😡'];

  return (
    <div className={`flex h-[calc(100vh-80px)] font-sans transition-all duration-300 ${isShaking ? 'shake' : ''} bg-[#f8fafc] dark:bg-[#0f172a]`} onClick={unlockAudio}>

      {/* Sidebar: Premium Glassmorphism */}
      <div className="hidden md:flex w-80 flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-[#e2e8f0] dark:border-white/5 z-10 overflow-hidden">
        {/* User Profile Header */}
        <div className="p-8 bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#1d4ed8] text-white rounded-br-[40px] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-white/20 p-1 backdrop-blur-md border border-white/30 shadow-inner">
              <img src={user?.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user?.id}`} className="w-full h-full object-cover rounded-xl" alt="avatar" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Perfil Vecinal</p>
              <h3 className="text-lg font-black tracking-tight truncate">{user?.user_metadata?.full_name?.split(' ')[0] || 'Vecino'}</h3>
              <div className="flex items-center gap-1.5 mt-1 bg-white/20 px-2 py-0.5 rounded-full w-fit backdrop-blur-md">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black tracking-widest uppercase">Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* Channel Selector */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Canales Destacados</h4>
            <div className="space-y-2">
              {[
                { id: 'GENERAL', label: 'General', icon: 'public', desc: 'Charla libre' },
                { id: 'PREPPERS', label: 'Seguridad', icon: 'shield', desc: 'Avisos y ayuda' },
                { id: 'EMPLEO', label: 'Empleo', icon: 'work', desc: 'Ofertas Activas' },
                { id: 'ENCUENTROS', label: 'Citas', icon: 'volunteer_activism', desc: 'First Dates Local ❤️' }
              ].map(chan => (
                <button
                  key={chan.id}
                  onClick={() => startTransition(() => setCurrentNeighborhood(chan.id))}
                  className={`w-full flex items-center gap-4 p-3.5 rounded-[20px] transition-all duration-300 group ${currentNeighborhood === chan.id ? 'bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/5' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${currentNeighborhood === chan.id ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50'}`}>
                    <span className="material-symbols-outlined text-xl">{chan.icon}</span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h3 className={`text-xs font-black uppercase tracking-tight ${currentNeighborhood === chan.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>{chan.label}</h3>
                    <p className="text-[9px] text-slate-400 font-bold truncate">{chan.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Jobs Mini-Card */}
          <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-[28px] border border-slate-200/50 dark:border-white/5">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#3b82f6] mb-4">Empleo Hoy</h2>
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 border-l-2 border-blue-500 pl-3">
                <p>🛵 Repartidor/a Paquetería</p>
                <p className="text-[9px] opacity-60 font-medium">Llamar: 622 11 00 22</p>
              </div>
            </div>
          </div>

          {/* Active Neighbors Grid */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Vecinos Online</h4>
            <div className="grid grid-cols-4 gap-3">
              {activeUsers.slice(0, 12).map((u, i) => (
                <div key={i} className="relative group cursor-pointer" title={u.full_name}>
                  <div className="size-11 rounded-[14px] bg-slate-200 dark:bg-slate-800 p-0.5 border border-slate-200/50 dark:border-white/5 shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <img src={u.avatar_url || `https://i.pravatar.cc/150?u=${u.id}`} className="size-full rounded-[12px] object-cover" alt="" />
                    <span className={`absolute -bottom-1 -right-1 size-3.5 border-2 border-white dark:border-slate-900 rounded-full ${u.status === 'online' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#0f172a] relative">
        {/* Modern Header */}
        <div className="h-24 px-8 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <span className="material-symbols-outlined text-2xl">
                {currentNeighborhood === 'GENERAL' ? 'public' :
                  currentNeighborhood === 'PREPPERS' ? 'shield' :
                    currentNeighborhood === 'EMPLEO' ? 'work' :
                      currentNeighborhood === 'APOYO' ? 'volunteer_activism' : 'forum'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{currentNeighborhood === 'APOYO' ? '💜 Apoyo y Bienestar' : currentNeighborhood}</h2>
              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>En vivo • {messages.length} mensajes</span>
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMine = msg.user_id === user?.id;
              const isBuzz = msg.content.includes('<<ZUMBIDO>>');

              if (isBuzz) {
                return (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} key={msg.id} className="flex justify-center my-10">
                    <div className="bg-white dark:bg-slate-800 px-8 py-4 rounded-[28px] shadow-2xl border-2 border-blue-50 dark:border-blue-900/20 flex items-center gap-4 animate-bounce">
                      <span className="material-symbols-outlined text-blue-500 text-3xl">vibration</span>
                      <div className="text-left">
                        <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest">Alerta de Barrio</span>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                          {isMine ? 'Has enviado un zumbido' : `${msg.user_metadata?.full_name?.split(' ')[0]} te ha zumbado`}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="shrink-0 pt-1">
                      <div className={`size-11 rounded-[16px] overflow-hidden border-2 shadow-sm transition-all group-hover:scale-110 ${isMine ? 'border-primary' : 'border-white dark:border-slate-800'}`}>
                        <img src={msg.user_metadata?.avatar_url || `https://i.pravatar.cc/100?u=${msg.user_id}`} className="size-full object-cover" alt="" />
                      </div>
                    </div>

                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`px-5 py-4 relative shadow-lg text-sm md:text-base leading-relaxed ${isMine
                        ? 'bg-gradient-to-br from-primary to-blue-600 text-white rounded-[24px] rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-[24px] rounded-tl-none border border-slate-100 dark:border-white/5 shadow-slate-200/50 dark:shadow-black/20'
                        }`}>
                        {msg.image_url && (
                          <div className="mb-4 rounded-2xl overflow-hidden border border-white/20">
                            <img src={msg.image_url} alt="Adjunto" className="w-full h-auto max-h-[400px] object-cover rounded-xl" />
                          </div>
                        )}
                        {!isMine && <p className="text-[10px] font-black uppercase tracking-widest text-[#3b82f6] mb-1.5 opacity-90">{msg.user_metadata?.full_name}</p>}
                        <p className="font-semibold tracking-tight leading-snug">{msg.content}</p>
                        <div className={`flex items-center gap-2 mt-2.5 ${isMine ? 'text-white/60' : 'text-slate-400'}`}>
                          <span className="text-[9px] font-black uppercase tracking-tighter">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && <span className="material-symbols-outlined text-[14px]">done_all</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-slate-400 ml-16 text-[11px] font-black uppercase tracking-widest animate-pulse">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              {isTyping} está escribiendo...
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-8 py-8 bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-white/5 z-20">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar py-1">
                {quickEmojis.map(emoji => (
                  <button key={emoji} type="button" onClick={() => { setNewMessage(prev => prev + emoji); inputRef.current?.focus(); }} className="text-3xl hover:scale-150 transition-all opacity-80 hover:opacity-100">{emoji}</button>
                ))}
              </div>
              <button type="button" onClick={sendBuzz} className="flex items-center gap-2.5 px-6 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/30 font-black uppercase tracking-widest text-[11px] shadow-sm transform hover:scale-105 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-xl">vibration</span>
                <span>ZUMBIDO</span>
              </button>
            </div>

            <div className="flex items-end gap-5">
              <div className="flex-1 relative bg-slate-50 dark:bg-white/5 rounded-[32px] border-2 border-slate-100 dark:border-white/5 focus-within:border-blue-500/50 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onFocus={() => { if (messages.length === 0) unlockAudio(); }}
                  placeholder={`Di algo en ${currentNeighborhood}...`}
                  className="w-full bg-transparent border-none px-8 py-5 focus:ring-0 text-base font-bold text-slate-800 dark:text-white"
                />
                <div className="absolute right-4 bottom-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`size-12 flex items-center justify-center rounded-2xl ${selectedImage ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary'}`}
                  >
                    <span className="material-symbols-outlined text-2xl">image</span>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>
              </div>

              <button
                type="submit"
                disabled={!newMessage.trim() && !imageFile}
                className="size-16 rounded-[28px] bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-90 transition-all duration-300 transform group"
              >
                <span className="material-symbols-outlined text-3xl font-black group-hover:translate-x-1 transition-transform">send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Forum;
