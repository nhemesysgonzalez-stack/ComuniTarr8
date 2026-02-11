
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: '🚧 TRÁFICO TARDE: Evitad Rambla Nova tramo Balcón. Montaje de gradas bloquea un carril. Usad Vía Augusta.', neighborhood: 'GENERAL' },
    { id: 1, user: 'Carlos M.', avatar: 'https://i.pravatar.cc/150?u=carlos', text: '¡Se han acabado las cocas de llardons en la Rambla! ¿Quedan en Torreforta? 😱', neighborhood: 'Centro' },
    { id: 2, user: 'PrepperTGN', avatar: '/logo.svg', text: 'Mapa de silencio actualizado. Gracias por los reportes de sirenas de ayer. Bonavista es punto ciego. ☣️📍', neighborhood: 'Ponent' },
    { id: 3, user: 'Laura G.', text: 'Voy hacia el Hotel Imperial a dejar el CV. ¿Alguien sabe si piden inglés? 🇬🇧', avatar: 'https://i.pravatar.cc/150?u=laura', neighborhood: 'Part Alta' },
    { id: 4, user: 'David R.', avatar: 'https://i.pravatar.cc/150?u=david', text: 'Al final no llueve para Carnaval, ¿no? Que tengo el disfraz de cartón... 📦😅', neighborhood: 'S. Pere i S. Pau' },
    { id: 5, user: 'Marta S.', avatar: 'https://i.pravatar.cc/150?u=marta', text: 'Vendo 2 entradas grada Viernes (Séquito). Fila 2. Me han surgido viaje. ✈️', neighborhood: 'Llevant' },
    { id: 6, user: 'Javi P.', avatar: 'https://i.pravatar.cc/150?u=javi', text: 'Se ha calmado el viento por fin. Bajad a la playa que se está de lujo. 🌊', neighborhood: 'Arrabassada' },
];

const tickerMessages = [
    { user: 'Admin', text: 'Atasco Rambla 🚧' },
    { user: 'Carlos M.', text: 'Sin Cocas 😱' },
    { user: 'PrepperTGN', text: 'Mapa Silencio 📍' },
    { user: 'Laura G.', text: 'Casting Hotel 💼' },
    { user: 'David R.', text: 'Tiempo Calma ☀️' }
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
