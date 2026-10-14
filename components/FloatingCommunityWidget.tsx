
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
    { id: '1', user: 'Ana M.', text: '🌰 ¡Ya huele a castañas en la Rambla! Primer puesto instalado junto al Mercat Central. #Castañada', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', time: 'Hace 2m', neighborhood: 'Centre' },
    { id: '2', user: 'Carlos R.', text: '🚧 Ojo: la Calle Major cortada desde el lunes por las obras. Vengo andando por la Baixada del Roser.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', time: 'Hace 6m', neighborhood: 'Part Alta' },
    { id: '3', user: 'Protección Civil', text: '⚠️ METEO: Aviso por rachas de viento moderadas en la zona litoral esta tarde. Precaución en el Serrallo.', avatar: 'https://ui-avatars.com/api/?name=PC&background=ef4444&color=fff', time: 'Hace 10m', isOfficial: true },
    { id: '4', user: 'Elena G.', text: '💼 EMPLEO: Ya abren las bolsas de trabajo para la campaña navideña. ¡Hay vacantes en el Parc Central y el Serrallo!', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', time: 'Hace 18m', neighborhood: 'Eixample' },
    { id: '5', user: 'Laura P.', text: '🚌 EMT: Líneas L54 y L3 reforzadas hoy. La L-12 tiene desvíos por las obras del Centre.', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d', time: 'Hace 25m', neighborhood: 'Bonavista' },
    { id: '6', user: 'TGN Cultura', text: '🏛️ HOY 17h: Visita guiada gratuita al Anfiteatro Romano. Plazas limitadas. Punto de encuentro: Portal del Roser.', avatar: 'https://ui-avatars.com/api/?name=TC&background=3b82f6&color=fff', time: 'Hace 32m', isOfficial: true },
    { id: '7', user: 'Jordi V.', text: '🤝 ¿Alguien se anima al Mercadillo de Bonavista este domingo? Hay cosas muy chulas de temporada.', avatar: 'https://i.pravatar.cc/150?u=b048581f4e29026701d', time: 'Hace 40m', neighborhood: 'Bonavista' },
    { id: '8', user: 'EMATSA', text: '💧 Recordatorio: Corte de agua programado mañana jue 15 oct en el Serrallo de 09h a 13h. Suministro garantizado antes del mediodía.', avatar: 'https://ui-avatars.com/api/?name=EM&background=0ea5e9&color=fff', time: 'Hace 1h', isOfficial: true }
];

const tickerMessages = [
    "🌰 OTOÑO: Los puestos de castañas y boniatos ya están instalados por la ciudad.",
    "🌡️ METEO: Temperaturas de otoño, 19°C. Rachas de viento moderado en el litoral esta tarde.",
    "🛒 MERCADILLO BONAVISTA: Este domingo 18 Oct de 09h a 14h. L54 y L3 reforzadas.",
    "💼 EMPLEO: Abiertas las bolsas de trabajo para la campaña de invierno y Navidad.",
    "🚧 OBRAS PART ALTA: Cortes en Calle Major de 08h a 14h, lunes a viernes.",
    "🏛️ CULTURA: Visita guiada gratuita al Anfiteatro Romano hoy a las 17h.",
    "🚌 EMT: Líneas L54 y L3 reforzadas hoy miércoles. Servicio normal en el resto."
];

export const FloatingCommunityWidget: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const cycleMessages = () => {
            // Pick a message
            const randomMsg = mockMessages[Math.floor(Math.random() * mockMessages.length)];
            const newMsg = { ...randomMsg, id: Date.now() };

            setMessages([newMsg]);

            // Hide after 10 seconds
            setTimeout(() => {
                setMessages([]);
            }, 10000);
        };

        // Initial run
        cycleMessages();

        // Repeat every 45 seconds (Active!)
        const interval = setInterval(cycleMessages, 45000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-24 md:bottom-10 left-4 md:left-[420px] z-[60] flex flex-col items-start gap-3 pointer-events-none">
            <AnimatePresence>
                {messages.map((msg, idx) => (
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
