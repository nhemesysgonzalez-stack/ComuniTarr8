
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: '🔥 ¡Qué gran día en el Pont del Diable! Gracias a la comisión de fiestas por la organización. 👏', neighborhood: 'GENERAL' },
    { id: 1, user: 'Sergi R.', avatar: 'https://i.pravatar.cc/150?u=sergi', text: 'Ojo si bajáis en coche, la N-240 está parada. Mejor esperar un rato. 🚗🛑', neighborhood: 'San Pere' },
    { id: 2, user: 'PrepperTGN', avatar: '/logo.svg', text: 'Con este sol de tarde estoy probando mi horno solar casero. ¡Funciona! ☀️🍳', neighborhood: 'Ponent' },
    { id: 3, user: 'Anna V.', text: '¿Alguien se ha encontrado una chaqueta azul en la zona de barbacoas? 🧥', avatar: 'https://i.pravatar.cc/150?u=anna', neighborhood: 'Serrallo' },
    { id: 4, user: 'Marc P.', avatar: 'https://i.pravatar.cc/150?u=marc', text: 'Me he comido 50 calçots... necesito una siesta urgente. 😴', neighborhood: 'Part Alta' },
    { id: 5, user: 'Laura G.', avatar: 'https://i.pravatar.cc/150?u=laura', text: '¡Mañana vuelta a la rutina! ¿Alguien sabe si hay huelga de buses? 🚌', neighborhood: 'Centro' },
    { id: 6, user: 'Paco V.', avatar: 'https://i.pravatar.cc/150?u=paco', text: 'Me ha sobrado salsa romesco casera. Si alguien quiere un bote, que avise. 🍯', neighborhood: 'Torreforta' },
];

const tickerMessages = [
    { user: 'Admin', text: 'Calçotada Épica 🔥' },
    { user: 'Sergi R.', text: 'Atasco N-240 🚗' },
    { user: 'PrepperTGN', text: 'Cocina Solar ☀️' },
    { user: 'Anna V.', text: 'Chaqueta perdida 🧥' },
    { user: 'Marc P.', text: 'Siesta time 😴' }
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
