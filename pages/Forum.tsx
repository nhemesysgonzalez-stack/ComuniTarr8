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

const Forum: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentNeighborhood, setCurrentNeighborhood] = useState(user?.user_metadata?.neighborhood || 'GENERAL');
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sound Effects
  const msgSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2346/2346-preview.mp3');
  const buzzSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

  const playSound = (type: 'msg' | 'buzz') => {
    if (isMuted) return;
    if (type === 'buzz') {
      buzzSound.currentTime = 0;
      buzzSound.play().catch(e => console.log('Audio blocked', e));
      if (navigator.vibrate) navigator.vibrate(200);
    } else {
      msgSound.currentTime = 0;
      msgSound.play().catch(e => console.log('Audio blocked', e));
    }
  };

  const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '👋', '🎉', '🏘️', '🚨', '🗑️', '🐕', '🌳', '🔧'];

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel(`forum_${currentNeighborhood}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'forum_messages',
        filter: `neighborhood=eq.${currentNeighborhood}`
      },
        payload => {
          const newMsg = payload.new as Message;
          setMessages(prev => {
            // Solo sonar si es nuevo y no es mío
            if (newMsg.user_id !== user?.id) {
              if (newMsg.content.includes('<<ZUMBIDO>>')) {
                playSound('buzz');
              } else {
                playSound('msg');
              }
            }
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const sendBuzz = async () => {
    // Enviar zumbido
    if (loading) return;
    try {
      await safeSupabaseInsert('forum_messages', {
        user_id: user?.id,
        content: '🔔 ¡ZUMBIDO!',
        user_metadata: {
          full_name: user?.user_metadata?.full_name || 'Alguien',
          avatar_url: user?.user_metadata?.avatar_url
        },
        neighborhood: currentNeighborhood
      });
      // Insertar marcador oculto <<ZUMBIDO>> en el contenido para lógica
      // Nota: Para simplificar, usamos el texto visible '🔔 ¡ZUMBIDO!' + lógica de detección
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
      setNewMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] font-sans">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl md:text-3xl font-black dark:text-white tracking-tighter uppercase leading-none mb-1">FORO VECINAL</h2>
          <button
            onClick={() => setShowNeighborhoods(!showNeighborhoods)}
            className="flex items-center gap-1 group"
          >
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] group-hover:underline">
              {currentNeighborhood}
            </span>
            <span className="material-symbols-outlined text-xs text-primary font-black">keyboard_arrow_down</span>
          </button>
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
            {[
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100'
            ].map((url, i) => (
              <img key={i} src={url} className="size-8 rounded-xl border-4 border-white dark:border-surface-dark shadow-lg object-cover" alt="User" />
            ))}
            <div className="size-8 rounded-xl bg-primary text-white text-[10px] font-black flex items-center justify-center border-4 border-white dark:border-surface-dark shadow-lg">+12</div>
          </div>
          <p className="text-[10px] hidden md:block text-gray-400 font-bold ml-2">(Selector de barrio funcional)</p>
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

          {loading && messages.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 opacity-20">
              <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
              <p className="text-xs font-black uppercase tracking-widest">Conectando...</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.user_id === user?.id;
              const isBuzz = msg.content.includes('🔔 ¡ZUMBIDO!') || msg.content.includes('<<ZUMBIDO>>');

              return (
                <motion.div
                  initial={{ opacity: 0, x: isMe ? 20 : -20, scale: isBuzz ? 1.2 : 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  key={msg.id}
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
            })
          )}
        </div>

        {/* Input */}
        <div className="p-6 md:p-10 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 shrink-0">
          <form onSubmit={sendMessage} className="flex gap-4 max-w-5xl mx-auto">
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Escribe algo a ${currentNeighborhood}...`}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-[30px] px-8 py-5 font-bold dark:text-white focus:ring-4 ring-primary/10 transition-all outline-none pr-16"
              />
              <button
                type="button"
                onClick={sendBuzz}
                className="absolute right-14 text-yellow-500 hover:text-yellow-600 hover:scale-125 transition-all"
                title="Enviar Zumbido"
              >
                <span className="material-symbols-outlined font-black">vibration</span>
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`absolute right-6 transition-colors ${showEmojiPicker ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
              >
                <span className="material-symbols-outlined font-black">add_reaction</span>
              </button>
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
        </div>
      </div>
      );
};

      export default Forum;
