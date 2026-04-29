
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
    { id: 416, user: 'Javier L.', avatar: 'https://i.pravatar.cc/150?u=javier', text: '🚢 ¿Alguien ha bajado al puerto a ver el yate de Spielberg? ¡Es una pasada!', neighborhood: 'Serrallo' },
    { id: 417, user: 'Sara M.', avatar: 'https://i.pravatar.cc/150?u=sara', text: 'Hoy me he pasado por la Feria de Abril en Bonavista para merendar, ¡mucho ambiente incluso entre semana! 💃', neighborhood: 'Bonavista' },
    { id: 418, user: 'Pablo P.', avatar: 'https://i.pravatar.cc/150?u=pablo', text: 'Genial el nuevo paseo de La Pineda, por fin han acabado las obras tras más de un año. 🏖️', neighborhood: 'Vila-seca' },
    { id: 419, user: 'Laura V.', avatar: 'https://i.pravatar.cc/150?u=laura', text: 'Mucho cuidado los que vayáis en patinete eléctrico, que con los últimos accidentes están multando mucho. 🛴', neighborhood: 'Centro' }
];

const tickerMessages = [
    "🚢 ACTUALIDAD: El megayate 'Seven Seas' de Steven Spielberg atraca en el Moll de Costa.",
    "🚧 INFRAESTRUCTURAS: La Pineda estrena su nuevo paseo marítimo tras 14 meses de obras. ¡A pasear!",
    "💃 FERIA DE ABRIL: Bonavista continúa abierta toda la semana hasta el 3 de mayo.",
    "⭐ GASTRONOMÍA: ¡Un nuevo restaurante tarraconense consigue entrar en la prestigiosa Guía Michelin!"
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
