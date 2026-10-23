
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseInsert } from '../services/dataHandler';
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

const CHANNEL = 'first_date';

const SPOTS = [
  {
    name: 'Balcó del Mediterrani',
    desc: 'Vistas al mar al atardecer — imprescindible',
    icon: '🌅',
    mood: 'Romántico',
    color: 'from-orange-400 to-rose-400',
  },
  {
    name: 'Amfiteatre Romà',
    desc: 'Historia y magia junto al mar',
    icon: '🏛️',
    mood: 'Cultural',
    color: 'from-amber-400 to-orange-400',
  },
  {
    name: 'Rambla Nova',
    desc: 'Paseo, terrazas y ambiente',
    icon: '🌳',
    mood: 'Tranquilo',
    color: 'from-emerald-400 to-teal-400',
  },
  {
    name: 'Port Esportiu',
    desc: 'Restaurantes frente a los barcos',
    icon: '⛵',
    mood: 'Gastro',
    color: 'from-blue-400 to-sky-400',
  },
  {
    name: 'Plaça de la Font',
    desc: 'Ambiente animado, terrazas y copas',
    icon: '🍷',
    mood: 'Animado',
    color: 'from-purple-400 to-violet-400',
  },
  {
    name: 'Parc del Francolí',
    desc: 'Natural y tranquilo para pasear',
    icon: '🌿',
    mood: 'Natural',
    color: 'from-green-400 to-emerald-400',
  },
];

// Virtual users for First Date
const virtualDateUsers = [
  { id: 'fd1', full_name: 'Alba M.', avatar_url: 'https://i.pravatar.cc/150?u=albafd' },
  { id: 'fd2', full_name: 'Marc T.', avatar_url: 'https://i.pravatar.cc/150?u=marcfd' },
  { id: 'fd3', full_name: 'Laia V.', avatar_url: 'https://i.pravatar.cc/150?u=laiafd' },
  { id: 'fd4', full_name: 'Jordi R.', avatar_url: 'https://i.pravatar.cc/150?u=jordifd' },
  { id: 'fd5', full_name: 'Núria K.', avatar_url: 'https://i.pravatar.cc/150?u=nuriafd' },
  { id: 'fd6', full_name: 'Alex P.', avatar_url: 'https://i.pravatar.cc/150?u=alexfd' },
];

