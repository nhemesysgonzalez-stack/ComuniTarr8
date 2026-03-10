
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: "✅ ¡Martes 10 Mar! Calle Unió ya abierta al tráfico. Circulación normalizada en toda la zona centro por la mañana.", neighborhood: 'GENERAL' },
    { id: 1, user: 'Meteo TGN', avatar: '/logo.svg', text: '☁️ martes soleado. Máxima de 14ºC. Ideal para abrigarse un poco. ☁️', neighborhood: 'GENERAL' },
    { id: 2, user: 'AAVV Sant Pere', avatar: '/logo.svg', text: '📋 Resumen Asamblea Jueves: Aprobada nueva zona verde. Acta completa ya en Anuncios. ✅', neighborhood: 'PART ALTA' },
    { id: 3, user: 'Asociación', avatar: '/logo.svg', text: '💜 Resumen del 8M del domingo publicado en Anuncios. ¡Gracias a todos por venir!', neighborhood: 'GENERAL' },
    { id: 4, user: 'Coordinación 8M', avatar: '/logo.svg', text: '📣 Las fotos de la manifestación del domingo ya están en la Galería Vecinal. ✨', neighborhood: 'GENERAL' },
    { id: 5, user: 'Trànsit TGN', avatar: '/logo.svg', text: '🚗 T-11 y A-7 despejadas. Av. Roma abierta sin restricciones. EMT horario normal. ✅', neighborhood: 'GENERAL' },
    { id: 6, user: 'Mireia R.', avatar: 'https://i.pravatar.cc/150?u=mireia', text: '☕ ¿Alguien para un café rápido? Estaré por el centro a las 17h para comentar el fin de semana. 👋', neighborhood: 'CENTRE' },
];

const tickerMessages = [
    { user: 'Admin', text: '✅ C/ Unió ya abierta' },
    { user: 'Biblioteca', text: '📚 Taller Infantil 18:30h hoy' },
    { user: '8M', text: '💜 Resumen de ayer' },
    { user: 'Meteo', text: '☁️ Soleado y 16ºC' },
    { user: 'AAVV Sant Pere', text: '📋 Resultados Asamblea en Anuncios' }
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
