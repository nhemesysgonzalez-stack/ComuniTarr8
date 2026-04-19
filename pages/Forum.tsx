
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
    { user: 'Admin ComuniTarr', text: '☀️ ¡Feliz Domingo 19 de Abril! Último día del Dixieland Festival y Mercat de Bonavista abierto hasta las 14h.' },
    { user: 'Meteo TGN', text: '🌤️ Domingo primaveral y despejado. Máxima de 23ºC. ¡Disfrutad del aire libre!' },
    { user: 'Agenda TGN', text: '🎺 HOY: Clausura del Dixieland Festival con conciertos en plazas y calles.' },
    { user: 'Bonavista', text: '🧺 Mercat a tope hoy. Recordad el refuerzo de la línea 54 del EMT para llegar.' },
    { user: 'Cultura', text: '🎭 HOY 19h: Espectáculo "Corta el Cable Rojo" en el Palacio de Congresos. ¡Últimas entradas!' }
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
    { id: 'v10', full_name: 'Nuria P.', avatar_url: 'https://i.pravatar.cc/150?u=nuria', status: 'busy' },
    { id: 'v11', full_name: 'Maria P.', avatar_url: 'https://i.pravatar.cc/150?u=mariap', status: 'online' },
    { id: 'v12', full_name: 'Admin', avatar_url: '/logo.svg', status: 'online' },
    { id: 'v13', full_name: 'Carme L.', avatar_url: 'https://i.pravatar.cc/150?u=carmel', status: 'online' },
    { id: 'v14', full_name: 'Andreu T.', avatar_url: 'https://i.pravatar.cc/150?u=andreut', status: 'online' },
    { id: 'v15', full_name: 'Paco V.', avatar_url: 'https://i.pravatar.cc/150?u=pacov', status: 'online' },
    { id: 'v16', full_name: 'Servicios TGN', avatar_url: '/logo.svg', status: 'online' },
    { id: 'v17', full_name: 'Restaurant Sol', avatar_url: 'https://i.pravatar.cc/150?u=restaurantsol', status: 'online' },
    { id: 'v18', full_name: 'Luis G.', avatar_url: 'https://i.pravatar.cc/150?u=luisg', status: 'online' },
    { id: 'v19', full_name: 'Pepe R.', avatar_url: 'https://i.pravatar.cc/150?u=peper', status: 'online' },
    { id: 'v20', full_name: 'Santi G.', avatar_url: 'https://i.pravatar.cc/150?u=santig', status: 'online' },
    { id: 'v21', full_name: 'Marta L.', avatar_url: 'https://i.pravatar.cc/150?u=martal', status: 'online' },
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
        { who: 'Admin', text: '☀️ ¡Buen Domingo 19! Recordad que hoy el mercado de Bonavista está a pleno rendimiento.' },
        { who: 'Pau T.', text: 'Vengo de allí y hay muchísima gente. ¡Aprovechad el solazo!' },
        { who: 'Joan B.', text: 'Yo iré luego a la Part Alta a escuchar algo de Dixieland. Planazo de domingo. 🎺' }
      ],
      [
        { who: 'Joe R.', text: '✅ Las obras de Av. Roma siguen fuertes. Tomad la T-11 si podéis.' },
        { who: 'Maria G.', text: '@Joe ¡Menos mal que avisas! Gracias. 🚗' },
      ],
    ],
    'APOYO': [
      [
        { who: 'Carme L.', text: '¿Alguien que baje al centro y pueda traerme unos medicamentos de la farmacia de guardia?' },
        { who: 'Andreu T.', text: 'Yo voy ahora en la L54, dime por privado qué necesitas Carme y te lo acerco. 👍' },
      ],
      [
        { who: 'Sandra L.', text: 'Hola a todos, estoy organizando una recolecta de ropa de invierno que ya no uséis. 🧥' },
        { who: 'Elena V.', text: '@Sandra ¡Yo tengo varios abrigos! Me apunto.' },
      ],
    ],
    'EMPLEO': [
      [
        { who: 'Servicios TGN', text: 'Actualizadas ofertas para la semana entrante. Domingo 19 Abril. 💼' },
        { who: 'Restaurant Sol', text: 'Buscamos refuerzo extra para hoy domingo al mediodía por el festival. Contactad 600 00 11 22' },
      ],
    ],
    'ENCUENTROS': [
      [
        { who: 'Santi G.', text: 'Si alguien se aburre esta tarde a las 19h, iré a correr por la playa de la Arrabassada. 🏃‍♂️' },
        { who: 'Marta L.', text: '¡Yo me apunto! Necesito mover las piernas. 😊' }
      ],
      [
        { who: 'Nuria P.', text: '¿Algún chico para tomar un café esta tarde-noche después de salir de la oficina?' },
        { who: 'Pau T.', text: '@Nuria ¡Hola! Yo salgo a las 19h, si te va bien nos vemos en Rambla Nova 😉' },
        { who: 'Nuria P.', text: '@Pau ¡Trato hecho! A las 19:30 en el Balcón del Mediterráneo.' },
      ],
    ],
  };

  // Determine weather context for simulation
  const isActuallyRaining = false; // Context for today's TGN weather (Soleado 18ºC)
  const isWomensDay = false;
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
        const localKey = `forum_pers_v8_${currentNeighborhood}`;
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
          // Ayer por la tarde / noche
          { id: 'seed-cloud-98', user_id: 'v10', content: '¿Alguien sabe a qué hora empieza el concierto de clausura del Dixieland hoy domingo?', user_metadata: { full_name: 'Nuria P.', avatar_url: 'https://i.pravatar.cc/150?u=nuria' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 3600 * 20).toISOString() },
          { id: 'seed-cloud-99', user_id: 'v4', content: '@Nuria P. Los principales empiezan a mediodía en la Pl. de la Font.', user_metadata: { full_name: 'Carme S.', avatar_url: 'https://i.pravatar.cc/150?u=carme' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 3600 * 18).toISOString() },
          { id: 'seed-cloud-100', user_id: 'v19', content: 'He visto mucho movimiento en Bonavista, ¿venden flores hoy?', user_metadata: { full_name: 'Pepe R.', avatar_url: 'https://i.pravatar.cc/150?u=peper' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 3600 * 15).toISOString() },

          // Hoy temprano
          { id: 'seed-cloud-101', user_id: 'v3', content: `☀️ ¡Feliz Domingo 19! Día de sol, Dixieland y mercado de los domingos.`, user_metadata: { full_name: 'Joan B.', avatar_url: 'https://i.pravatar.cc/150?u=joan' }, neighborhood: 'GENERAL', created_at: '2026-04-19T08:00:00Z' },
          { id: 'seed-cloud-102', user_id: 'v2', content: '🌸 ¡Buenos días! Un domingo espectacular para disfrutar de Tarragona.', user_metadata: { full_name: 'Mireia R.', avatar_url: 'https://i.pravatar.cc/150?u=mireia' }, neighborhood: 'GENERAL', created_at: '2026-04-19T10:30:00Z' },
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

      const localKey = `forum_pers_v8_${currentNeighborhood}`;
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

      const localKey = `forum_pers_v8_${currentNeighborhood}`;
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

          {/* Trending Topics - Updated Domingo 19 Abril */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Trending Topic</h4>
            <div className="flex flex-wrap gap-2 px-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase">#DixielandTGN</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase">#MercatBonavista</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[10px] font-black uppercase">#TarragonaSona</span>
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