// Seed messages coherent with first date context
const seedMessages: Message[] = [
  {
    id: 'fd-seed-1',
    user_id: 'fd1',
    content: '💕 ¡Hola! ¿Alguien se anima a un café en la Part Alta este sábado por la mañana? El tiempo va a ser perfecto.',
    user_metadata: { full_name: 'Alba M.', avatar_url: 'https://i.pravatar.cc/150?u=albafd' },
    neighborhood: CHANNEL,
    created_at: new Date(Date.now() - 1000 * 3600 * 3).toISOString(),
  },
  {
    id: 'fd-seed-2',
    user_id: 'fd2',
    content: '@Alba M. ¡Me apunto! ¿El Cafè de l\'Acadèmia? Tienen una terraza genial en la Part Alta.',
    user_metadata: { full_name: 'Marc T.', avatar_url: 'https://i.pravatar.cc/150?u=marcfd' },
    neighborhood: CHANNEL,
    created_at: new Date(Date.now() - 1000 * 3600 * 2.5).toISOString(),
  },
  {
    id: 'fd-seed-3',
    user_id: 'fd3',
    content: '🌅 Propuesta: quedada en el Balcó del Mediterrani mañana a las 18:30h. El atardecer de octubre es espectacular. ¿Alguien se suma?',
    user_metadata: { full_name: 'Laia V.', avatar_url: 'https://i.pravatar.cc/150?u=laiafd' },
    neighborhood: CHANNEL,
    created_at: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
  },
  {
    id: 'fd-seed-4',
    user_id: 'fd4',
    content: '@Laia V. ¡Cuánto me gusta ese rincón! El mejor sitio de Tarragona para conocer a alguien. Me apunto 🙋‍♂️',
    user_metadata: { full_name: 'Jordi R.', avatar_url: 'https://i.pravatar.cc/150?u=jordifd' },
    neighborhood: CHANNEL,
    created_at: new Date(Date.now() - 1000 * 3600 * 1.5).toISOString(),
  },
  {
    id: 'fd-seed-5',
    user_id: 'fd5',
    content: '🏛️ Recomiendo el plan "ruta romana + vermut". Anfiteatro + Museo + L\'Àncora al Port. ¡Perfecta primera cita de 3h! 🍸',
    user_metadata: { full_name: 'Núria K.', avatar_url: 'https://i.pravatar.cc/150?u=nuriafd' },
    neighborhood: CHANNEL,
    created_at: new Date(Date.now() - 1000 * 3600 * 1).toISOString(),
  },
  {
    id: 'fd-seed-6',
    user_id: 'fd6',
    content: '⚠️ Recordad: siempre quedadas en lugares públicos y bien iluminados. ¡Aquí en Tarragona tenemos los mejores! 😊 #FirstDateTGN',
    user_metadata: { full_name: 'Alex P.', avatar_url: 'https://i.pravatar.cc/150?u=alexfd' },
    neighborhood: CHANNEL,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

// Scripted conversation threads for first date context
const firstDateThreads = [
  [
    { who: 'Alba M.', text: '☕ ¿Alguien recomienda un buen café con encanto en la Part Alta? Busco algo con terraza o vista especial.' },
    { who: 'Marc T.', text: 'El Cafè de l\'Acadèmia tiene vistas a la bajada medieval. Muy fotogénico. 📸' },
    { who: 'Laia V.', text: '@Marc T. ¡Ese lo adoro! También está el Bar Pax para un vermut más informal.' },
  ],
  [
    { who: 'Jordi R.', text: '🌅 Hay algo más bonito que el Balcó del Mediterrani al atardecer? Pregunto para una persona.' },
    { who: 'Núria K.', text: '¡Nada! Es el sitio número 1 de TGN para una primera cita. Infalible. 💕' },
    { who: 'Alex P.', text: '@Jordi R. Lleva flores del Mercado de la Part Alta y triunfarás. ¡Seguro!' },
  ],
  [
    { who: 'Laia V.', text: '🍽️ ¿Alguien ha ido a cenar al L\'Àncora recientemente? ¿Sigue estando tan bien?' },
    { who: 'Marc T.', text: 'Fui hace 2 semanas. El arroz marinero está increíble y las vistas al port son perfectas. Precio razonable para una cita especial.' },
  ],
  [
    { who: 'Alba M.', text: '🏛️ Plan cultural de tarde: Amfiteatre → Circ Romà → Plaça de la Font → copas. Queda una tarde entera muy completa. ¿Algún voluntario? 😄' },
    { who: 'Alex P.', text: '¡Ese plan es top! Yo lo hice el mes pasado con una persona que conocí aquí. Fue genial. 💚' },
  ],
];

const msgSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
msgSound.volume = 0.2;

const FirstDate: React.FC = () => {
  const { user, addPoints } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [activeSpot, setActiveSpot] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadIndexRef = useRef(0);
  const stepIndexRef = useRef(0);
  const [isPending, startTransition] = React.useTransition();

  const playMsg = () => {
    msgSound.currentTime = 0;
    msgSound.play().catch(() => {});
  };

  // Load seed messages on mount
  useEffect(() => {
    setMessages(seedMessages);
    setLoading(false);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Threaded conversation engine
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.35) {
        const currentThread = firstDateThreads[threadIndexRef.current % firstDateThreads.length];
        const step = currentThread[stepIndexRef.current];
        if (!step) {
          threadIndexRef.current = (threadIndexRef.current + 1) % firstDateThreads.length;
          stepIndexRef.current = 0;
          return;
        }
        const neighbor = virtualDateUsers.find(v => v.full_name === step.who) ||
          { id: `fd-${step.who}`, full_name: step.who, avatar_url: `https://i.pravatar.cc/150?u=${step.who.split(' ')[0].toLowerCase()}fd` };

        setIsTyping(neighbor.full_name);
        setTimeout(() => {
          const msg: Message = {
            id: `fdthread-${Date.now()}-${neighbor.id}`,
            user_id: neighbor.id,
            content: step.text,
            user_metadata: { full_name: neighbor.full_name, avatar_url: neighbor.avatar_url },
            neighborhood: CHANNEL,
            created_at: new Date().toISOString(),
          };
          setMessages(prev => [...prev, msg]);
          setIsTyping(null);
          playMsg();
          stepIndexRef.current++;
        }, 2000 + Math.random() * 2000);
      }
    }, 18000 + Math.random() * 8000);

    return () => clearInterval(interval);
  }, []);

  const generateVirtualReply = async (promptText: string) => {
    const selected = virtualDateUsers[Math.floor(Math.random() * virtualDateUsers.length)];
    setIsTyping(selected.full_name);
    setTimeout(async () => {
      try {
        const res = await getAssistantResponse(promptText, CHANNEL, selected.full_name);
        const msg: Message = {
          id: `fdsim-${Date.now()}`,
          user_id: selected.id,
          content: res.text,
          user_metadata: { full_name: selected.full_name, avatar_url: selected.avatar_url },
          neighborhood: CHANNEL,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, msg]);
        setIsTyping(null);
        playMsg();
      } catch {
        setIsTyping(null);
      }
    }, 2000 + Math.random() * 2000);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMsg: Message = {
      id: `fdtemp-${Date.now()}`,
      user_id: user?.id || 'anon',
      content: newMessage,
      user_metadata: {
        full_name: user?.user_metadata?.full_name || 'Vecino/a',
        avatar_url: user?.user_metadata?.avatar_url,
      },
      neighborhood: CHANNEL,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMsg]);
    const toSend = newMessage;
    setNewMessage('');

    generateVirtualReply(toSend);

    try {
      await safeSupabaseInsert('forum_messages', {
        user_id: user?.id,
        content: toSend,
        user_metadata: {
          full_name: user?.user_metadata?.full_name || 'Vecino/a',
          avatar_url: user?.user_metadata?.avatar_url,
        },
        neighborhood: CHANNEL,
      });
      await addPoints(5, 1);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-[#1a0a0f] dark:via-[#1a0a14] dark:to-[#1a0f0a]">

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-orange-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 px-6 md:px-12 py-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">💕</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                Tarragona · Encuentros
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-3">
              First Date<br />
              <span className="text-white/80">Tarragona</span>
            </h1>
            <p className="text-white/80 text-sm font-semibold max-w-lg">
              Conoce gente y descubre los mejores rincones de Tarragona para una primera cita. 
              Siempre en lugares públicos, siempre con respeto. 🌅
            </p>

            {/* Safety notice */}
            <div className="mt-6 flex items-start gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-4 max-w-2xl">
              <span className="material-symbols-outlined text-white/80 text-xl shrink-0 mt-0.5">shield_person</span>
              <p className="text-[11px] font-semibold text-white/90 leading-relaxed">
                <strong>Normas de uso:</strong> Solo propón quedadas en lugares públicos y concurridos · 
                No compartas datos personales (teléfono, dirección) · 
                Siempre bajo tu propia responsabilidad · 
                Ante cualquier problema, usa el botón SOS.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full gap-0 md:gap-8 px-0 md:px-8 py-0 md:py-8">

        {/* Left sidebar: Spots */}
        <div className="hidden md:flex w-80 flex-col gap-6 shrink-0">
          {/* Spots recomendados */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] border border-rose-100 dark:border-white/5 p-6 shadow-xl shadow-rose-500/5">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">location_on</span>
              Spots de Primera Cita
            </h3>
            <div className="space-y-3">
              {SPOTS.map((spot, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveSpot(activeSpot === i ? null : i);
                    if (inputRef.current) {
                      setNewMessage(`💕 ¿Alguien se anima a quedar en ${spot.name}? `);
                      inputRef.current.focus();
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all group ${
                    activeSpot === i
                      ? 'bg-gradient-to-r ' + spot.color + ' text-white shadow-lg'
                      : 'hover:bg-rose-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-2xl shrink-0">{spot.icon}</span>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-black uppercase tracking-tight truncate ${activeSpot === i ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                      {spot.name}
                    </p>
                    <p className={`text-[9px] font-semibold truncate ${activeSpot === i ? 'text-white/80' : 'text-slate-400'}`}>
                      {spot.desc}
                    </p>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md mt-1 inline-block ${
                      activeSpot === i ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-500 dark:bg-rose-900/20'
                    }`}>
                      {spot.mood}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] border border-rose-100 dark:border-white/5 p-6 shadow-xl shadow-rose-500/5">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 mb-4">Activos Ahora</h3>
            <div className="flex flex-wrap gap-2">
              {virtualDateUsers.map((u, i) => (
                <div key={i} className="relative" title={u.full_name}>
                  <div className="size-10 rounded-xl overflow-hidden border-2 border-rose-200 dark:border-rose-900/30 shadow-sm hover:scale-110 transition-transform">
                    <img src={u.avatar_url} className="size-full object-cover" alt="" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border border-white dark:border-slate-900 rounded-full"></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl md:rounded-[28px] border border-rose-100 dark:border-white/5 shadow-2xl shadow-rose-500/5 overflow-hidden min-h-[70vh]">

          {/* Chat header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <span className="material-symbols-outlined text-lg">favorite</span>
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Chat de Quedadas</h2>
                <p className="text-[9px] font-bold text-rose-400 flex items-center gap-1">
                  <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  {virtualDateUsers.length + 1} personas online · Solo lugares públicos
                </p>
              </div>
            </div>
            {/* Mobile spots button */}
            <div className="flex md:hidden gap-2 overflow-x-auto no-scrollbar">
              {SPOTS.slice(0, 3).map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setNewMessage(`💕 ¿Alguien a ${s.name}? `); inputRef.current?.focus(); }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-500 text-[10px] font-black"
                >
                  <span>{s.icon}</span>
                  <span>{s.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isMine = msg.user_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="shrink-0 pt-1">
                        <div className={`size-9 rounded-[12px] overflow-hidden border-2 shadow-sm group-hover:scale-110 transition-all ${isMine ? 'border-rose-400' : 'border-white dark:border-slate-700'}`}>
                          <img src={msg.user_metadata?.avatar_url || `https://i.pravatar.cc/100?u=${msg.user_id}`} className="size-full object-cover" alt="" />
                        </div>
                      </div>
                      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        {!isMine && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 mb-1 ml-1">
                            {msg.user_metadata?.full_name}
                          </span>
                        )}
                        <div className={`px-4 py-3 rounded-[20px] text-sm leading-relaxed shadow-md ${
                          isMine
                            ? 'bg-gradient-to-br from-rose-500 to-orange-400 text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-rose-50 dark:border-white/5'
                        }`}>
                          <p className="font-semibold tracking-tight">{msg.content}</p>
                          <p className={`text-[9px] font-black mt-1.5 ${isMine ? 'text-white/60' : 'text-slate-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-slate-400 ml-12 text-[10px] font-black uppercase tracking-widest">
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-rose-300 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-rose-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-1 bg-rose-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
                {isTyping} está escribiendo...
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="px-4 md:px-6 py-4 border-t border-rose-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/50">
            {/* Quick suggestions */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
              {[
                '💕 ¿Quedamos en el Balcó esta tarde?',
                '☕ ¿Café en la Part Alta?',
                '🌊 Paseo por el Port Esportiu',
                '🍷 Vermut en la Plaça de la Font',
              ].map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setNewMessage(s); inputRef.current?.focus(); }}
                  className="shrink-0 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-xl text-[10px] font-black border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={sendMessage} className="flex items-end gap-3">
              <div className="flex-1 relative bg-slate-50 dark:bg-white/5 rounded-[24px] border-2 border-rose-100 dark:border-white/10 focus-within:border-rose-400/50 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Propón una quedada en un lugar público..."
                  className="w-full bg-transparent border-none px-6 py-4 focus:ring-0 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="size-14 rounded-[20px] bg-gradient-to-br from-rose-500 to-orange-400 text-white flex items-center justify-center shadow-2xl shadow-rose-500/30 hover:scale-110 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-2xl font-black">send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstDate;
