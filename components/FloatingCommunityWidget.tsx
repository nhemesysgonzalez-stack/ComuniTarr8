
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: number;
    user: string;
    avatar: string;
    text: string;
    neighborhood: string;
}

const mockMessages: Message[] = [
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: "☀️ ¡Feliz Domingo 15 Mar! Día soleado y 18ºC. Perfecto para pasear por el Balcón del Mediterráneo.", neighborhood: 'GENERAL' },
    { id: 1, user: 'Meteo TGN', avatar: '/logo.svg', text: '☀️ Domingo primaveral. Máxima de 18ºC y cielos despejados. ¡A disfrutar! 🌸', neighborhood: 'GENERAL' },
    { id: 2, user: 'AAVV Sant Pere', avatar: '/logo.svg', text: '📋 Recordad: acta de la última asamblea disponible en Anuncios. Nueva zona verde aprobada. ✅', neighborhood: 'PART ALTA' },
    { id: 3, user: 'Patrimonio TGN', avatar: '/logo.svg', text: '🏛️ Hoy Domingo entrada reducida al Anfiteatro Romano y Museo Arqueológico. ¡Aprovechad!', neighborhood: 'GENERAL' },
    { id: 4, user: 'EMT TGN', avatar: '/logo.svg', text: '🚌 Servicio de domingos y festivos en todas las líneas. Consulta horarios en emtanem.cat', neighborhood: 'GENERAL' },
    { id: 5, user: 'Trànsit TGN', avatar: '/logo.svg', text: '🚗 Circulación fluida en todos los accesos. Sin incidencias de tráfico este domingo. ✅', neighborhood: 'GENERAL' },
    { id: 6, user: 'Mireia R.', avatar: 'https://i.pravatar.cc/150?u=mireia', text: '☕ ¿Alguien para un vermut en el Serrallo? Estaré por allí a las 13h. ¡Domingo perfecto! 👋', neighborhood: 'CENTRE' },
];

const tickerMessages = [
    { user: 'Admin', text: '☀️ Domingo soleado 18ºC' },
    { user: 'Patrimonio', text: '🏛️ Entrada reducida hoy' },
    { user: 'EMT', text: '🚌 Horario domingos activo' },
    { user: 'Meteo', text: '☀️ Cielos despejados' },
    { user: 'AAVV Sant Pere', text: '📋 Acta asamblea en Anuncios' }
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
