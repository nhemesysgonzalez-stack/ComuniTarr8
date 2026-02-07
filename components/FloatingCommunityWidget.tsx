
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: '🍸 ¡La Plaça del Fòrum está a tope! Recordad mantener la zona limpia. ♻️', neighborhood: 'Part Alta' },
    { id: 1, user: 'Jordi F.', avatar: 'https://i.pravatar.cc/150?u=jordi', text: '¿Alguien tiene un ticket de sobra para la Calçotada de mañana? 🙏', neighborhood: 'Serrallo' },
    { id: 2, user: 'PrepperTGN', avatar: '/logo.svg', text: 'Llevo muestras de máscaras FFP3 y filtros ABEC al taller de esta tarde. 🏭😷', neighborhood: 'Ponent' },
    { id: 3, user: 'Lucía M.', text: '¡Qué solazo! Bajando a la Arrabassada a pasear al perro. 🐕☀️', avatar: 'https://i.pravatar.cc/150?u=lucia', neighborhood: 'Llevant' },
    { id: 4, user: 'Marc P.', avatar: 'https://i.pravatar.cc/150?u=marc', text: 'El DJ del vermut se está saliendo. ¡Veníos! 🎶', neighborhood: 'Part Alta' },
    { id: 5, user: 'Elena R.', avatar: 'https://i.pravatar.cc/150?u=elena', text: 'Tengo sitio en el coche para ir mañana al Pont del Diable. 🚗', neighborhood: 'Centro' },
    { id: 6, user: 'Paco V.', avatar: 'https://i.pravatar.cc/150?u=paco', text: 'He hecho mermelada de naranja. ¿Intercambiamos en el local? 🍊', neighborhood: 'Torreforta' },
];

const tickerMessages = [
    { user: 'Admin', text: 'Vermut ON FIRE 🍸' },
    { user: 'Jordi F.', text: 'Busco Ticket Calçotada 🎫' },
    { user: 'PrepperTGN', text: 'Taller 17:00 🏭' },
    { user: 'Lucía M.', text: 'Sol en Arrabassada ☀️' },
    { user: 'Marc P.', text: 'Musica en vivo 🎶' }
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

        // Repeat every 90 seconds (1.5 minutes)
        const interval = setInterval(cycleMessages, 90000);

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
