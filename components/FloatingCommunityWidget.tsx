
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
    { id: 201, user: 'Sandra L.', avatar: 'https://i.pravatar.cc/150?u=sandra', text: '🥾 ¡Qué buen ambiente en la caminata hoy! El Camí de Ronda está precioso. 😍', neighborhood: 'GENERAL' },
    { id: 202, user: 'Pepe R.', avatar: 'https://i.pravatar.cc/150?u=pepe', text: '☀️ Sol y relax en la Arrabassada. Disfrutando el último día de sol. 🏖️', neighborhood: 'PLATJA' },
    { id: 203, user: 'Marta G.', avatar: 'https://i.pravatar.cc/150?u=marta', text: '🌅 ¡Nos vemos a las 19:15 en el Miracle para el atardecer! 🥂', neighborhood: 'CENTRE' },
    { id: 204, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: '📢 Recordad: Mañana lunes recogida de trastos en el Centro.  Truck', neighborhood: 'GENERAL' },
];

const tickerMessages = [
    '🥾 Éxito total en la caminata dominical. ¡Gracias a todos!',
    '🌤️ Previsión Lunes: Soleado y 20ºC. Estabilidad toda la semana.',
    '📋 RECORDATORIO: Mañana Lunes recogida de trastos en Zona Centro.',
    '🌅 HOY 19:15h: Encuentro Puesta de Sol en Playa del Miracle.',
    '🌸 Agenda: Mañana volvemos con los talleres matinales.'
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
