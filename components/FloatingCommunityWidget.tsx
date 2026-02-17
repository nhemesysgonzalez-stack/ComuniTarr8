
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: "⚰️ HOY 20:00h: Entierro de la Sardina y Quema del Ninot en la Plaza de la Font. 🔥🐟", neighborhood: 'CENTRO' },
    { id: 1, user: 'Limpieza TGN', avatar: '/logo.svg', text: '🧹 Operación Ceniza: Mañana Miércoles reforzamos la limpieza tras la quema de hoy. ✨', neighborhood: 'GENERAL' },
    { id: 2, user: 'TGN Cultura', avatar: '/logo.svg', text: '🖤 Se invita a todos los vecinos a acudir de riguroso luto al cortejo fúnebre de hoy. 😭', neighborhood: 'GENERAL' },
    { id: 3, user: 'Paco R.', avatar: 'https://i.pravatar.cc/150?u=paco', text: '¡Vaya pena! Se acaba lo bueno. A ver qué tal el testamento de este año, suelen dar caña. 😂🔥', neighborhood: 'Part Alta' },
    { id: 4, user: 'Marta S.', avatar: 'https://i.pravatar.cc/150?u=marta', text: '¿Alguien sabe si después de la quema hay alguna cena popular de sardinas? 🐟🥘', neighborhood: 'Centro' },
    { id: 5, user: 'Guille M.', avatar: 'https://i.pravatar.cc/150?u=guille', text: 'Mañana toca ceniza y vuelta al redil. ¡Disfrutad del último día de locura! 🎭💪', neighborhood: 'Serrallo' },
];

const tickerMessages = [
    { user: 'Admin', text: '⚰️ 20h: Entierro' },
    { user: 'Cultura', text: '🔥 Quema Ninot' },
    { user: 'Limpieza', text: '🧹 Operación Ceniza' },
    { user: 'V. Urbana', text: '🚗 Cortes Part Alta' },
    { user: 'Vecinos', text: '🖤 Todos de Luto' }
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
