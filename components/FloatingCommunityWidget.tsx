
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: '📻 ¡Feliz miércoles! Aprovecha el sol hoy, pero cuidado con el viento. ☀️💨', neighborhood: 'GENERAL' },
    { id: 1, user: 'Pau T.', avatar: 'https://i.pravatar.cc/150?u=pau', text: '¡Vaya Mestral sopla hoy! He tenido que recoger los toldos de la terraza. 💨🏠', neighborhood: 'Llevant' },
    { id: 2, user: 'Mireia R.', avatar: 'https://i.pravatar.cc/150?u=mireia', text: '¿Quién se apunta al cine esta tarde? Ponen Alcarràs en la Audiència. 🎬🍿', neighborhood: 'Part Alta' },
    { id: 3, user: 'Joan B.', text: 'Increíble la ayuda del taller digital. ¡Mi abuelo ya sabe usar WhatsApp! 📱👴', avatar: 'https://i.pravatar.cc/150?u=joan', neighborhood: 'Ponente' },
    { id: 4, user: 'Carme S.', avatar: 'https://i.pravatar.cc/150?u=carme', text: '¡Ya somos más de 850 por la Rambla verde! Vamos, que llegamos a los 1000. 🌲💪', neighborhood: 'Centro' },
    { id: 5, user: 'Luis M.', avatar: 'https://i.pravatar.cc/150?u=luis', text: 'Miércoles de sol, ideal para un café rápido en la Rambla Nova. ☕☀️', neighborhood: 'Centro' },
    { id: 6, user: 'Elena G.', avatar: 'https://i.pravatar.cc/150?u=elena', text: 'He visto las ofertas de programador de hoy, ¡el sector tech se mueve! 💻🚀', neighborhood: 'Llevant' },
];

const tickerMessages = [
    { user: 'Pau T.', text: '¡Cuidado con el viento hoy! 💨' },
    { user: 'Mireia R.', text: 'Cine a las 18:30h, ¡nos vemos! 🎬' },
    { user: 'Joan B.', text: 'La radio de la app es un puntazo 📻' },
    { user: 'Carme S.', text: 'Seguid apoyando la reforma de la Rambla 🌲' },
    { user: 'Luis M.', text: 'Paciencia en las zonas con andamios 🏗️' }
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
