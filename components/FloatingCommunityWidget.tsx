
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: '☀️ ¡Por fin sol! Las brigadas ya han retirado el árbol de la Rambla. Buen viernes. 👍', neighborhood: 'GENERAL' },
    { id: 1, user: 'Marc P.', avatar: 'https://i.pravatar.cc/150?u=marc', text: '¿Os enterasteis de las sirenas ayer? En Bonavista sonaron fuertísimo. 🏭🔊', neighborhood: 'Ponent' },
    { id: 2, user: 'Maria L.', avatar: 'https://i.pravatar.cc/150?u=maria', text: 'Esta noche concierto en la Sala Zero. ¿Quién se apunta? 🎸🍻', neighborhood: 'Part Alta' },
    { id: 3, user: 'PrepperTGN', text: 'He subido info sobre máscaras de gas y sellado de ventanas. Nunca se sabe... 😷🪟', avatar: '/logo.svg', neighborhood: 'GENERAL' },
    { id: 4, user: 'Laura V.', avatar: 'https://i.pravatar.cc/150?u=laura', text: '¡Qué ganas de vermut mañana en la plaça del Fòrum! 🍸', neighborhood: 'Part Alta' },
    { id: 5, user: 'Paco R.', avatar: 'https://i.pravatar.cc/150?u=paco', text: 'Tengo leña de las ramas caídas si alguien quiere para chimenea. 🪵', neighborhood: 'Monnars' },
    { id: 6, user: 'Ana M.', avatar: 'https://i.pravatar.cc/150?u=ana', text: '¿Alguna oferta de camarera para el finde? 💼', neighborhood: 'Centro' },
];

const tickerMessages = [
    { user: 'Admin', text: 'Sol y Calma ☀️' },
    { user: 'Marc P.', text: 'Sirenas fuertes ayer 🔊' },
    { user: 'Maria L.', text: 'Concierto Hoy 🎸' },
    { user: 'PrepperTGN', text: 'Guía Máscaras 😷' },
    { user: 'Paco R.', text: 'Regalo Leña 🪵' }
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
