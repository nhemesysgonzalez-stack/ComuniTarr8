
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: '📻 ¡Feliz lunes! Dale vida a tu mañana con Tarragona Ràdio en directo desde el menú.', neighborhood: 'GENERAL' },
    { id: 1, user: 'Pau T.', avatar: 'https://i.pravatar.cc/150?u=pau', text: 'Primer café finiquitado. ¡A por la semana tarraconenses! ☕💪', neighborhood: 'Llevant' },
    { id: 2, user: 'Mireia R.', avatar: 'https://i.pravatar.cc/150?u=mireia', text: 'Ojo con el paraguas, que el cielo se está poniendo muy feo por poniente 🌧️🌂', neighborhood: 'Eixample' },
    { id: 3, user: 'Joan B.', text: 'Tráfico denso en la entrada por la T-11, avisados estáis 🚗😤', avatar: 'https://i.pravatar.cc/150?u=joan', neighborhood: 'Ponent' },
    { id: 4, user: 'Carme S.', avatar: 'https://i.pravatar.cc/150?u=carme', text: '¿Quién va a la reunión del proyecto Rambla esta tarde? 🤝🏙️', neighborhood: 'Part Alta' },
    { id: 5, user: 'Luis M.', avatar: 'https://i.pravatar.cc/150?u=luis', text: 'Lunes de zapato y corbata... ¡qué poco dura lo bueno! 😂💼', neighborhood: 'Centro' },
    { id: 6, user: 'Elena G.', avatar: 'https://i.pravatar.cc/150?u=elena', text: 'He visto las nuevas ofertas de trabajo de hoy, ¡suerte a los que buscáis! 🍀💼', neighborhood: 'Llevant' },
];

const tickerMessages = [
    { user: 'Pau T.', text: '¡Lunes! Café doble para todos ☕' },
    { user: 'Mireia R.', text: 'Previsión de lluvia para hoy, no os confiéis 🌧️' },
    { user: 'Joan B.', text: 'El streaming de la radio funciona genial 📻' },
    { user: 'Carme S.', text: 'Nos vemos en la reunión de la Rambla esta tarde 🤝' },
    { user: 'Luis M.', text: 'Tráfico lento en Av. Roma, evitadla si podéis 🚗' }
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
