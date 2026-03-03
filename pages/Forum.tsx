
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
    { user: 'Admin ComuniTarr', text: '🏢 Oficinas municipales abiertas 08:30h - 14:00h.' },
    { user: 'Meteo TGN', text: '☀️ Lunes despejado 16ºC. ¡Buen inicio de semana!' },
    { user: 'Trànsit TGN', text: '🚗 T-11 entrada Tarragona densa. Precaución. 🚦' },
    { user: 'Tarragona Impulsa', text: '💼 Taller LinkedIn hoy 18h en Tabacalera.' },
    { user: 'Ayuda Mutua', text: '🤝 ¿Necesitas ayuda esta mañana? Publica en APOYO.' }
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
        { who: 'Mireia R.', text: '☕ ¡Buenos días! Menudo tráfico hay hoy para entrar por la T-11. ¿Alguien sabe si hay algún accidente?' },
        { who: 'Joan B.', text: '@Mireia Yo he pasado hace 10 min y estaba parado. Parece que hay obras de mantenimiento cerca de Les Gavarres. 🚧' },
        { who: 'Pau T.', text: '@Mireia @Joan Mejor coged el autobús si podéis, el carril bus está fluyendo bastante bien hoy. 🚌' },
        { who: 'Mireia R.', text: '@Pau @Joan Gracias por el aviso. Pues me desvío por Constantí a ver si gano algo de tiempo.' },
        { who: 'Maria G.', text: '¡Ánimo con el lunes a todos! Yo ya estoy en la oficina con mi segundo café. ☕✨' },
      ],
      [
        { who: 'Luis M.', text: '🏢 ¿Sabéis si la OMAC de la Rambla abre hoy a las 8:30h? Tengo que renovar el padrón.' },
        { who: 'Carme S.', text: '@Luis Sí, hoy lunes retoman el horario normal. Pero pide cita previa por la web o te tocará esperar mucho.' },
        { who: 'Luis M.', text: '@Carme ¡Cierto! Acabo de mirar y hay hueco a las 11:15h. Subiendo solicitud... ¡gracias!' },
        { who: 'Joan B.', text: '@Luis Trae todos los papeles originales, que los lunes están muy estrictos con la burocracia. 😂' },
      ],
      [
        { who: 'Joe R.', text: '💻 ¿Alguien se apunta al taller de LinkedIn que hacen esta tarde en Tarragona Impulsa? Es gratuito.' },
        { who: 'Pau T.', text: '@Joe ¡Yo voy! Me hace falta actualizar el perfil para la búsqueda activa de este mes.' },
        { who: 'Maria G.', text: '@Joe @Pau Yo no puedo ir pero compartid los tips que os den por aquí, por fa. 🙏' },
        { who: 'Joe R.', text: '@Maria ¡Hecho! Pasaremos el resumen del ponente. ¡A por la semana!' },
      ],
    ],
    'APOYO': [
      [
        { who: 'Sandra L.', text: '💜 Hoy he leído que el ciberbullying ha aumentado un 30% entre adolescentes. Como madre, me preocupa mucho. ¿Vuestros hijos usan redes sociales?' },
        { who: 'Elena V.', text: '@Sandra Sí, mi hija tiene 13 años y usa TikTok e Instagram. Intento supervisar pero no es fácil. Le hemos puesto controles parentales.' },
        { who: 'Joan B.', text: '@Sandra @Elena En el cole de mi hijo han dado una charla de "Pantallas Amigas" y fue muy útil. Los niños se quedaron impactados con los ejemplos reales.' },
        { who: 'Nuria P.', text: '@Sandra Como trabajadora social os recomiendo: hablad con vuestros hijos SIN juzgar. Si os dicen algo, no les quitéis el móvil (se cierran). Mejor preguntad: "¿Cómo puedo ayudarte?" 🤝' },
        { who: 'Sandra L.', text: '@Nuria Eso es justo lo que nos dijeron en ANAR (900 20 20 10). Me costó entenderlo pero funciona. Mi hijo ahora me cuenta más cosas.' },
        { who: 'Elena V.', text: '@Sandra Me alegro mucho. Yo todavía estoy aprendiendo. ¿Os parece si organizamos una charla para padres en el CC de Torreforta? Podrían venir de Pantallas Amigas.' },
        { who: 'Joan B.', text: '@Elena ¡Gran idea! Yo puedo hablar con la AMPA del cole para organizar algo conjunto. Así llegamos a más familias.' },
        { who: 'Nuria P.', text: '@Elena @Joan Desde servicios sociales podemos ayudar con la logística. Escribidme al privado y lo coordinamos. 💪 ¡Esto es lo bonito de la comunidad!' },
      ],
      [
        { who: 'Maria G.', text: '🫂 Hoy he acompañado a Don Manuel (el señor del 3ºB) al médico. Tiene 82 años y vive solo desde que falleció su mujer. Se ha emocionado porque nadie le acompañaba desde hacía meses.' },
        { who: 'Carme S.', text: '@Maria Qué bonito lo que haces. La soledad en personas mayores es una epidemia silenciosa. ¿Necesitas ayuda para seguir acompañándole?' },
        { who: 'Maria G.', text: '@Carme Sí, no puedo todos los días. Hoy lunes sí, pero necesitaría que alguien cubriera los miércoles.' },
        { who: 'Elena V.', text: '@Maria Yo tengo los miércoles libres. Me apunto sin dudarlo. ¿Me pasas su dirección por privado? 💛' },
        { who: 'Nuria P.', text: 'Recordad que Cruz Roja Tarragona (977 22 19 07) tiene un programa formal de acompañamiento. Podéis registraros como voluntarias y así tenéis cobertura legal y formación. Lo recomiendo mucho.' },
        { who: 'Maria G.', text: '@Nuria ¡No lo sabía! Les llamo mañana. Gracias Nuria, siempre con la información justa. 🙏 Entre todos hacemos barrio.' },
      ],
      [
        { who: 'Nuria P.', text: '🟣 Recordatorio importante: si conocéis a alguien en situación de violencia de género, el 016 es 100% confidencial y NO aparece en la factura telefónica. También podéis escribir por WhatsApp al 600 000 016.' },
        { who: 'Carme S.', text: '@Nuria Gracias por repetirlo. A veces la gente no lo sabe o cree que es solo para emergencias. Se puede llamar también para pedir orientación.' },
        { who: 'Sandra L.', text: 'En el SIAD de Tarragona (Plaça de la Font, 977 24 47 95) atienden sin cita. Yo fui hace años por una situación complicada y me cambiaron la vida. Sin prejuicios ni burocracia.' },
        { who: 'Elena V.', text: '@Sandra Gracias por compartir algo tan personal. Es muy valiente. Que sepáis que hay también un punto lila en las fiestas y eventos de Tarragona donde se puede pedir ayuda.' },
        { who: 'Nuria P.', text: 'Y para jóvenes: el teléfono ANAR (900 20 20 10) atiende a menores las 24h. Y el 024 es la línea de atención a la conducta suicida. Compartid esta info, puede salvar vidas. 💜' },
      ],
    ],
    'EMPLEO': [
      [
        { who: 'Luis M.', text: '💼 ¿Alguien sabe de trabajo de tarde? Estoy buscando algo en hostelería o comercio, tengo experiencia.' },
        { who: 'Pau T.', text: '@Luis En la sección de Servicios de la app hay 3-4 ofertas nuevas. Un bar en Part Alta busca camarero para mediodías.' },
        { who: 'Joan B.', text: '@Luis También he visto que en el Mercadona del Eixample buscan reponedor, turno de tarde. Pregunta directamente en tienda.' },
        { who: 'Luis M.', text: '@Joan @Pau ¡Gracias a los dos! Mañana me paso por ambos sitios. Este foro es oro, en serio. 🙏' },
        { who: 'Carme S.', text: '@Luis ¡Mucha suerte! Si necesitas que alguien te eche un ojo al currículum, dime. Trabajé en RRHH 10 años. 💪' },
        { who: 'Luis M.', text: '@Carme ¿En serio? Eso sería genial. Te escribo por privado. ¡Qué barrio más majo!' },
      ],
    ],
    'ENCUENTROS': [
      [
        { who: 'Joe R.', text: '🎾 ¿Hay alguien para una partida de pádel este lunes tarde? Se nos ha caído uno del grupo.' },
        { who: 'Pau T.', text: '@Joe ¡Yo! ¿A qué hora? Si es a partir de las 18:30h me va perfecto al salir de la oficina.' },
        { who: 'Joe R.', text: '@Pau Genial, reservo en el Polideportivo del Francolí a las 19:00h. ¡Nos vemos allí!' },
        { who: 'Pau T.', text: '@Joe ¡Hecho! Traigo pelotas nuevas que las mías están ya para jubilarse. 😂' },
        { who: 'Mireia R.', text: 'Yo paso de deporte hoy pero si hacéis una caña rápida después en el Serrallo me apunto. 🍻' },
        { who: 'Joe R.', text: '@Mireia ¡Vendido! Te avisamos cuando acabemos el set. 🙌' },
      ],
    ],
  };

  // Threaded conversation engine
  useEffect(() => {
    const threads = conversationThreads[currentNeighborhood] || conversationThreads['GENERAL'];
    if (!threads || threads.length === 0) return;

    const playNextMessage = () => {
      const currentThread = threads[threadIndexRef.current % threads.length];
      if (!currentThread) return;

      const step = currentThread[stepIndexRef.current];
      if (!step) {
        // Thread finished — move to next thread, reset step
        threadIndexRef.current = (threadIndexRef.current + 1) % threads.length;
        stepIndexRef.current = 0;
        return;
      }

      const neighbor = virtualNeighbors.find(v => v.full_name === step.who) ||
        { id: `v-${step.who}`, full_name: step.who, avatar_url: `https://i.pravatar.cc/150?u=${step.who.split(' ')[0].toLowerCase()}` };

      // Show typing
      setIsTyping(neighbor.full_name);

      const typingDelay = 1500 + Math.random() * 2500;
      setTimeout(() => {
        const msg: Message = {
          id: `thread-${Date.now()}-${neighbor.id}`,
          user_id: neighbor.id,
          content: step.text,
          user_metadata: { full_name: neighbor.full_name, avatar_url: neighbor.avatar_url },
          neighborhood: currentNeighborhood,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, msg]);
        setIsTyping(null);
        playSound('msg');

        // Persist locally
        const localKey = `local_forum_messages_${currentNeighborhood}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        localStorage.setItem(localKey, JSON.stringify([...existing, msg].slice(-60)));

        stepIndexRef.current++;
      }, typingDelay);
    };

    // Fire a message every 8-15 seconds for natural pacing
    const interval = setInterval(() => {
      if (Math.random() < 0.75) {
        playNextMessage();
      }
    }, 8000 + Math.random() * 7000);

    return () => clearInterval(interval);
  }, [currentNeighborhood]);

  // ALWAYS inject seed messages once loading finishes, prepended to whatever exists
  const seedsInjectedRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (!loading && seedsInjectedRef.current !== currentNeighborhood) {
      seedsInjectedRef.current = currentNeighborhood;
      const now = Date.now();

      // Seeds per channel
      const seedsByChannel: Record<string, Message[]> = {
        'GENERAL': [
          { id: 'seed-mon-1', user_id: 'v3', content: '☀️ ¡Buenos días de lunes! Empezamos semana con fuerza. Mucho ánimo en la oficina y en el cole. 💪', user_metadata: { full_name: 'Joan B.', avatar_url: 'https://i.pravatar.cc/150?u=joan' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 60 * 22).toISOString() },
          { id: 'seed-mon-2', user_id: 'v2', content: '☕ Café doble hoy, por favor. El tráfico por la A-7 está imposible esta mañana. ¿Alguien sabe si hay algún accidente?', user_metadata: { full_name: 'Mireia R.', avatar_url: 'https://i.pravatar.cc/150?u=mireia' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 60 * 14).toISOString() },
          { id: 'seed-mon-3', user_id: 'v5', content: '🏢 Recordad que hoy lunes las OMAC abren a las 8:30h. Aprovechad para los trámites que tengáis pendientes.', user_metadata: { full_name: 'Luis M.', avatar_url: 'https://i.pravatar.cc/150?u=luis' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 60 * 8).toISOString() },
          { id: 'seed-mon-4', user_id: 'v6', content: '¡Hoy toca taller de búsqueda de empleo en el Hub TGN! A ver si salen buenas ofertas esta semana. 💼', user_metadata: { full_name: 'Joe R.', avatar_url: 'https://i.pravatar.cc/150?u=joe' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 60 * 3).toISOString() },
        ] as Message[],
        'APOYO': [
          { id: 'seed-apoyo-1', user_id: 'v8', content: '💜 Buenos días. Empezamos la semana recordando que nadie está solo. Si el lunes se te hace cuesta arriba, aquí estamos para escucharnos.', user_metadata: { full_name: 'Sandra L.', avatar_url: 'https://i.pravatar.cc/150?u=sandra' }, neighborhood: 'APOYO', created_at: new Date(now - 1000 * 60 * 45).toISOString() },
          { id: 'seed-apoyo-2', user_id: 'v9', content: '@Sandra Qué importante es eso. Yo hoy empiezo con energía pero sé que hay vecinos pasándolo mal. El SIAD de la Plaça de la Font está abierto hoy de 9 a 14h para quien necesite ayuda. 💪', user_metadata: { full_name: 'Elena V.', avatar_url: 'https://i.pravatar.cc/150?u=elena' }, neighborhood: 'APOYO', created_at: new Date(now - 1000 * 60 * 40).toISOString() },
          { id: 'seed-apoyo-10', user_id: 'v9', content: 'Si alguien necesita acompañamiento para trámites médicos o legales esta semana, tengo libres las tardes de los martes y jueves. ¡Contad conmigo! 🫶', user_metadata: { full_name: 'Elena V.', avatar_url: 'https://i.pravatar.cc/150?u=elena' }, neighborhood: 'APOYO', created_at: new Date(now - 1000 * 60 * 2).toISOString() },
        ] as Message[],
      };

      const channelSeeds = seedsByChannel[currentNeighborhood] || seedsByChannel['GENERAL'] || [];
      // Prepend seeds to existing messages (they appear at the top as older messages)
      setMessages(prev => {
        const existingIds = new Set(prev.map((m: Message) => m.id));
        const newSeeds = channelSeeds.filter(s => !existingIds.has(s.id));
        return [...newSeeds, ...prev];
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

    // Improved detection logic
    const isQuestion = p.includes('?') || p.includes('cómo') || p.includes('como') || p.includes('qué') || p.includes('que ') || p.includes('sabéis') || p.includes('sabeis') || p.includes('donde') || p.includes('dónde');
    const isHelpRequest = p.includes('ayuda') || p.includes('primera vez') || p.includes('no sé') || p.includes('no se') || p.includes('funciona') || p.includes('hacer') || p.includes('hace');
    const isGreeting = p.includes('hola') || p.includes('buenos días') || p.includes('buenas tardes') || p.includes('saludos') || p.includes('buenas');

    // Priority for Mediator if it's a question or app help
    const isAssistant = isReplyTo && (isQuestion || isHelpRequest || p.includes('@mediador') || p.includes('mediador'));

    // Base initiation scripts (Monday 2 Mar / Monday morning rush)
    let scripts = [
      "☀️ ¡Feliz lunes vecinos! Empezamos semana con fuerza. ¿Mucho tráfico en la A-7 hoy? 🚗",
      "Mañana despejada, ideal para retomar la rutina. ¿Alguien va hoy a la OMAC? 🏛️",
      "Recordad: las oficinas municipales ya han abierto. Sede electrónica activa 24h. 💻",
      "¿Quién viene al taller de LinkedIn de esta tarde en la Tabacalera? 📈",
      "¿Alguien sabe si el bache de Gasòmetre está ya arreglado? He visto brigadas. 🚧",
      "¡Qué buena energía para empezar marzo! Vamos a por el lunes. 💪"
    ];

    // Base reply scripts
    let replyScripts = [
      `¡Totalmente, ${isReplyTo}! A por la semana con energía. ☕`,
      `¡Buen lunes, ${isReplyTo}! Disfruta del sol matinal. ☀️`,
      `¡Pasa rápido la semana, ${isReplyTo}! Ánimo con el trabajo/estudios. 😄`,
      `Yo me apunto al taller si vas, ${isReplyTo}. Nos vemos en la Tabacalera.`,
      `Gracias por la info del tráfico, ${isReplyTo}. Me iré por la N-340. 🚗`,
      `¡Qué buena energía para empezar el lunes! Gracias, ${isReplyTo}. 💪`
    ];

    if (currentNeighborhood === 'EMPLEO') {
      scripts = ["¿Alguien sabe de trabajos de tarde en hostelería esta semana? 🍽️", "Empiezo nuevo trabajo hoy lunes. ¡Un poco de ánimo! 🤞"];
      replyScripts = [`¡Mucho ánimo con el nuevo trabajo, ${isReplyTo}!`, `Mira en la sección de Servicios de la app, han puesto ofertas hoy.`];
    } else if (currentNeighborhood === 'APOYO') {
      scripts = [
        "💜 ¿Alguien conoce talleres gratuitos de gestión emocional en Tarragona? Me vendría muy bien.",
        "Hoy he acompañado a una vecina mayor al médico. No tenía a nadie. Estas cosas no deberían pasar. Si alguien necesita compañía, escribid aquí. 🤝",
        "Mi sobrina está sufriendo ciberbullying. ¿Alguien sabe cómo actuar con el colegio? Necesito consejos. 😔",
        "Recordatorio: grupo de apoyo emocional HOY lunes 19:30h en el Centro Cívico. Gratuito y abierto a todos. 🫂",
        "¿Sabíais que el teléfono 024 es la línea de atención a la conducta suicida? Gratuito, 24h. Nunca se sabe cuándo puede hacer falta. 💛",
        "En el SIAD (Plaça de la Font) atienden a mujeres en situación de violencia. Sin cita, sin preguntas. Solo ayuda. 977 24 47 95. Compartid por favor. 🟣",
        "Hoy leí que 1 de cada 4 niños sufre acoso escolar. Como comunidad tenemos que estar atentos. Si veis algo raro, no miréis para otro lado. 🛡️",
        "¿Hay alguna asociación en TGN que trabaje con personas que viven solas? Mi padre se siente muy aislado desde que falleció mi madre. 💙",
        "Cruz Roja Tarragona (977 22 19 07) tiene un programa de acompañamiento para personas mayores solas. Lo recomiendo mucho. ❤️",
        "Propongo que hagamos un grupo de paseo semanal para personas que necesiten hablar o simplemente no estar solas. ¿Os animáis? 🚶‍♀️🚶"
      ];
      replyScripts = [
        `Gracias por compartir esto, ${isReplyTo}. Aquí nadie juzga. 💜`,
        `@${isReplyTo} Qué importante es hablar de esto. Yo pasé por algo parecido y salí adelante con ayuda. ¡No estás sola/o!`,
        `@${isReplyTo} Te mando un abrazo enorme. Si necesitas hablar, aquí estamos. 🫂`,
        `@${isReplyTo} Apuntado el teléfono. Gracias por la información, nunca se sabe cuándo alguien lo puede necesitar.`,
        `@${isReplyTo} Yo me apunto a lo que sea que ayude al barrio. Entre vecinos nos cuidamos. 💪`,
        `@${isReplyTo} Mi hija sufrió bullying y lo superamos juntos. La clave es no callarse. Estamos aquí para lo que necesites.`,
        `@${isReplyTo} Muy valiente por hablar de esto. Ojalá más gente se atreviera. Este canal es un espacio seguro. ❤️`,
        `@${isReplyTo} La Cruz Roja de Tarragona hace un trabajo increíble. También Càritas tiene programas de apoyo: 977 23 99 34.`
      ];
    } else if (currentNeighborhood === 'ENCUENTROS') {
      scripts = [
        "☀️ ¡Feliz martes! ¿Quién se apunta a un café rápido antes de entrar a la oficina? ☕",
        "Busco gente para completar partido de pádel HOY tarde en el polideportivo (19h). 🎾",
        "Lunes superado... ¡ya es martes! ¿Algún plan para desconectar después del trabajo? 💪",
        "¿Quién asistió ayer al taller de LinkedIn? Estuvo genial. 📈",
        "Mañana miércoles mercadillo en la Part Alta, ¿alguien se apunta a ir temprano? 🛒",
        "¡Hola! ¿Hay algún plan tranquilo para este martes noche? 👋"
      ];
      replyScripts = [
        `¡Me apunto al café, ${isReplyTo}! Recordad la avería de agua en Calle Unió...`,
        `Yo juego a pádel si te falta uno hoy martes...`,
        `¡Buenos días! ¿Qué tal la semana? @${isReplyTo}`,
        `¡Nos vemos en el Metropol para la peli! 🎞️ @${isReplyTo}`
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
        // DETECCIÓN DE MENSAJES SIN CONTEXTO (emojis solos, muy cortos)
        const isEmojiOnly = originalPrompt.length <= 3 && /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(originalPrompt);
        const isVeryShort = originalPrompt.trim().length <= 2;

        // Context-aware reply scripts
        let possibleReplies = [];
        if (isGreeting) {
          possibleReplies = [
            `¡Hola, ${isReplyTo}! A por el martes con energía. 💪`,
            `¡Muy buenas! ¿Qué tal la semana? @${isReplyTo}.`,
            `¡Hola ${isReplyTo}! Aquí recuperándonos de la rutina con un café. ☕`,
            `¡Buenos días! Vaya sol hace hoy. ☀️`
          ];
        } else if (isEmojiOnly || isVeryShort) {
          // Respuestas para emojis o mensajes muy cortos
          possibleReplies = [
            `😊 Igualmente, ${isReplyTo}!`,
            `👍 ¡Bien visto!`,
            `¡Jajaja! ${isReplyTo} 😂`,
            `¡Me too! 🙌`,
            `💯 Totalmente de acuerdo.`,
            `❤️ ¡Un abrazo!`
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

      // PERSISTIR SIMULACIÓN LOCAMENTE (Para que no desaparezcan al cambiar de tab)
      const localKey = `local_forum_messages_${currentNeighborhood}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      localStorage.setItem(localKey, JSON.stringify([...existing, mockMsg].slice(-50))); // Guardar últimos 50

      // Occasional chain follow-up
      if (!isChain && !isAssistant && Math.random() < 0.4) {
        setTimeout(() => {
          generateVirtualMessage(neighbor.full_name.split(' ')[0], finalContent, true);
        }, 4000 + Math.random() * 4000);
      }
    }, delay);
  };

  // Always keep the ref updated to latest generateVirtualMessage (fixes stale closure in interval)
  generateVirtualMessageRef.current = generateVirtualMessage;

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

      // Merge with persisted local simulations
      const localKey = `local_forum_messages_${currentNeighborhood}`;
      const localSims = JSON.parse(localStorage.getItem(localKey) || '[]');

      // Combine and sort by date
      const allMessages = [...(data || []), ...localSims].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(allMessages);
      fetchActiveUsers(allMessages);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

    // Optimistic Update with Image
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
    setSelectedImage(null); // Clear preview immediately for UI responsiveness

    // Trigger AI/Neighbor response IMMEDIATELY locally
    generateVirtualMessage(user?.user_metadata?.full_name?.split(' ')[0] || 'Vecino', messageToSend);

    try {
      let publicUrl = null;

      // 1. Upload Image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `forum-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('forum-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          // Try fallback to 'gallery' bucket if 'forum-images' doesn't exist
          const { error: fallbackError } = await supabase.storage
            .from('gallery')
            .upload(fileName, imageFile);

          if (fallbackError) throw fallbackError;

          const { data } = supabase.storage.from('gallery').getPublicUrl(fileName);
          publicUrl = data.publicUrl;
        } else {
          const { data } = supabase.storage.from('forum-images').getPublicUrl(fileName);
          publicUrl = data.publicUrl;
        }
      }

      const { success } = await safeSupabaseInsert('forum_messages', {
        user_id: user?.id,
        content: messageToSend,
        user_metadata: {
          full_name: user?.user_metadata?.full_name || 'Vecino Anónimo',
          avatar_url: user?.user_metadata?.avatar_url
        },
        neighborhood: currentNeighborhood,
        image_url: publicUrl
      });

      if (!success) {
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        throw new Error('Falló envío');
      }

      setImageFile(null); // Clear file state only after successful upload attempt
      await addPoints(5, 1);
      await logActivity('Mensaje Foro', { neighborhood: currentNeighborhood });
    } catch (e) {
      console.error(e);
      alert('Error enviando mensaje.');
    }
  };

  const handleTopicClick = (topicId: string) => {
    if (topicId === 'agenda-finde') {
      setNewMessage('¿Dónde puedo consultar las ofertas de empleo de este lunes? 💼');
    } else if (topicId === 'alerta-viento') {
      setNewMessage('¡Cuidado zonas arboladas! El viento está soplando fuerte. 💨⚠️');
    } else if (topicId === 'gastronomia-vigilia') {
      setNewMessage('Hoy toca potaje de vigilia. ¿Algún restaurante que lo haga rico? 🍲');
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const trendingTopics = [
    {
      id: 'marzo-tgn',
      title: '🗓️ Marzo 2026',
      description: 'Agenda activa en el barrio.',
      participating: 3510
    },
    {
      id: 'empleo-tgn',
      title: '💼 Vacantes Martes',
      description: 'Nuevas ofertas disponibles.',
      participating: 1950
    },
    {
      id: 'metropol-cine',
      title: '🎞️ Cine Metropol',
      description: 'Estreno hoy 20:30h.',
      participating: 2540
    },
    {
      id: 'movilidad-tgn',
      title: '🚗 Tránsito Martes',
      description: 'Estado de accesos A-7/T-11.',
      participating: 2820
    }
  ];

  // Quick Emojis for the "Retro" bar
  const quickEmojis = ['👋', '😂', '😎', '😮', '😢', '😡'];

  return (
    <div className={`flex h-[calc(100vh-80px)] font-sans transition-transform duration-100 ${isShaking ? 'translate-x-2 -translate-y-2' : ''} bg-gray-50 dark:bg-gray-900`} onClick={unlockAudio}>

      {/* Sidebar / Contact List (Desktop: Left, Mobile: Top/Drawer style or simplified) */}
      <div className="hidden md:flex w-80 flex-col bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 z-10">
        {/* User Profile Header (Blue Gradient) */}
        <div className="p-6 bg-gradient-to-b from-blue-400 to-blue-500 text-white rounded-bl-[30px] shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-4">
            <div className="relative">
              <img src={user?.user_metadata?.avatar_url || "/logo.svg"} className="size-14 rounded-full border-2 border-white shadow-md bg-white" alt="Profile" />
              <div className="absolute bottom-0 right-0 size-4 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-lg truncate">{user?.user_metadata?.full_name || 'Vecino'}</h2>
              <div className="flex items-center gap-1 opacity-90 cursor-pointer hover:bg-white/20 px-2 py-0.5 rounded-full transition-colors w-fit">
                <span className="text-[10px] uppercase font-bold tracking-wider">Disponible ▾</span>
              </div>
              <p className="text-[10px] italic opacity-80 mt-1 truncate">"Martes de rutina... 💻"</p>
            </div>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -top-10 -right-10 size-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 size-20 bg-blue-300/20 rounded-full blur-xl"></div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input
              type="text"
              placeholder="Buscar vecinos o grupos..."
              className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full py-2 pl-9 pr-4 text-xs font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            />
          </div>
        </div>

        {/* Group Lists (Accordion Style) */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          {/* GENERAL DISCUSSION */}
          <div className="mb-2">
            <button
              onClick={() => startTransition(() => setCurrentNeighborhood('GENERAL'))}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${currentNeighborhood === 'GENERAL' ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${currentNeighborhood === 'GENERAL' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                <span className="material-symbols-outlined text-lg">public</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className={`text-xs font-black uppercase tracking-wider ${currentNeighborhood === 'GENERAL' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>Discusión General</h3>
                <p className="text-[10px] text-gray-400 font-bold truncate">35 vecinos activos</p>
              </div>
            </button>
          </div>

          {/* SECURITY UPDATES */}
          <div className="mb-2">
            <button
              onClick={() => startTransition(() => setCurrentNeighborhood('PREPPERS'))}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${currentNeighborhood === 'PREPPERS' ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${currentNeighborhood === 'PREPPERS' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                <span className="material-symbols-outlined text-lg">shield</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className={`text-xs font-black uppercase tracking-wider ${currentNeighborhood === 'PREPPERS' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>Seguridad / Preppers</h3>
                <p className="text-[10px] text-gray-400 font-bold truncate">Avisos Viento</p>
              </div>
            </button>
          </div>

          {/* JOB OFFERS */}
          <div className="mb-2">
            <button
              onClick={() => startTransition(() => setCurrentNeighborhood('EMPLEO'))}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${currentNeighborhood === 'EMPLEO' ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${currentNeighborhood === 'EMPLEO' ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                <span className="material-symbols-outlined text-lg">work</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className={`text-xs font-black uppercase tracking-wider ${currentNeighborhood === 'EMPLEO' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>Empleo</h3>
                <p className="text-[10px] text-gray-400 font-bold truncate">Ofertas Primavera</p>
              </div>
            </button>
          </div>

          {/* ENCUENTROS */}
          <div className="mb-2">
            <button
              onClick={() => startTransition(() => setCurrentNeighborhood('ENCUENTROS'))}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${currentNeighborhood === 'ENCUENTROS' ? 'bg-pink-50 dark:bg-pink-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${currentNeighborhood === 'ENCUENTROS' ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                <span className="material-symbols-outlined text-lg">favorite</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className={`text-xs font-black uppercase tracking-wider ${currentNeighborhood === 'ENCUENTROS' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400'}`}>Encuentros</h3>
                <p className="text-[10px] text-gray-400 font-bold truncate">Planes Finde</p>
              </div>
            </button>
          </div>

          {/* APOYO Y BIENESTAR */}
          <div className="mb-2">
            <button
              onClick={() => startTransition(() => setCurrentNeighborhood('APOYO'))}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${currentNeighborhood === 'APOYO' ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${currentNeighborhood === 'APOYO' ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                <span className="material-symbols-outlined text-lg">volunteer_activism</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className={`text-xs font-black uppercase tracking-wider ${currentNeighborhood === 'APOYO' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>Apoyo y Bienestar</h3>
                <p className="text-[10px] text-gray-400 font-bold truncate">Bullying · Violencia · Acompañamiento</p>
              </div>
              <span className="size-5 bg-purple-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">10</span>
            </button>
          </div>

          <div className="px-4 py-2 mt-4">
            <h2 className="text-xl font-black mb-4 text-center">Empleo Martes 3 Mar</h2>
            <ul className="space-y-4 text-xs md:text-sm">
              <li className="p-2 border-b border-gray-100 dark:border-gray-700">
                🍽️ <strong>Camarero/a — Bar Zona Centro</strong>
                <br /><span className="text-gray-500 text-[10px]">📍 Part Alta • Mediodía-Noche • Jornada parcial • 📞 622 11 00 22 (Jordi)</span>
              </li>
              <li className="p-2 border-b border-gray-100 dark:border-gray-700">
                🚴 <strong>Repartidor/a con moto propia</strong>
                <br /><span className="text-gray-500 text-[10px]">📍 Tarragona centro • Contrato temporal • Comisiones • 📞 611 44 55 66 (Ana)</span>
              </li>
              <li className="p-2 border-b border-gray-100 dark:border-gray-700">
                🏠 <strong>Auxiliar Domicilio — Persona Mayor</strong>
                <br /><span className="text-gray-500 text-[10px]">📍 Part Alta / Eixample • Lu-Vi mañanas • 10€/h • 📞 977 44 33 22 (Rosa)</span>
              </li>
              <li className="p-2 border-b border-gray-100 dark:border-gray-700">
                📦 <strong>Mozo Almacén — Polígono Francolí</strong>
                <br /><span className="text-gray-500 text-[10px]">📧 logistica@tgn.es • Incorporación inmediata • 📞 977 55 66 77</span>
              </li>
            </ul>

            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Vecinos Online (5/12)</h4>
            <div className="space-y-2">
              {activeUsers.slice(0, 5).map((u, i) => (
                <div key={i} className="flex items-center gap-2 px-1">
                  <div className="relative">
                    <img src={u.avatar_url || "/logo.svg"} className="size-8 rounded-full bg-gray-200" alt="" />
                    <span className={`absolute -bottom-0.5 -right-0.5 size-2.5 border-2 border-white rounded-full ${u.status === 'online' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate">{u.full_name}</p>
                    <p className="text-[8px] text-gray-400 truncate">{u.status === 'online' ? 'En el barrio' : 'Ocupado'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5] dark:bg-gray-900/50 relative">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 p-4 shadow-sm border-b border-gray-100 dark:border-gray-700 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            {/* Mobile Back / Menu Trigger would go here */}
            <div className={`size-10 rounded-full flex items-center justify-center ${currentNeighborhood === 'APOYO' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'}`}>
              <span className="material-symbols-outlined">
                {currentNeighborhood === 'GENERAL' ? 'public' :
                  currentNeighborhood === 'PREPPERS' ? 'shield' :
                    currentNeighborhood === 'EMPLEO' ? 'work' :
                      currentNeighborhood === 'APOYO' ? 'volunteer_activism' : 'forum'}
              </span>
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-gray-800 dark:text-white uppercase tracking-tight">
                {currentNeighborhood === 'GENERAL' ? 'Discusión General' :
                  currentNeighborhood === 'PREPPERS' ? 'Seguridad y Preppers' :
                    currentNeighborhood === 'APOYO' ? '💜 Apoyo y Bienestar' : currentNeighborhood}
              </h2>
              <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                Actividad reciente: Alta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-blue-500 transition-colors">
              <span className="material-symbols-outlined text-lg">videocam</span>
            </button>
            <button className="size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-blue-500 transition-colors">
              <span className="material-symbols-outlined text-lg">call</span>
            </button>
            <button className="size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 transition-colors">
              <span className="material-symbols-outlined text-lg">more_vert</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
          {/* Date Divider */}
          <div className="flex justify-center my-4">
            <span className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-full text-[10px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest shadow-sm">
              Hoy
            </span>
          </div>

          {messages.map((msg, i) => {
            const isMine = msg.user_id === user?.id;
            const isBuzz = msg.content.includes('<<ZUMBIDO>>');

            if (isBuzz) {
              return (
                <div key={msg.id} className="flex justify-center my-8">
                  <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-[0_5px_20px_rgba(59,130,246,0.15)] border-2 border-blue-100 dark:border-blue-900/30 flex items-center gap-3 animate-bounce">
                    <span className="material-symbols-outlined text-blue-500 text-2xl">vibration</span>
                    <span className="text-xs font-black text-blue-500 uppercase tracking-widest italic">
                      {isMine ? 'Has enviado un zumbido' : `${msg.user_metadata.full_name?.split(' ')[0]} ha enviado un zumbido`}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className="shrink-0 pt-1">
                    <img src={msg.user_metadata?.avatar_url || `https://i.pravatar.cc/100?u=${msg.user_id}`} className="size-8 md:size-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm object-cover" alt="" />
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 md:px-6 md:py-4 relative shadow-sm text-sm leading-relaxed ${isMine
                      ? 'bg-blue-500 text-white rounded-[20px] rounded-tr-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-[20px] rounded-tl-sm border border-gray-100 dark:border-gray-700'
                      }`}>
                      {msg.image_url && (
                        <div className="mb-2 rounded-lg overflow-hidden">
                          <img
                            src={msg.image_url}
                            alt="Adjunto"
                            className="w-full h-auto max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.image_url, '_blank')}
                          />
                        </div>
                      )}
                      {msg.content}
                      <span className={`text-[9px] font-bold block mt-1 ${isMine ? 'text-blue-200/80 text-right' : 'text-gray-400 text-left'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {!isMine && (
                      <span className="text-[9px] font-bold text-gray-400 ml-2 mt-1">{msg.user_metadata?.full_name}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-400 ml-12 text-xs font-bold animate-pulse">
              <span className="material-symbols-outlined text-sm">edit</span>
              {isTyping} está escribiendo...
            </div>
          )}
        </div>

        {/* Input Area (Retro Style) */}
        <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-100 dark:border-gray-700 z-20">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex flex-col gap-3">

            {/* Toolbar: Quick Emojis & Actions */}
            <div className="flex items-center justify-between px-2">
              {/* Quick Emojis (3D Style Imitation) */}
              <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1">
                {quickEmojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { setNewMessage(prev => prev + emoji); inputRef.current?.focus(); }}
                    className="size-8 md:size-10 flex items-center justify-center text-xl md:text-2xl hover:scale-125 transition-transform cursor-pointer drop-shadow-md filter hover:brightness-110 active:scale-95"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="size-8 md:size-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <span className="material-symbols-outlined transform rotate-90">add_reaction</span>
                </button>
              </div>

              {/* Zumbido Button */}
              <button
                type="button"
                onClick={sendBuzz}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 active:scale-95 transition-all text-[10px] md:text-xs font-black uppercase tracking-widest border border-blue-200"
                title="Enviar Zumbido a todos"
              >
                <span className="material-symbols-outlined text-base md:text-lg animate-tada">vibration</span>
                <span className="hidden md:inline">Zumbido</span>
              </button>
            </div>

            {/* Input Field ROW */}
            <div className="flex items-end gap-3">
              <div className="flex-1 relative bg-gray-50 dark:bg-gray-900/50 rounded-[24px] border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onFocus={() => { if (messages.length === 0) unlockAudio(); }}
                  placeholder={`Escribe un mensaje en ${currentNeighborhood === 'PREPPERS' ? 'Seguridad' : 'el canal'}...`}
                  className="w-full bg-transparent border-none px-6 py-3.5 focus:ring-0 text-sm font-medium text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                />
                <div className="absolute right-2 bottom-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 transition-colors rounded-full hover:bg-white/50 ${selectedImage ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-blue-500'}`}
                  >
                    <span className="material-symbols-outlined text-xl">image</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* Image Preview */}
              {selectedImage && (
                <div className="absolute bottom-20 left-4 bg-white p-2 rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="relative">
                    <img src={selectedImage} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => { setSelectedImage(null); setImageFile(null); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:scale-110 transition-transform"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="size-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                <span className="material-symbols-outlined text-xl font-bold fill-current">send</span>
              </button>
            </div>
          </form>

          {/* Mobile Channel Toggles (Visible only on very small screens if sidebar hidden) */}
          <div className="md:hidden mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {/* Simplified mobile nav chips could go here if needed, but we rely on top-level nav for now */}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Forum;
