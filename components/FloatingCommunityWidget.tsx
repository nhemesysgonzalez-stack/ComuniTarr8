
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: "⛅ ¡Buenos días! Miércoles 18 Mar. Día agradable (13ºC→17ºC). ¡Aprovecha el día! 👍", neighborhood: 'GENERAL' },
    { id: 1, user: 'Meteo TGN', avatar: '/logo.svg', text: '⛅ Intervalos nubosos hoy miércoles. Mínima 13ºC, máxima 17ºC. 10% probabilidad de lluvia. 🌦️', neighborhood: 'GENERAL' },
    { id: 2, user: 'AAVV Sant Pere', avatar: '/logo.svg', text: '📚 HOY MIÉRCOLES: Club de Lectura a las 18:30h en el C.C. Part Alta. ¡Os esperamos! ☕', neighborhood: 'PART ALTA' },
    { id: 3, user: 'Bonavista Market', avatar: '/logo.svg', text: '🛒 Mercado de Bonavista operativo hoy miércoles. Refuerzo en buses L3, L30 y L54. 🚌', neighborhood: 'GENERAL' },
    { id: 4, user: 'EMT TGN', avatar: '/logo.svg', text: '🚌 Refuerzo ACTIVO para el Mercado de Bonavista. Frecuencia cada 15 min en línea 54.', neighborhood: 'GENERAL' },
    { id: 5, user: 'Pilar S.', avatar: 'https://i.pravatar.cc/150?u=pilar', text: '🍎 ¡Qué ambiente hoy miércoles en Bonavista! He encontrado unas alcachofas geniales. 🍏', neighborhood: 'BONAVISTA' },
    { id: 6, user: 'Marc R.', avatar: 'https://i.pravatar.cc/150?u=marc', text: '🎬 ¿Alguien irá al cinefórum mañana jueves? He visto que echan un documental interesante. 🍿', neighborhood: 'CENTRE' },
];

const tickerMessages = [
    { user: 'Admin', text: '⛅ Miércoles 18 Mar, 13-17ºC' },
    { user: 'Cultura', text: '📚 Club Lectura 18:30h @Part Alta' },
    { user: 'EMT', text: '🚌 Refuerzo Mercado Bonavista' },
    { user: 'Meteo', text: '⛅ Nubes y claros hoy' },
    { user: 'Bonavista', text: '🛒 Marcado de miércoles activo' }
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
