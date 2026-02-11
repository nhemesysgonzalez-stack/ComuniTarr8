
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: '🐖 Mañana es Jueves Lardero. ¿Dónde compráis la mejor Coca de Llardons? 😋', neighborhood: 'GENERAL' },
    { id: 1, user: 'PrepperTGN', avatar: '/logo.svg', text: 'Analizando sirenas de ayer: En Bonavista NO se oyó bien. Hilo de reporte abierto. 📢☣️', neighborhood: 'Ponent' },
    { id: 2, user: 'Maria C.', avatar: 'https://i.pravatar.cc/150?u=maria', text: '¡Ya tengo mi disfraz de Reina de Corazones acabado! 👑❤️', neighborhood: 'Part Alta' },
    { id: 3, user: 'Javi F.', text: 'Cuidado en Vidal i Barraquer, están descargando vallas y hay atasco. 🚗', avatar: 'https://i.pravatar.cc/150?u=javi', neighborhood: 'Centro' },
    { id: 4, user: 'Mercè R.', avatar: 'https://i.pravatar.cc/150?u=merce', text: 'Vendo 2 entradas para el Séquito del viernes, al final no puedo ir. Precio coste. 🎟️', neighborhood: 'S. Pere i S. Pau' },
    { id: 5, user: 'Toni B.', avatar: 'https://i.pravatar.cc/150?u=toni', text: '¿Alguien sabe si el Mercadona abre mañana mediodía? Necesito huevos. 🥚', neighborhood: 'Torreforta' },
    { id: 6, user: 'Luisa M.', avatar: 'https://i.pravatar.cc/150?u=luisa', text: 'Cambio cromos de la colección de Carnaval, me faltan los Nanos. 🃏', neighborhood: 'Serrallo' },
];

const tickerMessages = [
    { user: 'Admin', text: 'Mañana Dijous Gras 🐖' },
    { user: 'PrepperTGN', text: 'Reporte Sirenas 📢' },
    { user: 'Maria C.', text: 'Disfraz Listo 👑' },
    { user: 'Javi F.', text: 'Atasco Vidal 🚗' },
    { user: 'Mercè R.', text: 'Vendo Entradas 🎟️' }
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
