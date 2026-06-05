
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
    { id: 420, user: 'Javier L.', avatar: 'https://i.pravatar.cc/150?u=javier', text: '⚽ ¡Qué ganas de los playoffs del Nàstic! A ver si este año por fin se da la alegría.', neighborhood: 'Levante' },
    { id: 421, user: 'Sara M.', avatar: 'https://i.pravatar.cc/150?u=sara', text: 'Ya se empieza a notar el calorcito de junio en Tarragona. ¡Este finde toca primer baño en la Rabassada!', neighborhood: 'Centro' },
    { id: 422, user: 'Pablo P.', avatar: 'https://i.pravatar.cc/150?u=pablo', text: '¿Alguien sabe si las duchas de la playa Larga ya funcionan? He visto a los de la Cruz Roja montar la caseta.', neighborhood: 'Part Alta' },
    { id: 423, user: 'Laura V.', avatar: 'https://i.pravatar.cc/150?u=laura', text: '¡buen viernes a todos! Se acerca el verano y hay que ir organizando los casales de los niños. ¡Ánimo!', neighborhood: 'Serrallo' }
];

const tickerMessages = [
    "⚽ DEPORTES: Ambiente de máxima tensión. El Nàstic juega la ida este domingo.",
    "🍻 OCIO: Terrazas a rebosar este primer viernes de junio.",
    "🏖️ PLAYAS: Alerta verde este fin de semana en todas las playas tarraconenses.",
    "☁️ TIEMPO: Fin de semana estupendo. Máximas de 27ºC sin apenas viento."
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
