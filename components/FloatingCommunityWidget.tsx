
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: '🎭 ¡Buenos días! Arrancamos semana de CARNAVAL. ¿Tenéis listos los disfraces? 🎉', neighborhood: 'GENERAL' },
    { id: 1, user: 'Marta S.', avatar: 'https://i.pravatar.cc/150?u=marta', text: 'Busco tela de lentejuelas dorada urgente. ¿Alguien sabe dónde queda? 🧵✨', neighborhood: 'Centro' },
    { id: 2, user: 'PrepperTGN', avatar: '/logo.svg', text: 'Si se va la luz, lo primero es NO abrir la nevera. Aguantará el frío 4-6 horas. ❄️🚫', neighborhood: 'Ponent' },
    { id: 3, user: 'Jordi R.', text: 'El mercadillo de Bonavista hoy está a tope de cosas para Carnaval. ¡Corred! 🏃‍♂️🎭', avatar: 'https://i.pravatar.cc/150?u=jordi', neighborhood: 'Bonavista' },
    { id: 4, user: 'Laura V.', avatar: 'https://i.pravatar.cc/150?u=laura', text: 'Lunes otra vez... pero con ganas de la Rua del sábado. 💃', neighborhood: 'Part Alta' },
    { id: 5, user: 'Carlos M.', avatar: 'https://i.pravatar.cc/150?u=carlos', text: '¿Alguien para compartir coche al Polígono Riu Clar? Salgo a las 07:30. 🚗', neighborhood: 'S. Pere i S. Pau' },
    { id: 6, user: 'Paco V.', avatar: 'https://i.pravatar.cc/150?u=paco', text: 'Vendo máquina de coser antigua pero funciona perfecta. Ideal disfraces. 🪡', neighborhood: 'Torreforta' },
];

const tickerMessages = [
    { user: 'Admin', text: 'Semana Carnaval 🎭' },
    { user: 'Marta S.', text: 'Busco Lentejuelas ✨' },
    { user: 'PrepperTGN', text: 'Tip Nevera ❄️' },
    { user: 'Jordi R.', text: 'Mercadillo ON 🔥' },
    { user: 'Carlos M.', text: 'Coche Riu Clar 🚗' }
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
