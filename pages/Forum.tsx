import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';
import { motion, AnimatePresence } from 'framer-motion';
import { NEIGHBORHOODS } from '../constants';

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_metadata: any;
  neighborhood: string;
}

// Optimization: Move Audio objects outside the component to prevent re-initialization on every render
const msgSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'); // Notification chime
const buzzSound = new Audio('https://assets.mixkit.co/active_storage/sfx/3142/3142-preview.mp3'); // Impactful Vibration Sound

msgSound.preload = 'auto';
buzzSound.preload = 'auto';
buzzSound.volume = 0.8;
msgSound.volume = 0.5;

// Optimization: Memoized Message Component to prevent list re-renders when typing
const MessageBubble = React.memo(({ msg, isMe }: { msg: Message, isMe: boolean }) => {
  const isBuzz = msg.content.includes('🔔 ¡ZUMBIDO!') || msg.content.includes('<<ZUMBIDO>>');

  return (
    <motion.div
      initial={{ opacity: 0, x: isMe ? 20 : -20, scale: isBuzz ? 1.2 : 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''} ${isBuzz ? 'animate-pulse' : ''}`}
    >
      {!isMe && (
        <img
          src={msg.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${msg.user_metadata?.full_name}`}
          className="size-10 md:size-12 rounded-2xl shadow-lg border-2 border-white dark:border-gray-800 object-cover"
          alt="Avatar"
        />
      )}
      <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : ''}`}>
        {!isMe && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{msg.user_metadata?.full_name}</p>}
        <div className={`p-4 rounded-3xl text-sm font-bold shadow-sm ${isBuzz ? 'bg-yellow-400 text-black border-4 border-yellow-200 shake-animation' : (isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-surface-dark dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-800')}`}>
          {msg.content.replace('<<ZUMBIDO>>', '')}
        </div>
        <p className="text-[9px] font-black text-gray-400/50 uppercase tracking-tighter px-2">
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
});

