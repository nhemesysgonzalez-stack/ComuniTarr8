
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';
import { logActivity } from '../services/activityLogger';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  const tickerMessages = [
    { user: 'Pau T.', text: 'El sol de hoy es engañoso, ¡hace un frío que pela! ☀️🧣' },
    { user: 'Mireia R.', text: 'Philip Glass anoche fue de otro planeta... ¡qué nivel! 🎻' },
    { user: 'Joan B.', text: 'Acabo de ver pasar los primeros caballos por la Rambla. ¡Emoción! 🐎' },
    { user: 'Carme S.', text: '¿Quién viene a la limpieza de la Part Alta a las 12:00? 🧹' }
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

  // Simulation Logic: Seed messages about today Saturday 17th
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      // 15% chance of a virtual message every 40s if no real activity
      if (Math.random() < 0.15) {
        generateVirtualMessage();
      }
    }, 40000);

    return () => clearInterval(simulationInterval);
  }, []);

  const generateVirtualMessage = (isReplyTo?: string) => {
    const neighbor = virtualNeighbors[Math.floor(Math.random() * virtualNeighbors.length)];
    const scripts = [
      "¿Habéis visto qué sol hace hoy? Ideal para los preparativos de mañana. ☀️",
      "Ojo que esta noche ya no se puede aparcar en la Rambla por los Tres Tombs. 🐎",
      "Sigo impresionado con el concierto de anoche. ¡Qué suerte tener esto en TGN! 🎻",
      "¿Alguien sabe si el mercadillo del Foro está muy lleno hoy? 🛒",
      "Voy de camino a la limpieza de la Part Alta. ¡Traed guantes! 🧹",
      "¡Qué ganas de que sea mañana! Los niños están emocionados con los caballos. 🐎",
      "¿Alguna recomendación para comer hoy por el Serrallo? 🐟"
    ];

    const replyScripts = [
      `¡Totalmente de acuerdo, ${isReplyTo}!`,
      `¿En serio ${isReplyTo}? No lo sabía...`,
      `¡Qué bueno saludarte ${isReplyTo}!`,
      `Opino lo mismo que tú.`,
      `Gracias por la info, me sirve mucho.`
    ];

    setIsTyping(neighbor.full_name);
    setTimeout(() => {
      setIsTyping(null);
      const content = isReplyTo
        ? `@${isReplyTo} ${replyScripts[Math.floor(Math.random() * replyScripts.length)]}`
        : scripts[Math.floor(Math.random() * scripts.length)];

      const mockMsg: Message = {
        id: `sim-${Date.now()}`,
        user_id: neighbor.id,
        content: content,
        user_metadata: { full_name: neighbor.full_name, avatar_url: neighbor.avatar_url },
        neighborhood: currentNeighborhood,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, mockMsg]);
      playSound('msg');
    }, 3000);
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

        // If a real user sends a message, trigger a simulated reply from a virtual neighbor
        if (newMsg.user_id === user?.id) {
          setTimeout(() => {
            generateVirtualMessage(user?.user_metadata?.full_name?.split(' ')[0] || 'Vecino');
          }, 5000 + Math.random() * 5000);
        }

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
    if (topicId === 'nastic-semis') {
      setNewMessage('¡Qué resaca emocional del partido de anoche! ⚽ ¿Creéis que llegaremos a la final?');
    } else if (topicId === 'sol-sabado') {
      setNewMessage('¡Por fin sol! ☀️ ¿Alguien para ir a la limpieza de la Part Alta ahora a las 12:00?');
    } else if (topicId === 'tres-tombs') {
      setNewMessage('Mañana los Tres Tombs. ¡Recordad quitar los coches o se los lleva la grúa! 🐎');
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const trendingTopics = [
    {
      id: 'sol-sabado',
      title: '☀️ Sábado de Sol',
      description: 'Tras la lluvia, Tarragona brilla. Planes para hoy.',
      participating: 28
    },
    {
      id: 'nastic-semis',
      title: '⚽ El Sueño Grana',
      description: 'Debate sobre la alineación para el próximo partido.',
      participating: 54
    },
    {
      id: 'tres-tombs',
      title: '🐎 Tres Tombs (Mañana)',
      description: 'Restricciones de tráfico y horarios del desfile.',
      participating: 31
    }
  ];

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] font-sans transition-transform duration-100 ${isShaking ? 'translate-x-2 -translate-y-2' : ''}`} onClick={unlockAudio}>
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 relative overflow-hidden">
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
            >
              🌍 Canal General
            </button>
            <button
              onClick={() => startTransition(() => setCurrentNeighborhood(user?.user_metadata?.neighborhood || 'GENERAL'))}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${currentNeighborhood !== 'GENERAL' && currentNeighborhood !== 'EMPLEO' && currentNeighborhood !== 'SEGURIDAD' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
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
              onClick={() => startTransition(() => setCurrentNeighborhood('SEGURIDAD'))}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${currentNeighborhood === 'SEGURIDAD' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-gray-100 text-orange-600 hover:bg-orange-50 dark:bg-gray-800 dark:text-orange-400'}`}
            >
              🛡️ Seguridad
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
                Sábado 17 Enero 2026 - Charlas del Barrio
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
              <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">mood</span>
              </button>
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default Forum;
