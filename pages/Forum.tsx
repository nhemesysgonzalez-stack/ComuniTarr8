
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
    { user: 'Admin ComuniTarr', text: '🛍️ ¡HOY! Mercadillo Vecinal en Pl. Fòrum (09h-14h). ¡Ven a vernos!' },
    { user: 'Meteo TGN', text: '☀️ Sábado radiante 16ºC. Perfecto para el mercadillo.' },
    { user: 'Biblioteca TGN', text: '📚 Gran éxito ayer en el Club de Lectura. ¡Gracias a los 18 asistentes!' },
    { user: 'Trànsit TGN', text: '🚗 C/ Unió ya operativa. Tráfico fluido en el centro para las compras.' },
    { user: 'AAVV Sant Pere', text: '📋 Actas de la Asamblea del jueves ya en sección Anuncios. ✅' }
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
        { who: 'Mireia R.', text: '🛍️ ¡Buenos días! Ya estoy en la Pl. Fòrum. ¡Vaya ambientazo hay hoy en el mercadillo!' },
        { who: 'Joan B.', text: '@Mireia ¡Qué bien! Yo bajo en 10 minutos. He guardado un par de libros para donar. 📚' },
        { who: 'Pau T.', text: '@Mireia @Joan Yo pasaré sobre las 11h. ¿Hacemos un vermut luego por allí? 🍸' },
        { who: 'Mireia R.', text: '@Pau ¡Te tomo la palabra! Nos vemos en la zona de las mesas.' },
        { who: 'Maria G.', text: '¡Feliz sábado a todos! Disfrutad del solazo. ☀️✨' },
      ],
      [
        { who: 'Luis M.', text: '🚗 ¿Sabéis si se puede aparcar bien hoy cerca de la Part Alta con lo del mercadillo?' },
        { who: 'Carme S.', text: '@Luis Está complicado, mejor deja el coche en el aparcamiento de la Av. Cataluña y sube andando. Está todo abierto.' },
        { who: 'Luis M.', text: '@Carme ¡Gracias! Pues haré eso. No quiero dar vueltas.' },
        { who: 'Joan B.', text: '@Luis C/ Unió está abierta ya, así que el acceso por ese lado es directo. ✅' },
      ],
      [
        { who: 'Joe R.', text: '⚽ ¿Alguien para un partido rápido de basket esta tarde en el parque de las Granotes?' },
        { who: 'Pau T.', text: '@Joe ¡Cuenta conmigo! Después del vermut del mercadillo me vendrá bien sudar un poco. 😂' },
        { who: 'Maria G.', text: '@Joe @Pau Yo me paso a veros. ¡Dadle duro!' },
        { who: 'Joe R.', text: '@Maria ¡Eso es! A las 17h allí.' },
      ],
    ],
    'APOYO': [
      [
        { who: 'Sandra L.', text: '💜 Buenos días. Hoy jueves me siento un poco abrumada. ¿Cómo gestionáis vosotros el estrés de final de semana?' },
        { who: 'Elena V.', text: '@Sandra Yo intento desconectar en el Club de Lectura de los viernes. Mañana a las 18:30h hay sesión en la Biblioteca, ¿te vienes?' },
        { who: 'Joan B.', text: '@Sandra @Elena Yo camino por la playa del Miracle 20 min al salir. Ayuda mucho a limpiar la cabeza. 🌊' },
        { who: 'Nuria P.', text: '@Sandra Es normal, Sandra. El jueves es el día de máxima fatiga mental. Respira y prioriza. Mañana ya es viernes. 🫂' },
        { who: 'Sandra L.', text: '@Nuria Tienes razón. Me apunto lo del Club de Lectura, Elena. Pásame info por privado.' },
        { who: 'Elena V.', text: '@Sandra ¡Hecho! Es gratuito y los vecinos somos muy majos.' },
        { who: 'Joan B.', text: '@Elena Contad conmigo también. ¡Mañana nos vemos!' },
        { who: 'Nuria P.', text: '@Elena @Joan @Sandra ¡Esto es red vecinal! Si alguien más se siente así, que hable. 💪' },
      ],
      [
        { who: 'Maria G.', text: '🫂 Hoy he acompañado a Don Manuel a la farmacia. Estaba un poco mareado por el calor y preferí no dejarle solo.' },
        { who: 'Carme S.', text: '@Maria Qué buen detalle. Don Manuel es un encanto. ¿Necesita algo más hoy?' },
        { who: 'Maria G.', text: '@Carme De momento está tranquilo en casa. Por cierto, ¿alguien puede acompañarle mañana al Club de Lectura? Le hace ilusión ir.' },
        { who: 'Elena V.', text: '@Maria Yo paso a recogerle a las 18h. Me pilla de camino a la Biblioteca. 💛' },
        { who: 'Nuria P.', text: 'Recordad que tenemos el Círculo de Cuidadores hoy a las 17h para compartir estas experiencias. ¡Os esperamos!' },
        { who: 'Maria G.', text: '@Nuria ¡Allí estaré! Gracias Elena por lo de Don Manuel. Sois grandes.' },
      ],
      [
        { who: 'Nuria P.', text: '🟣 Recordatorio importante: Hoy jueves, el SIAD de la Plaça de la Font atiende sin cita previa hasta las 14h. El 016 está activo 24h.' },
        { who: 'Carme S.', text: '@Nuria Gracias. A veces un recordatorio a tiempo puede cambiar una vida.' },
        { who: 'Sandra L.', text: 'También recordar que el teléfono ANAR (900 20 20 10) atiende a menores que se sientan solos o con problemas en el cole. Pasadlo a los grupos de la AMPA.' },
        { who: 'Elena V.', text: '@Sandra Muy importante esto ahora que hay exámenes cerca y el estrés sube.' },
        { who: 'Nuria P.', text: 'Y el 024 para salud mental. Un jueves gris no tiene por qué ser un jueves solo. 🫂💜' },
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
        { who: 'Joe R.', text: '⚽ ¿Hay alguien para una partida de fútbol sala hoy jueves noche? Se nos ha caído uno del grupo.' },
        { who: 'Pau T.', text: '@Joe ¡Yo! ¿A qué hora? Si es a las 20h me va perfecto, así voy después de cerrar unos temas.' },
        { who: 'Joe R.', text: '@Pau Genial, reservado en el Polideportivo Campclar a las 20:00h. ¡Nos vemos allí!' },
        { who: 'Pau T.', text: '@Joe ¡Hecho! Traigo peto por si acaso. 😂' },
        { who: 'Mireia R.', text: 'Yo después paso por el bar de al lado para la tercer tiempo. ¡Dadle duro! 🍻' },
        { who: 'Joe R.', text: '@Mireia ¡Trato hecho! Te vemos allí.' },
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
          { id: 'seed-thu-1', user_id: 'v3', content: '☀️ ¡Buenos días de jueves! Ánimo que ya casi lo tenemos. ¿Cómo van esas obras por vuestras calles? 💪', user_metadata: { full_name: 'Joan B.', avatar_url: 'https://i.pravatar.cc/150?u=joan' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 60 * 22).toISOString() },
          { id: 'seed-thu-2', user_id: 'v2', content: '☕ Café cuádruple hoy. El jaleo de las obras de C/ Unió me tiene agotada. ¡Mañana por fin acaban!', user_metadata: { full_name: 'Mireia R.', avatar_url: 'https://i.pravatar.cc/150?u=mireia' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 60 * 14).toISOString() },
          { id: 'seed-thu-3', user_id: 'v5', content: '🏢 Recordad: Asamblea Vecinal HOY a las 19:00h en la AAVV Sant Pere. ¡Viene el regidor de barrio!', user_metadata: { full_name: 'Luis M.', avatar_url: 'https://i.pravatar.cc/150?u=luis' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 60 * 8).toISOString() },
          { id: 'seed-thu-4', user_id: 'v6', content: '¡Hoy toca fútbol sala en Campclar! A ver si ganamos el partido de hoy. ⚽', user_metadata: { full_name: 'Joe R.', avatar_url: 'https://i.pravatar.cc/150?u=joe' }, neighborhood: 'GENERAL', created_at: new Date(now - 1000 * 60 * 3).toISOString() },
        ] as Message[],
        'APOYO': [
          { id: 'seed-apoyo-1', user_id: 'v8', content: '💜 Buenos días. Jueves de apoyo mutuo. Si la semana pesa, aquí estamos para soltar carga.', user_metadata: { full_name: 'Sandra L.', avatar_url: 'https://i.pravatar.cc/150?u=sandra' }, neighborhood: 'APOYO', created_at: new Date(now - 1000 * 60 * 45).toISOString() },
          { id: 'seed-apoyo-2', user_id: 'v9', content: '@Sandra Qué importante es eso. Yo hoy tengo el Círculo de Cuidadores a las 17h. Si alguien cuida de mayores soli/a, venid al C.C. Part Alta. Nos ayudamos mucho. 💪', user_metadata: { full_name: 'Elena V.', avatar_url: 'https://i.pravatar.cc/150?u=elena' }, neighborhood: 'APOYO', created_at: new Date(now - 1000 * 60 * 40).toISOString() },
          { id: 'seed-apoyo-10', user_id: 'v9', content: '¿Alguien necesita acompañamiento para la Asamblea de esta noche? Voy en coche y puedo pasar a recoger a alguien. 🫶', user_metadata: { full_name: 'Elena V.', avatar_url: 'https://i.pravatar.cc/150?u=elena' }, neighborhood: 'APOYO', created_at: new Date(now - 1000 * 60 * 2).toISOString() },
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

    // REVISIÓN DE CONTEXTO PARA VECINOS MÁS INTELIGENTES
    const mentionsMercadillo = p.includes('mercadillo') || p.includes('mercado') || p.includes('placa forum') || p.includes('compra');
    const mentionsWeather = p.includes('sol') || p.includes('tiempo') || p.includes('calor') || p.includes('frio') || p.includes('viento');
    const mentionsRain = p.includes('llueve') || p.includes('lluvia') || p.includes('nublado') || p.includes('agua');
    const mentionsFood = p.includes('vermut') || p.includes('cafe') || p.includes('comer') || p.includes('cena');

    // Base initiation scripts (Saturday March 7)
    let scripts = [
      "☀️ ¡Buenos días vecinos! ¿Quién está ya por el mercadillo de la Pl. Fòrum? 🛍️",
      "Qué solecito hace hoy... ideal para pasear por el mercado y tomar algo. ✅",
      "He visto cosas chulísimas en el mercadillo hoy. ¡Corred que vuela todo! ✨",
      "Por fin C/ Unió abierta sin obras. Se agradece para moverse el finde. 🚗",
      "¡Feliz sábado a todos! Disfrutad del barrio. 🥳"
    ];

    // Priority for Weather Change (If user says it's raining)
    if (mentionsRain) {
      scripts = [
        "¡Ostras! ¡Es verdad que se ha puesto a llover! 🌧️",
        "Menudo cambio de tiempo... ¿Recogemos los puestos del mercado? ☂️",
        "Con lo bien que estábamos al sol... ¡A cubierto! 🏃‍♂️",
        "¿Llueve por vuestra zona? Aquí en el centro está cayendo buena."
      ];
    }

    // Base reply scripts
    let replyScripts = [
      `¡Totalmente, ${isReplyTo}! El mercadillo de hoy está nivel Dios. 🛍️`,
      `¡Buen día, ${isReplyTo}! Allí nos vemos en un rato, guardadme sitio. ☕`,
      `¡Sábado por fin, ${isReplyTo}! A disfrutar del buen tiempo que tenemos. 😄`,
      `Yo voy al mercadillo ahora mismo, ${isReplyTo}. ¿Nos vemos allí?`
    ];

    if (currentNeighborhood === 'EMPLEO') {
      scripts = [
        "¿Alguna oferta para camarero este finde? Se me ha caído un extra a última hora. 🍽️",
        "Busco repartidor con moto para hoy sábado noche. ¡Interesados al DM! 🚴",
        "En el Bar de la Esquina buscan gente para el mercadillo hoy. ¡De nada! ✨"
      ];
      replyScripts = [
        `¡Suerte con la búsqueda, ${isReplyTo}! Yo vi ayer algo en la sección Servicios.`,
        `@${isReplyTo} Prueba a preguntar en los puestos del mercado, siempre necesitan manos hoy.`
      ];
    }

    // LÓGICA DE HERENCIA Y CONTEXTO
    if (isGreeting) {
      replyScripts = [
        `¡Hola, ${isReplyTo}! ¡Qué alegría verte por aquí un sábado! 👋`,
        `¡Muy buenas, ${isReplyTo}! ¿Cómo va el fin de semana?`,
        `¡Saludos vecino/a! Disfruta mucho del día. ☀️`
      ];
    } else if (mentionsRain) {
      replyScripts = [
        `¡Es verdad ${isReplyTo}, me acabo de mojar! 🌧️ Corramos a los soportales.`,
        `@${isReplyTo} Pues hace un momento hacía sol... qué locura de tiempo.`,
        `¿En serio llueve? ¡Y yo con la ropa tendida! Gracias por avisar ${isReplyTo}. 🏃‍♀️`
      ];
    } else if (mentionsMercadillo) {
      replyScripts = [
        `¡Yo también voy al mercadillo ahora, ${isReplyTo}! ¿Has visto algo chulo? 🛍️`,
        `@${isReplyTo} Dicen que hay mucha gente hoy, pero vale la pena por el ambiente.`
      ];
    } else if (mentionsWeather) {
      replyScripts = [
        `¡Es verdad, ${isReplyTo}! Menudo solazo ha salido hoy. ☀️`,
        `@${isReplyTo} Ideal para estar en una terracita ahora mismo.`
      ];
    } else if (isHelpRequest) {
      replyScripts = [
        `¡Bienvenida ${isReplyTo}! Es muy fácil: este es el Foro para hablar. Tienes el Mapa 📍 para avisos y el Inicio 🏠 para noticias.`,
        `¡Hola! No te preocupes ${isReplyTo}. Usa el menú lateral para moverte.`
      ];
    } else {
      // Si el usuario habla de otra cosa, intentamos seguirle el rollo de forma genérica
      replyScripts = [
        `¡Qué bueno lo que dices, ${isReplyTo}! No lo había pensado así.`,
        `@${isReplyTo} Tienes razón, el barrio está cambiando mucho.`,
        `Interesante punto, ${isReplyTo}. ¿Alguien más opina igual?`
      ];
    }

    // Choose character
    const selectedNeighbor = isAssistant
      ? { id: 'v-ai', full_name: 'Mediador Vecinal ⚖️', avatar_url: 'https://img.icons8.com/isometric/512/scales.png', status: 'online' }
      : virtualNeighbors[Math.floor(Math.random() * virtualNeighbors.length)];

    // Use Gemini for all responses now to ensure intelligence and thread following
    setIsTyping(selectedNeighbor.full_name);

    const delay = 2000 + Math.random() * 2000;

    setTimeout(async () => {
      let finalContent = "";

      try {
        // Enviar el contexto completo del barrio y el mensaje del usuario a Gemini
        const aiRes = await getAssistantResponse(originalPrompt || "", currentNeighborhood, selectedNeighbor.full_name);
        finalContent = aiRes.text;

        // Si es una respuesta a alguien, asegurar que lleva el @
        if (isReplyTo && !finalContent.includes(isReplyTo)) {
          finalContent = `@${isReplyTo} ${finalContent}`;
        }
      } catch (e) {
        // Fallback inteligente si falla la API
        if (mentionsRain) {
          finalContent = `@${isReplyTo} ¡Es verdad! Se ha puesto a llover de golpe, qué faena para el mercadillo. 🌧️`;
        } else {
          finalContent = `@${isReplyTo} ¡Qué razón tienes! Por cierto, ¿has visto lo bien que está quedando el barrio?`;
        }
      }

      const mockMsg: Message = {
        id: `sim-${Date.now()}-${selectedNeighbor.id}`,
        user_id: selectedNeighbor.id,
        content: finalContent,
        user_metadata: { full_name: selectedNeighbor.full_name, avatar_url: selectedNeighbor.avatar_url },
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
      id: 'mercadillo-tgn',
      title: '🛍️ Mercadillo HOY',
      description: 'Plaza del Fòrum 09-14h',
      participating: 5840
    },
    {
      id: 'unio-open',
      title: '✅ Calle Unió',
      description: 'Abierta y operativa.',
      participating: 4210
    },
    {
      id: 'vermut-vecinal',
      title: '🍸 Vermut Vecinal',
      description: 'Hoy 12:00h en el mercado.',
      participating: 2150
    },
    {
      id: 'finde-sol',
      title: '☀️ Sol de Sábado',
      description: 'Planes al aire libre.',
      participating: 3500
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
              <p className="text-[10px] italic opacity-80 mt-1 truncate">"¡A por el mercadillo! 🛍️"</p>
            </div>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -top-10 -right-10 size-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 size-20 bg-blue-300/20 rounded-full blur-xl"></div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
          {/* LOGO AREA */}
          <div className="flex flex-col items-center mb-10 mt-4">
            <div className="size-20 bg-gradient-to-tr from-primary to-blue-400 rounded-[28px] flex items-center justify-center shadow-2xl shadow-primary/30 mb-4 transform -rotate-6">
              <span className="material-symbols-outlined text-white text-5xl">forum</span>
            </div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Chat Vecinal</h1>
            <div className="h-1 w-12 bg-primary rounded-full mt-2"></div>
          </div>

          <div className="px-2 py-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2 opacity-60">Canales de Barrio</h4>

            {[
              { id: 'GENERAL', label: 'General', icon: 'public', desc: 'Charla libre', color: 'blue' },
              { id: 'PREPPERS', label: 'Seguridad', icon: 'shield', desc: 'Avisos y ayuda', color: 'red' },
              { id: 'EMPLEO', label: 'Empleo', icon: 'work', desc: 'Ofertas Mar 7', color: 'green' },
              { id: 'ENCUENTROS', label: 'Encuentros', icon: 'favorite', desc: 'Planes Finde', color: 'pink' },
              { id: 'APOYO', label: 'Apoyo', icon: 'volunteer_activism', desc: 'Comunidad', color: 'purple' }
            ].map(chan => (
              <div key={chan.id} className="mb-2">
                <button
                  onClick={() => startTransition(() => setCurrentNeighborhood(chan.id))}
                  className={`w-full flex items-center gap-4 p-4 rounded-[24px] transition-all duration-300 group ${currentNeighborhood === chan.id ? 'bg-white dark:bg-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/20 scale-[1.02]' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${currentNeighborhood === chan.id ? `bg-blue-500 text-white shadow-lg` : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                    <span className="material-symbols-outlined text-2xl">{chan.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className={`text-sm font-black uppercase tracking-tight ${currentNeighborhood === chan.id ? `text-blue-600 dark:text-blue-400` : 'text-gray-600 dark:text-gray-400'}`}>{chan.label}</h3>
                    <p className="text-[10px] text-gray-400 font-bold truncate opacity-80">{chan.desc}</p>
                  </div>
                  {chan.id === 'APOYO' && (
                    <span className="size-6 bg-purple-500 text-white text-[10px] font-black rounded-lg flex items-center justify-center shadow-lg">10</span>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="px-5 py-6 bg-gray-50/50 dark:bg-white/5 rounded-[32px] mx-2 mt-4 border border-gray-100 dark:border-white/5">
            <h2 className="text-xs font-black mb-4 text-center uppercase tracking-widest text-primary">Empleo Sábado 7 Mar</h2>
            <ul className="space-y-3 text-[10px] md:text-xs">
              <li className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                🍽️ <strong>Ayudante Mercadillo</strong>
                <br /><span className="text-gray-500 opacity-80 italic">Part Alta • Solo hoy • 📞 622 11 00 22</span>
              </li>
              <li className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                🚴 <strong>Repartidor Finde</strong>
                <br /><span className="text-gray-500 opacity-80 italic">Centro • 12€/h • 📞 611 44 55 66</span>
              </li>
            </ul>

            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 mt-6 opacity-60">Vecinos Online</h4>
            <div className="grid grid-cols-4 gap-3">
              {activeUsers.slice(0, 8).map((u, i) => (
                <div key={i} className="relative group cursor-pointer" title={u.full_name}>
                  <div className="relative size-12">
                    <img src={u.avatar_url || "/logo.svg"} className="size-full rounded-2xl bg-gray-200 object-cover border-2 border-white dark:border-gray-800 shadow-md group-hover:scale-110 transition-transform" alt="" />
                    <span className={`absolute -bottom-1 -right-1 size-3.5 border-2 border-white dark:border-gray-800 rounded-full ${u.status === 'online' ? 'bg-green-500' : 'bg-amber-500'} shadow-sm`}></span>
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
              <div key={msg.id} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-3`}>
                <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar con efecto de pulso si es virtual */}
                  <div className="shrink-0 pt-2">
                    <div className={`size-10 md:size-12 rounded-[18px] overflow-hidden border-2 shadow-lg transition-transform group-hover:scale-110 ${isMine ? 'border-primary' : 'border-white dark:border-gray-700'}`}>
                      <img src={msg.user_metadata?.avatar_url || `https://i.pravatar.cc/100?u=${msg.user_id}`} className="size-full object-cover" alt="" />
                    </div>
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-4 relative shadow-2xl text-base leading-relaxed ${isMine
                      ? 'bg-gradient-to-br from-primary to-blue-600 text-white rounded-[24px] rounded-tr-none'
                      : 'glass-card text-gray-800 dark:text-gray-100 rounded-[24px] rounded-tl-none border-white/50 dark:border-white/10'
                      }`}>
                      {msg.image_url && (
                        <div className="mb-3 rounded-[18px] overflow-hidden border border-white/20">
                          <img
                            src={msg.image_url}
                            alt="Adjunto"
                            className="w-full h-auto max-h-72 object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(msg.image_url, '_blank')}
                          />
                        </div>
                      )}

                      {/* Name tag for Others */}
                      {!isMine && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary-light mb-1 opacity-80">{msg.user_metadata?.full_name}</p>
                      )}

                      <p className="font-medium tracking-tight">{msg.content}</p>

                      <div className={`flex items-center gap-2 mt-2 opacity-60`}>
                        <span className="text-[9px] font-black uppercase tracking-tighter">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && <span className="material-symbols-outlined text-[12px]">done_all</span>}
                      </div>
                    </div>
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
        <div className="bg-white dark:bg-gray-800 p-6 border-t border-gray-100 dark:border-white/5 z-20">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex flex-col gap-4">

            {/* Toolbar: Quick Emojis & Actions */}
            <div className="flex items-center justify-between px-3">
              <div className="flex gap-3 md:gap-5 overflow-x-auto no-scrollbar py-1">
                {quickEmojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { setNewMessage(prev => prev + emoji); inputRef.current?.focus(); }}
                    className="size-10 flex items-center justify-center text-3xl hover:scale-[1.35] transition-transform cursor-pointer drop-shadow-lg active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={sendBuzz}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary/10 text-primary-light rounded-[18px] hover:bg-primary-light hover:text-white active:scale-95 transition-all text-xs font-black uppercase tracking-widest border border-primary/20 shadow-lg shadow-primary/10"
              >
                <span className="material-symbols-outlined text-xl animate-tada">vibration</span>
                <span>ZUMBIDO</span>
              </button>
            </div>

            {/* Input Field ROW */}
            <div className="flex items-end gap-4">
              <div className="flex-1 relative glass-card !bg-gray-50/50 dark:!bg-white/5 rounded-[28px] border-2 border-transparent focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10 transition-all group/input">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onFocus={() => { if (messages.length === 0) unlockAudio(); }}
                  placeholder={`Di algo en ${currentNeighborhood === 'EMPLEO' ? 'Empleo' : 'el canal'}...`}
                  className="w-full bg-transparent border-none px-8 py-4.5 focus:ring-0 text-base font-bold text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                />
                <div className="absolute right-3 bottom-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`size-10 flex items-center justify-center transition-all rounded-xl ${selectedImage ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-primary'}`}
                  >
                    <span className="material-symbols-outlined text-2xl">image</span>
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

              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="size-16 rounded-[24px] bg-gradient-to-tr from-primary to-blue-400 text-white flex items-center justify-center shadow-xl shadow-primary/40 hover:scale-105 active:scale-90 disabled:opacity-30 disabled:scale-100 disabled:grayscale transition-all"
              >
                <span className="material-symbols-outlined text-3xl font-black">send</span>
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
