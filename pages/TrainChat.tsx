
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { safeSupabaseInsert } from '../services/dataHandler';
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

// Train line data
const LINES = [
  {
    id: 'R16',
    label: 'R-16',
    name: 'Tarragona · Reus · Salou',
    color: 'from-red-500 to-orange-500',
    colorSolid: 'bg-red-500',
    stops: ['Tarragona', 'El Morell-Constantí', 'Camp de Tarragona', 'Reus', 'Salou-PortAventura', 'La Pineda', 'Cambrils'],
    freq: 'Cada 30 min',
    status: 'online' as const,
  },
  {
    id: 'R17',
    label: 'R-17',
    name: 'Tarragona · Tortosa',
    color: 'from-blue-500 to-blue-700',
    colorSolid: 'bg-blue-600',
    stops: ['Tarragona', 'L\'Ampolla-l\'Ametlla', 'L\'Aldea-Amposta-Tortosa', 'Ulldecona-Alcanar-Vinaròs'],
    freq: 'Cada 60 min',
    status: 'delayed' as const,
  },
  {
    id: 'R15',
    label: 'R-15',
    name: 'Tarragona · Barcelona',
    color: 'from-emerald-500 to-teal-600',
    colorSolid: 'bg-emerald-500',
    stops: ['Tarragona', 'Altafulla-Tamarit', 'Calafell', 'Vilanova i la G.', 'Sitges', 'El Prat', 'BCN Sants', 'BCN P. Gràcia'],
    freq: 'Cada 30 min',
    status: 'online' as const,
  },
];

// Virtual passengers
const virtualPassengers = [
  { id: 'tr1', full_name: 'Pep V.', avatar_url: 'https://i.pravatar.cc/150?u=pepvagon' },
  { id: 'tr2', full_name: 'Anna R.', avatar_url: 'https://i.pravatar.cc/150?u=annavagon' },
  { id: 'tr3', full_name: 'Miquel F.', avatar_url: 'https://i.pravatar.cc/150?u=miquelvagon' },
  { id: 'tr4', full_name: 'Sara B.', avatar_url: 'https://i.pravatar.cc/150?u=saravagon' },
  { id: 'tr5', full_name: 'Toni G.', avatar_url: 'https://i.pravatar.cc/150?u=tonivagon' },
];

// Thread conversations by line
const trainThreads: Record<string, Array<Array<{ who: string; text: string }>>> = {
  R16: [
    [
      { who: 'Pep V.', text: '🚆 ¡Por fin en el tren! ¿Llegamos a tiempo o hay retraso hoy?' },
      { who: 'Anna R.', text: 'Parece que hoy vamos bien. Salida puntual desde Tarragona 👍' },
      { who: 'Miquel F.', text: 'Sí, sin incidencias de momento. ¿Alguien baja en Reus?' },
    ],
    [
      { who: 'Sara B.', text: '☕ ¿Alguien lleva termito con café? Yo me olvidé el mío hoy y me arrepiento... 😂' },
      { who: 'Toni G.', text: '@Sara jaja, yo sí que llevo. La parada de Reus dura 2 min si quieres pillar algo en la máquina.' },
    ],
    [
      { who: 'Pep V.', text: '🎧 ¿Qué podcast recomendáis para el trayecto Tarragona-Reus? Los 25 minutos se me hacen largos.' },
      { who: 'Anna R.', text: 'Yo llevo semanas con "El Pódcast de la Historia". Muy entretenido.' },
      { who: 'Miquel F.', text: 'Yo escucho Ivoox, tienen cositas de TGN también. Recomiendo "Tarragona Oral History".' },
    ],
  ],
  R17: [
    [
      { who: 'Pep V.', text: '⚠️ Llevo 6 minutos de retraso. ¿Alguien más en la R-17 de las 8:10?' },
      { who: 'Sara B.', text: 'Sí! El tren parado en Ampolla. Dice el revisor que 10 minutitos más.' },
    ],
    [
      { who: 'Anna R.', text: '🌊 Las vistas del delta del Ebro desde el tren no tienen precio. ¡Me encanta este trayecto!' },
      { who: 'Miquel F.', text: '@Anna R. Totalmente de acuerdo. Aunque hoy hay algo de niebla baja. Muy cinematográfico.' },
    ],
  ],
  R15: [
    [
      { who: 'Toni G.', text: '🏙️ ¡A Barcelona! ¿Alguien más va a la reunión de trabajo en Sants?' },
      { who: 'Pep V.', text: 'Yo bajo en Sitges hoy. Reunión con clientes. ¡Suerte en la tuya!' },
    ],
    [
      { who: 'Sara B.', text: '🌅 Las vistas de Altafulla desde el tren son increíbles esta mañana. El castillo con la luz dorada.' },
      { who: 'Anna R.', text: 'Altafulla-Tamarit es mi parada favorita de la R-15. ¡Qué municipio tan bonito!' },
    ],
    [
      { who: 'Miquel F.', text: '⚡ El Wi-Fi del tren hoy funciona bastante bien. Aprovechando para contestar emails.' },
      { who: 'Toni G.', text: '@Miquel Para mí es la primera vez que va bien en semanas, jaja. Aprovéchalo!' },
    ],
  ],
};

