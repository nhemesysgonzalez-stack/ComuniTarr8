
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: "🛒 Hoy Sábado: Mercado Semanal en la Part Alta (Pl. Fòrum). ¡Apoya a los productores locales!", neighborhood: 'GENERAL' },
    { id: 1, user: 'Meteo TGN', avatar: '/logo.svg', text: '☀️ Sábado despejado y agradable. Máxima de 15ºC. ¡Buen día para pasear! 😎', neighborhood: 'GENERAL' },
    { id: 2, user: 'EMATSA TGN', avatar: '/logo.svg', text: '💧 Recordatorio: Corte de agua hoy en Nou Eixample Sud hasta las 14:00h por mantenimiento. 🛠️', neighborhood: 'EIXAMPLE' },
    { id: 3, user: 'Cultura TGN', avatar: '/logo.svg', text: '🎞️ Cine Forum hoy a las 19:00h en el CC Sant Pere. Proyectamos "Todo sobre mi madre". 🍿', neighborhood: 'GENERAL' },
    { id: 4, user: 'Pau L.', avatar: 'https://i.pravatar.cc/150?u=pau', text: '🥗 He comprado unas alcachofas increíbles en el mercado hoy. ¡Están de temporada!', neighborhood: 'Part Alta' },
    { id: 5, user: 'Montse F.', avatar: 'https://i.pravatar.cc/150?u=montse', text: '🤝 Si alguien del Eixample Sud necesita garrafas de agua, tengo de sobra. ¡Pasaros! 💜', neighborhood: 'APOYO' },
    { id: 6, user: 'TGN Esports', avatar: '/logo.svg', text: '⚽ Inscripciones abiertas para el torneo de fútbol sala del barrio. ¡Forma tu equipo!', neighborhood: 'GENERAL' },
];

const tickerMessages = [
    { user: 'Admin', text: '🛒 Mercado hoy en Pl. Fòrum' },
    { user: 'Meteo', text: '☀️ Soleado 15ºC' },
    { user: 'EMATSA', text: '💧 Corte agua Eixample Sud' },
    { user: 'Cultura', text: '🎞️ Cine Forum 19h' },
    { user: 'TGN', text: '☀️ ¡Buen Sábado!' }
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