const Forum: React.FC = () => {
  const { user, addPoints } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentNeighborhood, setCurrentNeighborhood] = useState(user?.user_metadata?.neighborhood || 'GENERAL');
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sound Utility using shared Audio objects
  const playSound = (type: 'msg' | 'buzz') => {
    if (isMuted) return;

    // Attempt to play
    const sound = type === 'buzz' ? buzzSound : msgSound;

    // In some browsers, we need to handle the promise
    sound.currentTime = 0;
    const playPromise = sound.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Playback failed. User interaction might be needed.", error);
      });
    }

    if (type === 'buzz' && navigator.vibrate) {
      // Vibración más potente: 3 ráfagas largas
      navigator.vibrate([300, 100, 300, 100, 300]);
    }
  };

  // Helper to "unlock" audio on first interaction if needed
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

  const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '👋', '🎉', '🏘️', '🚨', '🗑️', '🐕', '🌳', '🔧'];

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    fetchMessages();

    // Setup Presence and PostgreSQL Changes
    const channel = supabase.channel(`forum_presence_${currentNeighborhood}`, {
      config: {
        presence: {
          key: user?.id,
        },
      },
    });

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'forum_messages',
        filter: `neighborhood=eq.${currentNeighborhood}`
      },
        payload => {
          const newMsg = payload.new as Message;
          if (newMsg.user_id !== user?.id) {
            if (newMsg.content.includes('<<ZUMBIDO>>')) {
              playSound('buzz');
              if (Notification.permission === 'granted') {
                new Notification('📳 ¡ZUMBIDO VECINAL!', {
                  body: `${newMsg.user_metadata?.full_name} te ha enviado un zumbido`,
                  icon: '/logo.svg'
                });
              }
            } else {
              playSound('msg');
              if (Notification.permission === 'granted') {
                new Notification(`Nuevo mensaje en ${currentNeighborhood}`, {
                  body: `${newMsg.user_metadata?.full_name}: ${newMsg.content.substring(0, 50)}...`,
                  icon: '/logo.svg'
                });
              }
            }
          }
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUsers = Object.values(state).flat().map((p: any) => ({
          id: p.user_id,
          full_name: p.full_name,
          avatar_url: p.avatar_url
        }));
        // Remove duplicates if same user is in multiple tabs
        const uniqueOnline = onlineUsers.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setActiveUsers(uniqueOnline);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id,
            full_name: user?.user_metadata?.full_name,
            avatar_url: user?.user_metadata?.avatar_url,
            online_at: new Date().toISOString(),
          });
        }
      });

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
    // Si no hay presencia todavía, usamos los autores de los últimos mensajes como fallback
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
      // Optimizacion: sonar localmente de inmediato para feedback instantaneo
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
      await addPoints(10, 2); // Recompensa por interactuar (Zumbido)
    } catch (e) { console.error(e); }
  };

  // Sobrescribir submit para detectar zumbido interno
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { success } = await safeSupabaseInsert('forum_messages', {
        user_id: user?.id,
        content: newMessage, // Si el usuario escribe <<ZUMBIDO>> manualmente funcionará igual
        user_metadata: {
          full_name: user?.user_metadata?.full_name || 'Vecino Anónimo',
          avatar_url: user?.user_metadata?.avatar_url
        },
        neighborhood: currentNeighborhood
      });

      if (!success) throw new Error('Falló envío');
      await addPoints(5, 1); // Recompensa por cada mensaje enviado
      setNewMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] font-sans"
      onClick={unlockAudio} // Unlock audio logic on first click anywhere in the forum
    >
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-3xl font-black dark:text-white tracking-tighter uppercase leading-none">FORO VECINAL</h2>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-lg">
              <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">{activeUsers.length} ONLINE</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentNeighborhood('GENERAL')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentNeighborhood === 'GENERAL' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              🌍 Canal General
            </button>
            <button
              onClick={() => {
                const myNeighborhood = user?.user_metadata?.neighborhood || NEIGHBORHOODS[0];
                setCurrentNeighborhood(myNeighborhood);
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentNeighborhood !== 'GENERAL' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              🏠 Mi Barrio ({user?.user_metadata?.neighborhood || 'Seleccionar'})
            </button>
            <button
              onClick={() => setShowNeighborhoods(!showNeighborhoods)}
              className="size-10 flex items-center justify-center bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200"
            >
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
        </div>

        {/* Mute Button */}
        <button onClick={toggleMute} className="md:hidden p-2 text-gray-400">
          <span className="material-symbols-outlined">{isMuted ? 'volume_off' : 'volume_up'}</span>
        </button>

        {/* Neighborhood Selector Dropdown */}
        <AnimatePresence>
          {showNeighborhoods && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-24 left-8 z-50 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl p-4 w-64 max-h-64 overflow-y-auto custom-scrollbar"
            >
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Cambiar de Barrio</p>
              <div className="space-y-1">
                {NEIGHBORHOODS.map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      setCurrentNeighborhood(n);
                      setShowNeighborhoods(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentNeighborhood === n ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden md:flex items-center gap-4">
          {/* Botón Silenciar Desktop */}
          <button
            onClick={toggleMute}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isMuted ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <span className="material-symbols-outlined text-sm">{isMuted ? 'volume_off' : 'volume_up'}</span>
            {isMuted ? 'Silenciado' : 'Sonido On'}
          </button>

          <div className="flex -space-x-2">
            {activeUsers.length > 0 ? (
              activeUsers.map((u, i) => (
                <img key={u.id} src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.full_name || 'V'}`} className="size-8 rounded-xl border-4 border-white dark:border-surface-dark shadow-lg object-cover" alt="User" title={u.full_name} />
              ))
            ) : (
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl">Chat solitario</div>
            )}
            {messages.length > 10 && <div className="size-8 rounded-xl bg-primary text-white text-[10px] font-black flex items-center justify-center border-4 border-white dark:border-surface-dark shadow-lg">+{Math.max(0, messages.length - activeUsers.length)}</div>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-gray-50/50 dark:bg-background-dark/30 custom-scrollbar"
      >
        <div className="text-center py-4">
          <span className="px-4 py-1.5 bg-gray-200 dark:bg-gray-800 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Conversaciones en {currentNeighborhood}
          </span>
        </div>

        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/10 to-indigo-500/10 border-2 border-primary/20 p-8 rounded-[40px] relative overflow-hidden group mb-10 mx-auto max-w-5xl"
          >
            <button
              type="button"
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 text-primary/40 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined font-black">close</span>
            </button>
            <div className="flex flex-col md:flex-row gap-6 items-start text-left">
              <div className="size-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-primary shadow-xl shrink-0">
                <span className="material-symbols-outlined text-4xl">tips_and_updates</span>
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-xl font-black dark:text-white leading-tight">¡Dale vida al barrio de {currentNeighborhood}!</h3>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-snug">
                  ¿No sabes de qué hablar? Pulsa en cualquiera de estas sugerencias para empezar:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { text: "¿Qué os parece la peatonalización de la calle Canyelles?", icon: 'conversion_path' },
                    { text: "Propuestas para mejorar la limpieza en la Part Baixa", icon: 'cleaning_services' },
                    { text: "¿A qué hora salís mañana para ver entrar a los Reyes al Serrallo?", icon: 'rebase_edit' },
                    { text: "Busco equipo para jugar a pádel en el Nàstic", icon: 'sports_tennis' },
                    { text: "¿Alguien sabe si hay mercado en la Plaza del Fórum mañana?", icon: 'storefront' },
                    { text: "¡He visto un perrito perdido por Sant Pere i Sant Pau!", icon: 'pets' }
                  ].map((tip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewMessage(tip.text)}
                      className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-[20px] text-[10px] font-black uppercase text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white transition-all text-left shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[20px] shrink-0">{tip.icon}</span>
                      <span className="line-clamp-2 leading-tight">{tip.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {loading && messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 opacity-20">
            <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
            <p className="text-xs font-black uppercase tracking-widest">Conectando...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMe={msg.user_id === user?.id}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-6 md:p-10 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 shrink-0">
        <form onSubmit={sendMessage} className="flex gap-4 max-w-5xl mx-auto">
          <div className="flex-1 relative flex items-center">
            <div className="absolute left-4 flex items-center gap-1">
              <button
                type="button"
                onClick={sendBuzz}
                className="size-10 flex items-center justify-center text-yellow-500 hover:text-yellow-600 hover:scale-125 transition-all bg-yellow-500/10 rounded-full"
                title="Enviar Zumbido"
              >
                <span className="material-symbols-outlined font-black text-[20px]">vibration</span>
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`size-10 flex items-center justify-center transition-colors rounded-full ${showEmojiPicker ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <span className="material-symbols-outlined font-black text-[20px]">add_reaction</span>
              </button>
            </div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={window.innerWidth < 768 ? "Escribe..." : `Escribe algo a ${currentNeighborhood}...`}
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-[30px] pl-28 pr-6 py-5 font-bold dark:text-white focus:ring-4 ring-primary/10 transition-all outline-none"
            />
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full right-0 mb-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl p-4 grid grid-cols-5 gap-2 w-64 z-50"
                >
                  {COMMON_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmoji(emoji)}
                      className="size-10 flex items-center justify-center text-xl hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
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
            className="size-[62px] md:size-[68px] bg-primary text-white rounded-[30px] shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newMessage.trim() || loading}
          >
            <span className="material-symbols-outlined text-[28px] font-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
          </button>
        </form>
        <p className="text-[9px] font-black text-center text-gray-400 uppercase tracking-widest mt-6 opacity-30 tracking-[0.2em]">Fomenta un ambiente positivo en Tarragona</p>
      </div >
    </div >
  );
};

export default Forum;
