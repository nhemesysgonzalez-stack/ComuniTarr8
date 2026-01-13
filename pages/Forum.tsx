
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

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
  const [showWelcome, setShowWelcome] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  const tickerMessages = [
    { user: 'Pau T.', text: '¿Alguien va al mercadillo de Campclar hoy? Busco fruta fresca. 🍎' },
    { user: 'Mireia R.', text: '¡Solo 5 días para los Tres Tombs! Qué ganas de ver los caballos. 🐎' },
    { user: 'Joan B.', text: 'Recordad pasar por la EMT a renovar la tarjeta antes del viernes.' },
    { user: 'Carme S.', text: 'Ya tengo la preinscripción del peque hecha, súper fácil online.' }
  ];

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

    // Suscribirse a nuevos mensajes en tiempo real
    const channel = supabase
      .channel('public:forum_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'forum_messages',
        filter: `neighborhood=eq.${currentNeighborhood}`
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);

        // Notificacion sonora si no es nuestro propio mensaje
        if (newMsg.user_id !== user?.id) {
          if (newMsg.content.includes('<<ZUMBIDO>>')) {
            playSound('buzz');
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
    if (activeUsers.length > 0) return;
    const seen = new Set();
    const uniqueUsers: any[] = [];
    [...msgs].reverse().forEach(m => {
      if (m.user_id && !seen.has(m.user_id)) {
        seen.add(m.user_id);
        uniqueUsers.push({
          id: m.user_id,
          avatar_url: m.user_metadata?.avatar_url,
          full_name: m.user_metadata?.full_name
        });
      }
    });
    setActiveUsers(uniqueUsers.slice(0, 5));
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const sendBuzz = async () => {
    if (loading) return;
    try {
      playSound('buzz');
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

    try {
      const { success } = await safeSupabaseInsert('forum_messages', {
        user_id: user?.id,
        content: newMessage,
        user_metadata: {
          full_name: user?.user_metadata?.full_name || 'Vecino Anónimo',
          avatar_url: user?.user_metadata?.avatar_url
        },
        neighborhood: currentNeighborhood
      });

      if (!success) throw new Error('Falló envío');
      await addPoints(5, 1);
      setNewMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleTopicClick = (topicId: string) => {
    if (topicId === 'tortell-debate') {
      setNewMessage('Para mí el mejor Tortell de Tarragona es el de... y la nata tiene que ser... ');
    } else if (topicId === 'frio-polar') {
      setNewMessage('¿Qué consejos dais para proteger las plantas del balcón con este frío? ');
    } else if (topicId === 'prepper-tgn') {
      setNewMessage('¿Cuáles son los mejores consejos para estar preparados ante una alerta química en Tarragona? ');
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const trendingTopics = [
    {
      id: 'tortell-debate',
      title: '🥐 El Gran Debate del Tortell',
      description: '¿Con o sin fruta? ¿Nata natural o trufa? ¡Vota el mejor de Tarragona!',
      participating: 15
    },
    {
      id: 'frio-polar',
      title: '❄️ Consejos contra el Frío',
      description: 'Cómo proteger las tuberías y plantas esta semana.',
      participating: 8
    },
    {
      id: 'prepper-tgn',
      title: '🛡️ Seguridad Petroquímica',
      description: 'Protocolos PLASEQTA y consejos de preparación vecinal.',
      participating: 21
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] font-sans" onClick={unlockAudio}>
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-3xl font-black dark:text-white tracking-tighter uppercase leading-none">FORO VECINAL</h2>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-lg">
              <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">{activeUsers.length || 1} ONLINE</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => startTransition(() => setCurrentNeighborhood('GENERAL'))}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentNeighborhood === 'GENERAL' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
            >
              🌍 Canal General
            </button>
            <button
              onClick={() => startTransition(() => setCurrentNeighborhood(user?.user_metadata?.neighborhood || 'GENERAL'))}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentNeighborhood !== 'GENERAL' && currentNeighborhood !== 'EMPLEO' && currentNeighborhood !== 'SEGURIDAD' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
            >
              🏠 Mi Barrio ({user?.user_metadata?.neighborhood || 'MI ZONA'})
            </button>
            <button
              onClick={() => startTransition(() => setCurrentNeighborhood('EMPLEO'))}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentNeighborhood === 'EMPLEO' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-gray-100 text-emerald-600 hover:bg-emerald-50 dark:bg-gray-800 dark:text-emerald-400'}`}
            >
              💼 Empleo
            </button>
            <button
              onClick={() => startTransition(() => setCurrentNeighborhood('SEGURIDAD'))}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentNeighborhood === 'SEGURIDAD' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-gray-100 text-orange-600 hover:bg-orange-50 dark:bg-gray-800 dark:text-orange-400'}`}
            >
              🛡️ Seguridad/Preppers
            </button>
            <button
              onClick={() => setShowNeighborhoods(!showNeighborhoods)}
              className="size-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"
            >
              <span className="material-symbols-outlined">map</span>
            </button>
          </div>
        </div>

        {/* Trending Widget - Desktop Only */}
        <div className="hidden lg:flex gap-6">
          {trendingTopics.map(topic => (
            <motion.div
              key={topic.id}
              whileHover={{ scale: 1.02 }}
              className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl w-60 flex flex-col justify-between"
            >
              <div>
                <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">{topic.title}</h4>
                <p className="text-[9px] font-bold text-amber-900/60 leading-tight">{topic.description}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[8px] font-black text-amber-700">{topic.participating} VECINOS</span>
                <button
                  onClick={() => handleTopicClick(topic.id)}
                  className="text-[8px] font-black uppercase bg-white px-2 py-1 rounded-md shadow-sm text-amber-700 hover:bg-amber-500 hover:text-white transition-colors"
                >
                  Participar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Trending Widget */}
      <div className="lg:hidden bg-amber-500/5 p-4 border-b border-amber-500/10 flex gap-4 overflow-x-auto shrink-0 no-scrollbar">
        {trendingTopics.map(topic => (
          <div
            key={topic.id}
            onClick={() => handleTopicClick(topic.id)}
            className="min-w-[220px] bg-white dark:bg-gray-800 p-3 rounded-xl border border-amber-500/20 shadow-sm shrink-0 active:scale-95 transition-transform"
          >
            <h4 className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">{topic.title}</h4>
            <p className="text-[8px] font-bold text-gray-500 line-clamp-1">{topic.description}</p>
          </div>
        ))}
      </div>

      {/* Neighborhood Selector Dropdown Overlay */}
      <AnimatePresence>
        {showNeighborhoods && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setShowNeighborhoods(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-[40px] shadow-2xl p-8 w-full max-w-sm"
            >
              <h3 className="text-xl font-black dark:text-white uppercase mb-6 text-center">Explorar otros barrios</h3>
              <div className="grid grid-cols-1 gap-2">
                {NEIGHBORHOODS.map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      startTransition(() => {
                        setCurrentNeighborhood(n);
                        setShowNeighborhoods(false);
                      });
                    }}
                    className={`w-full px-6 py-4 rounded-2xl text-xs font-bold transition-all text-center ${currentNeighborhood === n ? 'bg-primary text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800 dark:text-white hover:bg-gray-100'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 bg-gray-50/50 dark:bg-background-dark/30 custom-scrollbar">

        {/* Featured / Seeded Messages for General Debate */}
        {currentNeighborhood === 'GENERAL' && (
          <div className="space-y-6 mb-12">
            <div className="flex justify-center">
              <span className="px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200">
                Debate Destacado: Día de Reyes
              </span>
            </div>

            <div className="flex justify-start gap-4">
              <div className="size-10 rounded-2xl bg-amber-500 flex items-center justify-center font-black text-white shrink-0 shadow-lg shadow-amber-500/20">MT</div>
              <div className="flex flex-col items-start max-w-[80%]">
                <span className="text-[10px] font-black uppercase mb-1">Maru Torres</span>
                <div className="p-4 bg-white dark:bg-surface-dark rounded-2xl rounded-tl-none border-l-4 border-amber-500 shadow-sm text-sm">
                  ¡Feliz día de Reyes! 👑 Abro debate: ¿Cuál es el mejor Tortell de Tarragona? Yo voto por la <b>Pastisseria Conde</b>, ¡la nata es increíble!
                </div>
              </div>
            </div>

            <div className="flex justify-start gap-4">
              <div className="size-10 rounded-2xl bg-blue-500 flex items-center justify-center font-black text-white shrink-0 shadow-lg shadow-blue-500/20">JR</div>
              <div className="flex flex-col items-start max-w-[80%]">
                <span className="text-[10px] font-black uppercase mb-1">Joan Rebull</span>
                <div className="p-4 bg-white dark:bg-surface-dark rounded-2xl rounded-tl-none border-l-4 border-blue-500 shadow-sm text-sm">
                  ¡Uff! Yo prefiero la <b>Pastisseria Velvet</b>. Pero lo importante... ¿sois de nata natural o de la artificial? Yo si no es nata de verdad, ni lo pruebo 😤
                </div>
              </div>
            </div>

            <div className="flex justify-center py-4">
              <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
              <span className="px-4 text-[8px] font-black text-gray-400 uppercase tracking-widest">Conversación en directo</span>
              <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
            <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Cargando conversación...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="size-20 bg-primary/10 rounded-[30px] flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary">chat_bubble</span>
            </div>
            <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">¡Sé el primero en hablar!</h3>
            <p className="text-gray-500 font-medium max-w-xs mx-auto">Comparte algo con tus vecinos de {currentNeighborhood}. ¡Gana 5 ComuniPoints por mensaje!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.user_id === user?.id;
            const isBuzz = msg.content.includes('<<ZUMBIDO>>');

            if (isBuzz) {
              return (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={msg.id}
                  className="flex justify-center my-6"
                >
                  <div className="bg-red-500 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-500/30 animate-bounce">
                    🔔 Zumbido de {msg.user_metadata?.full_name}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                initial={{ opacity: 0, x: isMine ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="shrink-0">
                    <div className="size-10 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-black text-xs overflow-hidden shadow-sm">
                      {msg.user_metadata?.avatar_url ? (
                        <img src={msg.user_metadata.avatar_url} alt="" className="size-full object-cover" />
                      ) : (
                        msg.user_metadata?.full_name?.charAt(0) || '?'
                      )}
                    </div>
                  </div>
                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black dark:text-white uppercase tracking-wider">{msg.user_metadata?.full_name}</span>
                      <span className="text-[9px] font-bold text-gray-400">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`p-4 rounded-[24px] font-medium text-sm leading-relaxed shadow-sm ${isMine ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-surface-dark dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-800'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 md:p-10 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark shrink-0">
        {/* Mobile Community Ticker (Cintillo) */}
        <div className="lg:hidden mb-4 overflow-hidden bg-primary/5 rounded-xl py-2 px-4 flex items-center gap-3 border border-primary/10">
          <span className="material-symbols-outlined text-primary text-sm animate-pulse">forum</span>
          <div className="flex-1 overflow-hidden relative h-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={tickerIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-[10px] font-bold text-gray-500 dark:text-gray-400 absolute inset-0 truncate"
              >
                <span className="text-primary font-black uppercase text-[8px] mr-2">{tickerMessages[tickerIndex].user}:</span>
                {tickerMessages[tickerIndex].text}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <form onSubmit={sendMessage} className="relative max-w-5xl mx-auto flex items-center gap-4">
          <button
            type="button"
            onClick={sendBuzz}
            className="size-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90 group"
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
              placeholder={`Escribe en ${currentNeighborhood}...`}
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 font-bold dark:text-white outline-none ring-primary/20 focus:ring-4 transition-all"
            />
          </div>

          <button
            type="submit"
            className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            disabled={!newMessage.trim()}
          >
            <span className="material-symbols-outlined font-black">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Forum;
