
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: "🎭 HOY 18h: Gran Rua de l'Artesania. 3.000 personas llenarán la Rambla Nova. ¡Tened los disfraces listos! 🎊", neighborhood: 'GENERAL' },
    { id: 1, user: 'Guardia Urbana', avatar: '/logo.svg', text: '⚠️ AVISO: Cortes de tráfico en centro ciudad desde las 16:30h. Se recomienda usar Park & Ride Tabacalera. 🚗', neighborhood: 'GENERAL' },
    { id: 2, user: 'Pajaritus TGN', avatar: 'https://i.pravatar.cc/150?u=pajaritu', text: '🏁 11:00h: ¡Arranca la Baixada del Pajaritu! Venid a Cós del Bou a ver los trastos más locos. 🏎️💨', neighborhood: 'Part Alta' },
    { id: 3, user: 'Maria V.', avatar: 'https://i.pravatar.cc/150?u=maria', text: 'He visto rosas preciosas en el Mercat Central por Sant Valentí. ❤️🌹 ¡Y mucho ambiente de Carnaval!', neighborhood: 'Centro' },
    { id: 4, user: 'Jordi R.', avatar: 'https://i.pravatar.cc/150?u=jordi', text: '¿Alguien sabe si hay sitio para ver la Rua cerca de la Font del Centenari? Está todo a tope ya. 🎭', neighborhood: 'Eixample' },
    { id: 5, user: 'Laura G.', avatar: 'https://i.pravatar.cc/150?u=laura', text: '¡Buscamos gente para la cena de Carnaval post-Rua! Escribid por el foro de Encuentros. 🥂', neighborhood: 'Serrallo' },
];

const tickerMessages = [
    { user: 'Admin', text: "🎭 18h: Rua de l'Artesania" },
    { user: 'Pajaritus', text: '🏎️ 11h: Baixada Pajaritu' },
    { user: 'TGN Cultura', text: '❤️ Feliz Sant Valentí' },
    { user: 'G. Urbana', text: '🚗 Cortes en Rambla 16:30' },
    { user: 'MeteoTGN', text: '🌤️ Tiempo estable hoy' }
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
