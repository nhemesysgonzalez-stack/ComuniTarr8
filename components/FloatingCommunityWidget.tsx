
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
    { id: 420, user: 'Javier L.', avatar: 'https://i.pravatar.cc/150?u=javier', text: '⚽ ¡Increíble el gol de Óscar Sanz ayer! Hacía tiempo que no vibraba así el estadio.', neighborhood: 'Levante' },
    { id: 421, user: 'Sara M.', avatar: 'https://i.pravatar.cc/150?u=sara', text: 'Vaya bajada de temperaturas hoy lunes... de los 25ºC del viernes a los 19ºC de hoy. ¡Toca sacar la chaqueta!', neighborhood: 'Centro' },
    { id: 422, user: 'Pablo P.', avatar: 'https://i.pravatar.cc/150?u=pablo', text: '¿Alguien sabe si ya se pueden reservar entradas para Tarraco Viva? He visto que el lunes que viene empieza.', neighborhood: 'Part Alta' },
    { id: 423, user: 'Laura V.', avatar: 'https://i.pravatar.cc/150?u=laura', text: 'Vuelta a la rutina tras el puente. Un poco de bajón pero con pilas cargadas. ¡Buen lunes a todos!', neighborhood: 'Serrallo' }
];

const tickerMessages = [
    "⚽ DEPORTES: El Nàstic suma 3 puntos vitales tras vencer 2-1 al Sevilla Atlético.",
    "🩺 SALUD: Denuncian la falta sistemática de comadronas en la sanidad pública de Tarragona.",
    "🏛️ CULTURA: Cuenta atrás para Tarraco Viva 2026. Del 11 al 24 de mayo.",
    "☁️ TIEMPO: Cielo nuboso este lunes. Temperaturas máximas de 19ºC."
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
