
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
    { id: 301, user: 'Daniel F.', avatar: 'https://i.pravatar.cc/150?u=daniel', text: 'Semana a tope de curro. ¡Feliz martes a todos! 💼', neighborhood: 'Bonavista' },
    { id: 302, user: 'Maria V.', avatar: 'https://i.pravatar.cc/150?u=maria', text: 'Los operarios del Ayuntamiento están podando los árboles de la plaza. Ya era hora 🌳', neighborhood: 'Centre' },
    { id: 303, user: 'Sergio T.', avatar: 'https://i.pravatar.cc/150?u=sergio', text: 'Esta tarde bajaré a correr al milagro. Si alguien se anima, que me mande DM 🏃', neighborhood: 'Poniente' },
    { id: 304, user: 'Elena M.', avatar: 'https://i.pravatar.cc/150?u=elena', text: 'Alguien sabe si hay taller de manualidades hoy? 🎨', neighborhood: 'Serrallo' }
];

const tickerMessages = [
    "📦 Recordatorio: Revisa el módulo de Empleos para nuevas ofertas verificadas.",
    "☀️ Máxima de 23ºC prevista para hoy martes en Tarragona.",
    "⚠️ Cortes intermitentes en la calle Real por obras de mejora.",
    "💼 3 nuevas ofertas de empleo publicadas HOY MARTES."
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
