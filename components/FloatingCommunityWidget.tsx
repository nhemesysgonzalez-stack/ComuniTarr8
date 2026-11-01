
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: number | string;
    user: string;
    avatar: string;
    text: string;
    neighborhood?: string;
    time?: string;
    isOfficial?: boolean;
}

const mockMessages: Message[] = [
    { id: '1', user: 'Laura P.', text: '🛒 ¡Éxito total en el Mercadillo de Bonavista ayer domingo! Más de 300 visitantes. El próximo será el 2 de noviembre.', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d', time: 'Hace 2h', neighborhood: 'Bonavista' },
    { id: '2', user: 'Protecció Civil', text: '☁️ METEO Lun 27 Oct: Parcialmente nublado, 17°C máxima. Viento moderado del Oeste. Sin lluvia prevista.', avatar: 'https://ui-avatars.com/api/?name=PC&background=ef4444&color=fff', time: 'Hace 10m', isOfficial: true },
    { id: '3', user: 'Jordi V.', text: '🎃 ¡Solo 4 días para Halloween! Ruta de Terror Part Alta — últimas plazas. Inscríbete antes del miércoles 29 en Centros Cívicos. ¡Gratis!', avatar: 'https://i.pravatar.cc/150?u=b048581f4e29026701d', time: 'Hace 18m', neighborhood: 'Part Alta' },
    { id: '4', user: 'TGN Cultura', text: '🏛️ Exposición "Tarraco Viva" abierta HOY en el Museu Nacional Arqueològic. Entrada gratuita los lunes. Horario: 10h-14h.', avatar: 'https://ui-avatars.com/api/?name=TC&background=3b82f6&color=fff', time: 'Hace 25m', isOfficial: true },
    { id: '5', user: 'FECSA-ENDESA', text: '⚡ RECORDATORIO: Corte de luz MAÑANA martes 28 Oct de 08h a 11h en Eixample Sur. Prepárense.', avatar: 'https://ui-avatars.com/api/?name=FE&background=f59e0b&color=fff', time: 'Hace 35m', isOfficial: true },
    { id: '6', user: 'Carlos R.', text: '🚧 Obras Calle Major continúan hasta el 7 Nov. Inicio de semana con atasco fuerte — usad la Baixada del Roser. Lunes a viernes 08-17h.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', time: 'Hace 42m', neighborhood: 'Part Alta' },
    { id: '7', user: 'Elena G.', text: '💼 EMPLEO: Esta semana entrevistas en Parc Central para campaña de Navidad. ¡Mira la sección Empleos!', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', time: 'Hace 58m', neighborhood: 'Eixample' },
    { id: '8', user: 'Gatuninos TGN', text: '🐈 Seguimos necesitando mantas, toallas y pienso para las colonias felinas de Torreforta. Depósito: Centre Cívic Torreforta. ¡Gracias!', avatar: 'https://ui-avatars.com/api/?name=GT&background=f97316&color=fff', time: 'Hace 1h 15m', neighborhood: 'Torreforta' },
    { id: '9', user: 'Cruz Roja TGN', text: '🔴 Cruz Roja lanza campaña de ropa de abrigo para el invierno 2026. Puntos de recogida en todos los Centros Cívicos. Tel: 977 221 009.', avatar: 'https://ui-avatars.com/api/?name=CR&background=dc2626&color=fff', time: 'Hace 1h 35m', isOfficial: true },
    { id: '10', user: 'Anna M.', text: '🌰 ¡Qué bonita quedó la Castanyada del sábado! Más de 400 vecinos en la Plaza de la Font. Fotos ya en la Galería Vecinal 📸', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', time: 'Hace 2h 10m', neighborhood: 'Centre' },
    { id: '11', user: 'Marc T.', text: '🥾 La excursión por Prades del sábado fue espectacular. Colores de otoño increíbles. Organizamos otra el 8 Nov. ¿Apuntados?', avatar: 'https://i.pravatar.cc/150?u=c048581f4e29026701d', time: 'Hace 2h 45m', neighborhood: 'Bonavista' },
    { id: '12', user: 'Marta F.', text: '🎷 El concierto de Jazz en el Amfiteatre Romà del sábado fue impresionante. ¡Qué ambiente bajo las estrellas! ¿Habrá otro?', avatar: 'https://i.pravatar.cc/150?u=d048581f4e29026701d', time: 'Hace 3h 20m', neighborhood: 'Part Alta' }
];

const tickerMessages = [
    "🛒 MERCADILLO BONAVISTA: ÉXITO AYER. Próximo: Dom 2 Nov — Explanada Bonavista. Ropa vintage, muebles y productos de temporada.",
    "🎃 HALLOWEEN 31 OCT: Ruta de Terror Part Alta · Inscripciones gratuitas hasta el miércoles 29 en Centros Cívicos.",
    "⚡ CORTE LUZ: MAÑANA Martes 28 Oct 08h-11h en Eixample Sur. FECSA-ENDESA. Suministro garantizado antes del mediodía.",
    "🏛️ MUSEU ARQUEOLÒGIC: Exposición \"Tarraco Viva\" abierta HOY · Entrada gratuita los lunes de 10h a 14h.",
    "💼 EMPLEO NAVIDAD 2026: Entrevistas en Parc Central, Polígono Riu Clar y comercio local esta semana.",
    "🚧 OBRAS C/ MAJOR: Continúan hasta el 7 Nov · Usa la Baixada del Roser. Lunes-Viernes 08h-17h.",
    "🐈 GATUNINOS TORREFORTA: Recogen mantas y pienso para colonias felinas en el Centre Cívic.",
    "🔴 CRUZ ROJA TGN: Campaña ropa de abrigo invierno 2026. Puntos de recogida en Centros Cívicos. Tel: 977 221 009."
];

export const FloatingCommunityWidget: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const cycleMessages = () => {
            const randomMsg = mockMessages[Math.floor(Math.random() * mockMessages.length)];
            const newMsg = { ...randomMsg, id: Date.now() };
            setMessages([newMsg]);
            setTimeout(() => {
                setMessages([]);
            }, 10000);
        };

        cycleMessages();
        const interval = setInterval(cycleMessages, 45000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-24 md:bottom-10 left-4 md:left-[420px] z-[60] flex flex-col items-start gap-3 pointer-events-none">
            <AnimatePresence>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.8, transition: { duration: 1 } }}
                        className="pointer-events-auto bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-emerald-500/20 max-w-[220px] md:max-w-[240px] flex gap-3 items-start"
                    >
                        <img src={msg.avatar} className="size-8 rounded-full border border-emerald-500/20" alt="" />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[10px] font-black dark:text-white truncate">{msg.user}</span>
                                <span className="text-[8px] font-bold text-emerald-500 uppercase ml-2">{msg.neighborhood}</span>
                            </div>
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium leading-snug line-clamp-3">
                                {msg.text}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
