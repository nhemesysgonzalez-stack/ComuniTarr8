
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: '⚠️ AVISO VIENTO: Rachas fuertes hoy en Tarragona. Cuidado con macetas y cornisas. 🌬️', neighborhood: 'GENERAL' },
    { id: 1, user: 'Sandra M.', avatar: 'https://i.pravatar.cc/150?u=sandra', text: '¿Alguien sabe si quedan entradas para la Disbauxa? En la web pone agotado. 😱', neighborhood: 'Part Alta' },
    { id: 2, user: 'PrepperTGN', avatar: '/logo.svg', text: 'Si escucháis sirenas hoy NO es simulacro. Revisa tu kit de sellado de ventanas. ☣️🚫', neighborhood: 'Ponent' },
    { id: 3, user: 'Marc V.', text: 'Vendo 3 sacos de confeti biodegradable que me han sobrado. Barato. 🎉', avatar: 'https://i.pravatar.cc/150?u=marc', neighborhood: 'S. Pere i S. Pau' },
    { id: 4, user: 'Laura G.', avatar: 'https://i.pravatar.cc/150?u=laura', text: 'El viento me ha volado la ropa del tendal... si veis una sábana de Bob Esponja en la calle Real... 🧽', neighborhood: 'Barri del Port' },
    { id: 5, user: 'Javi R.', avatar: 'https://i.pravatar.cc/150?u=javi', text: 'Busco gente para completar comparsa "Los Vikingos". Faltan 2 personas. 🛡️', neighborhood: 'Torreforta' },
    { id: 6, user: 'Carmen L.', avatar: 'https://i.pravatar.cc/150?u=carmen', text: 'Mi gato se ha asustado con el viento y se ha escapado. Zona Monnars. 🐈', neighborhood: 'Llevant' },
];

const tickerMessages = [
    { user: 'Admin', text: 'Alerta Viento 🌬️' },
    { user: 'Sandra M.', text: 'Busco Entradas 🎟️' },
    { user: 'PrepperTGN', text: 'Riesgo Químico ☣️' },
    { user: 'Laura G.', text: 'Sábana perdida 🧽' },
    { user: 'Javi R.', text: 'Comparsa busca gente 🛡️' }
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