const TTL_MINUTES = 30;

const msgSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
msgSound.volume = 0.2;

const TrainChat: React.FC = () => {
  const { user, addPoints } = useAuth();
  const [selectedLine, setSelectedLine] = useState<string>('R16');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadIndexRef = useRef(0);
  const stepIndexRef = useRef(0);

  const activeLine = LINES.find(l => l.id === selectedLine)!;
  const channelKey = `train_chat_${selectedLine}`;

  const playMsg = () => {
    msgSound.currentTime = 0;
    msgSound.play().catch(() => {});
  };

  // Load persisted messages (TTL filtered)
  useEffect(() => {
    const storageKey = `trainchat_${selectedLine}`;
    const raw = JSON.parse(localStorage.getItem(storageKey) || '[]') as (Message & { expiresAt: number })[];
    const now = Date.now();
    const valid = raw.filter(m => m.expiresAt > now);
    localStorage.setItem(storageKey, JSON.stringify(valid));
    setMessages(valid);

    // Inject seed messages for this line if empty
    if (valid.length === 0) {
      const seeds = getSeedMessages(selectedLine);
      setMessages(seeds);
    }

    threadIndexRef.current = 0;
    stepIndexRef.current = 0;
  }, [selectedLine]);

  // Simulate train movement (advance stop every 5 min)
  useEffect(() => {
    const line = LINES.find(l => l.id === selectedLine)!;
    const stops = line.stops;
    const interval = setInterval(() => {
      setCurrentStopIndex(prev => {
        if (prev < stops.length - 1) return prev + 1;
        return 0;
      });
    }, 5 * 60 * 1000); // advance every 5 real minutes
    return () => clearInterval(interval);
  }, [selectedLine]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Thread engine
  useEffect(() => {
    const threads = trainThreads[selectedLine] || trainThreads['R16'];
    const interval = setInterval(() => {
      if (Math.random() < 0.4) {
        const thread = threads[threadIndexRef.current % threads.length];
        const step = thread?.[stepIndexRef.current];
        if (!step) {
          threadIndexRef.current = (threadIndexRef.current + 1) % threads.length;
          stepIndexRef.current = 0;
          return;
        }
        const neighbor = virtualPassengers.find(v => v.full_name === step.who) ||
          { id: `tr-${step.who}`, full_name: step.who, avatar_url: `https://i.pravatar.cc/150?u=${step.who.split(' ')[0].toLowerCase()}vagon` };

        setIsTyping(neighbor.full_name);
        setTimeout(() => {
          const msg: Message = {
            id: `train-${Date.now()}-${neighbor.id}`,
            user_id: neighbor.id,
            content: step.text,
            user_metadata: { full_name: neighbor.full_name, avatar_url: neighbor.avatar_url },
            neighborhood: channelKey,
            created_at: new Date().toISOString(),
          };
          setMessages(prev => [...prev, msg]);
          persistMessage(msg, selectedLine);
          setIsTyping(null);
          playMsg();
          stepIndexRef.current++;
        }, 2000 + Math.random() * 2000);
      }
    }, 16000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, [selectedLine]);

  const persistMessage = (msg: Message, line: string) => {
    const storageKey = `trainchat_${line}`;
    const raw = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const withExpiry = { ...msg, expiresAt: Date.now() + TTL_MINUTES * 60 * 1000 };
    localStorage.setItem(storageKey, JSON.stringify([...raw, withExpiry].slice(-100)));
  };

  const generateVirtualReply = async (promptText: string) => {
    const selected = virtualPassengers[Math.floor(Math.random() * virtualPassengers.length)];
    setIsTyping(selected.full_name);
    setTimeout(async () => {
      try {
        const res = await getAssistantResponse(promptText, channelKey, selected.full_name);
        const msg: Message = {
          id: `trainsim-${Date.now()}`,
          user_id: selected.id,
          content: res.text,
          user_metadata: { full_name: selected.full_name, avatar_url: selected.avatar_url },
          neighborhood: channelKey,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, msg]);
        persistMessage(msg, selectedLine);
        setIsTyping(null);
        playMsg();
      } catch {
        setIsTyping(null);
      }
    }, 1800 + Math.random() * 2000);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMsg: Message = {
      id: `traintemp-${Date.now()}`,
      user_id: user?.id || 'anon',
      content: newMessage,
      user_metadata: {
        full_name: user?.user_metadata?.full_name || 'Pasajero/a',
        avatar_url: user?.user_metadata?.avatar_url,
      },
      neighborhood: channelKey,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMsg]);
    persistMessage(tempMsg, selectedLine);
    const toSend = newMessage;
    setNewMessage('');
    generateVirtualReply(toSend);

    try {
      await addPoints(3, 1);
    } catch {}
  };

  const getSeedMessages = (line: string): Message[] => {
    const lineData = LINES.find(l => l.id === line)!;
    const now = Date.now();
    return [
      {
        id: `train-seed-${line}-1`,
        user_id: 'tr2',
        content: `🚆 Acabo de subir en Tarragona. ¿Alguien más en la ${lineData.label} hacia ${lineData.stops[lineData.stops.length - 1]}?`,
        user_metadata: { full_name: 'Anna R.', avatar_url: 'https://i.pravatar.cc/150?u=annavagon' },
        neighborhood: `train_chat_${line}`,
        created_at: new Date(now - 1000 * 60 * 15).toISOString(),
      },
      {
        id: `train-seed-${line}-2`,
        user_id: 'tr1',
        content: `¡Aquí! Bajando en ${lineData.stops[Math.floor(lineData.stops.length / 2)]}. El tren va puntual hoy. 👌`,
        user_metadata: { full_name: 'Pep V.', avatar_url: 'https://i.pravatar.cc/150?u=pepvagon' },
        neighborhood: `train_chat_${line}`,
        created_at: new Date(now - 1000 * 60 * 12).toISOString(),
      },
      {
        id: `train-seed-${line}-3`,
        user_id: 'tr5',
        content: `⏰ Recordad que este chat es efímero — los mensajes desaparecen en ${TTL_MINUTES} min. ¡Lo que pasa en el vagón, se queda en el vagón! 😄`,
        user_metadata: { full_name: 'Toni G.', avatar_url: 'https://i.pravatar.cc/150?u=tonivagon' },
        neighborhood: `train_chat_${line}`,
        created_at: new Date(now - 1000 * 60 * 8).toISOString(),
      },
    ];
  };

  const getStopProgress = () => {
    const stops = activeLine.stops;
    return ((currentStopIndex) / (stops.length - 1)) * 100;
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">

      {/* Hero Header — RENFE Style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-b border-white/10">
        {/* Animated train track lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent translate-y-2"></div>
          {/* Animated train icon */}
          <div className="absolute top-4 left-0 animate-[trainMove_8s_linear_infinite] text-white/5 text-9xl pointer-events-none select-none">
            🚆
          </div>
        </div>

        <div className="relative z-10 px-6 md:px-12 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full">
                <span className="material-symbols-outlined text-sm">train</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">RENFE · Rodalies</span>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">Chat en vivo · Efímero</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-2">
              🚆 Chat Vagón<br />
              <span className="text-white/60">RENFE Rodalies</span>
            </h1>
            <p className="text-white/60 text-sm font-semibold max-w-lg">
              Chatea con los pasajeros de tu vagón. Los mensajes desaparecen al bajar del tren ({TTL_MINUTES} min). 
              Lo que pasa en el vagón, se queda en el vagón. ✌️
            </p>

            {/* Ephemeral notice */}
            <div className="mt-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 max-w-md">
              <span className="material-symbols-outlined text-amber-400 text-lg">timer</span>
              <p className="text-[11px] font-semibold text-amber-200">
                Chat efímero · Mensajes válidos {TTL_MINUTES} min · Bajo tu responsabilidad
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-0 md:gap-6 px-0 md:px-8 py-0 md:py-6 max-w-7xl mx-auto w-full">

        {/* Left: Line selector + stop indicator */}
        <div className="hidden md:flex w-72 flex-col gap-4 shrink-0">

          {/* Line selector */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 p-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">route</span>
              Selecciona tu Línea
            </h3>
            <div className="space-y-2">
              {LINES.map(line => (
                <button
                  key={line.id}
                  onClick={() => setSelectedLine(line.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all ${
                    selectedLine === line.id
                      ? 'bg-gradient-to-r ' + line.color + ' text-white shadow-xl'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className={`size-10 rounded-xl flex items-center justify-center font-black text-sm ${
                    selectedLine === line.id ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {line.label}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-tight truncate">{line.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[8px] font-black uppercase ${selectedLine === line.id ? 'text-white/80' : 'text-white/40'}`}>
                        {line.freq}
                      </span>
                      <span className={`size-1.5 rounded-full ${line.status === 'online' ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                      <span className={`text-[8px] font-black uppercase ${
                        line.status === 'online'
                          ? (selectedLine === line.id ? 'text-green-200' : 'text-green-400')
                          : (selectedLine === line.id ? 'text-amber-200' : 'text-amber-400')
                      }`}>
                        {line.status === 'online' ? 'Sin incidencias' : '~4 min retraso'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stop progress indicator */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 p-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">location_on</span>
              Paradas · {activeLine.label}
            </h3>
            <div className="relative">
              {activeLine.stops.map((stop, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0 relative">
                  {/* Line connector */}
                  {i < activeLine.stops.length - 1 && (
                    <div className={`absolute left-[9px] top-5 bottom-0 w-0.5 ${i < currentStopIndex ? 'bg-blue-500' : 'bg-white/10'}`}></div>
                  )}
                  <div className={`relative size-4.5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                    i < currentStopIndex
                      ? 'bg-blue-500 border-blue-500'
                      : i === currentStopIndex
                        ? 'bg-white border-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)] animate-pulse'
                        : 'bg-transparent border-white/20'
                  }`}>
                    {i === currentStopIndex && (
                      <div className="size-2 bg-blue-400 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className={`text-[11px] font-black uppercase tracking-tight ${
                      i === currentStopIndex ? 'text-white' : i < currentStopIndex ? 'text-blue-400' : 'text-white/30'
                    }`}>
                      {stop}
                    </p>
                    {i === currentStopIndex && (
                      <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest animate-pulse">← Parada actual</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
                  style={{ width: `${getStopProgress()}%` }}
                />
              </div>
              <p className="text-[9px] text-white/40 font-black uppercase tracking-wider mt-1.5 text-right">
                {Math.round(getStopProgress())}% del trayecto
              </p>
            </div>
          </div>

          {/* Passengers online */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 p-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-3">Pasajeros Online</h3>
            <div className="flex flex-wrap gap-2">
              {virtualPassengers.map((p, i) => (
                <div key={i} className="relative" title={p.full_name}>
                  <div className="size-9 rounded-xl overflow-hidden border border-white/20 shadow-sm hover:scale-110 transition-transform">
                    <img src={p.avatar_url} className="size-full object-cover" alt="" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-green-500 border border-slate-900 rounded-full"></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat */}
        <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl md:rounded-[24px] border border-white/10 overflow-hidden min-h-[70vh] shadow-2xl">

          {/* Chat header */}
          <div className={`flex items-center justify-between px-5 py-4 bg-gradient-to-r ${activeLine.color} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-lg shadow-inner border border-white/30">
                {activeLine.label}
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-tight">{activeLine.name}</h2>
                <p className="text-[10px] font-semibold text-white/70 flex items-center gap-2">
                  <span className={`size-1.5 rounded-full animate-pulse ${activeLine.status === 'online' ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                  {activeLine.status === 'online' ? 'Sin incidencias · ' : '~4 min retraso · '}
                  {activeLine.freq}
                  {' · '}Parada actual: {activeLine.stops[currentStopIndex]}
                </p>
              </div>
            </div>

            {/* Mobile: line selector */}
            <div className="relative z-10 flex md:hidden gap-1">
              {LINES.map(l => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLine(l.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                    selectedLine === l.id ? 'bg-white text-slate-800' : 'bg-white/20 text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map(msg => {
                const isMine = msg.user_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="shrink-0 pt-1">
                        <div className={`size-9 rounded-[12px] overflow-hidden border-2 group-hover:scale-110 transition-all ${
                          isMine ? 'border-blue-400' : 'border-white/10'
                        }`}>
                          <img src={msg.user_metadata?.avatar_url || `https://i.pravatar.cc/100?u=${msg.user_id}`} className="size-full object-cover" alt="" />
                        </div>
                      </div>
                      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        {!isMine && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1 ml-1">
                            {msg.user_metadata?.full_name}
                          </span>
                        )}
                        <div className={`px-4 py-3 rounded-[18px] text-sm leading-relaxed shadow-lg ${
                          isMine
                            ? `bg-gradient-to-br ${activeLine.color} text-white rounded-tr-none`
                            : 'bg-white/10 backdrop-blur-sm text-white rounded-tl-none border border-white/10'
                        }`}>
                          <p className="font-semibold tracking-tight">{msg.content}</p>
                          <p className={`text-[9px] font-black mt-1.5 ${isMine ? 'text-white/60' : 'text-white/40'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' · '}⏳ efímero
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-white/40 ml-12 text-[10px] font-black uppercase tracking-widest">
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
                {isTyping} está escribiendo...
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 md:px-6 py-4 border-t border-white/10 bg-black/20">
            {/* Quick messages */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
              {[
                '🚆 ¿En qué parada estamos?',
                '⚠️ ¿Hay retraso?',
                '🎧 ¿Alguien recomienda podcast?',
                '😅 Este tren siempre va lleno',
              ].map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setNewMessage(s); inputRef.current?.focus(); }}
                  className="shrink-0 px-3 py-1.5 bg-white/10 text-white/70 rounded-xl text-[10px] font-black border border-white/10 hover:bg-white/20 hover:text-white transition-all"
                >
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={sendMessage} className="flex items-end gap-3">
              <div className="flex-1 relative bg-white/10 rounded-[20px] border border-white/10 focus-within:border-blue-500/50 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Habla con los pasajeros de tu vagón..."
                  className="w-full bg-transparent border-none px-5 py-4 focus:ring-0 text-sm font-semibold text-white placeholder-white/30"
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className={`size-13 rounded-[18px] bg-gradient-to-br ${activeLine.color} text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed size-14`}
              >
                <span className="material-symbols-outlined text-2xl font-black">send</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* CSS for train animation */}
      <style>{`
        @keyframes trainMove {
          from { transform: translateX(-200px); }
          to { transform: translateX(calc(100vw + 200px)); }
        }
      `}</style>
    </div>
  );
};

export default TrainChat;
