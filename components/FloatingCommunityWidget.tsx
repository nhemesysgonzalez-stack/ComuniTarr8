
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: "🏢 Hoy Lunes: Todas las oficinas municipales retoman su horario habitual (8:30h - 14:30h). ¡Buen inicio de semana!", neighborhood: 'GENERAL' },
    { id: 1, user: 'Meteo TGN', avatar: '/logo.svg', text: '☀️ Lunes despejado. Máxima de 16ºC. Ideal para retomar la rutina con energía. 😎', neighborhood: 'GENERAL' },
    { id: 2, user: 'Trànsit TGN', avatar: '/logo.svg', text: '🚗 Precaución: Retenciones habituales en los accesos por la T-11 y A-7 esta mañana. 🚦', neighborhood: 'GENERAL' },
    { id: 3, user: 'Tarragona Impulsa', avatar: '/logo.svg', text: '💼 Taller LinkedIn hoy a las 18:00h en Espai Tabacalera. Optimiza tu perfil profesional. 📈', neighborhood: 'GENERAL' },
    { id: 4, user: 'Mireia R.', avatar: 'https://i.pravatar.cc/150?u=mireia', text: '☕ ¿Alguien para un café rápido cerca de la Rambla antes de entrar a la oficina? 🥐', neighborhood: 'CENTRE' },
    { id: 5, user: 'Joan B.', avatar: 'https://i.pravatar.cc/150?u=joan', text: '💪 ¡Vamos a por el lunes! Semana de nuevos retos en el barrio y en el trabajo. 🤝', neighborhood: 'GENERAL' },
    { id: 6, user: 'EMATSA', avatar: '/logo.svg', text: '💧 Sin incidencias programadas para hoy. Red operando con normalidad. 🛠️', neighborhood: 'GENERAL' },
];

const tickerMessages = [
    { user: 'Admin', text: '🏢 Oficinas abiertas 8:30h' },
    { user: 'Meteo', text: '☀️ Despejado 16ºC' },
    { user: 'Trànsit', text: '🚗 T-11 densa entrada' },
    { user: 'Impulsa', text: '💼 Taller LinkedIn 18h' },
    { user: 'TGN', text: '💪 ¡Buen Lunes!' }
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
