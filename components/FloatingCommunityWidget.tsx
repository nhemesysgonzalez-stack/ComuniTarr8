
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
    { id: 1, user: 'Pau T.', avatar: 'https://i.pravatar.cc/150?u=pau', text: '¡Bon dia! ¿Sabeis si la expo del Pati Jaume I es gratis?', neighborhood: 'Part Alta' },
    { id: 2, user: 'Mireia R.', avatar: 'https://i.pravatar.cc/150?u=mireia', text: 'Ojo con el viento por la zona del Hospitalet, está fatal.', neighborhood: 'Llevant' },
    { id: 3, user: 'Joan B.', avatar: 'https://i.pravatar.cc/150?u=joan', text: 'Acabo de pasar por la Rambla y las rebajas están a tope 🛍️', neighborhood: 'Eixample' },
    { id: 4, user: 'Carme S.', avatar: 'https://i.pravatar.cc/150?u=carme', text: '¡Votado! Ojalá gane la asociación del Serrallo para Bona Gent.', neighborhood: 'Serrallo' },
    { id: 5, user: 'Xavi M.', avatar: 'https://i.pravatar.cc/150?u=xavi', text: '¿Alguien para un café rápido por la Pl. Imperial?', neighborhood: 'Eixample' },
    { id: 6, user: 'Laia G.', avatar: 'https://i.pravatar.cc/150?u=laia', text: 'He visto que hoy hay donación de sangre en la Rambla, ¡animaros!', neighborhood: 'General' },
];

export const FloatingCommunityWidget: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Simulate incoming messages every 15-30 seconds
        const interval = setInterval(() => {
            const randomMsg = mockMessages[Math.floor(Math.random() * mockMessages.length)];
            const newMsg = { ...randomMsg, id: Date.now() };

            setMessages(prev => [newMsg, ...prev].slice(0, 3));

            // Auto-open briefly if closed? No, maybe just a notification dot
        }, 15000);

        // Initial message
        setMessages([{ ...mockMessages[0], id: Date.now() }]);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-24 left-6 lg:bottom-10 lg:left-[340px] z-[60] flex flex-col items-start gap-3 pointer-events-none">
            <AnimatePresence>
                {messages.map((msg, idx) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.8 }}
                        transition={{ delay: idx * 0.1 }}
                        className="pointer-events-auto bg-white/90 dark:bg-surface-dark/90 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-[240px] flex gap-3 items-start"
                    >
                        <img src={msg.avatar} className="size-8 rounded-full border border-primary/20" alt="" />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[10px] font-black dark:text-white truncate">{msg.user}</span>
                                <span className="text-[8px] font-bold text-primary uppercase ml-2">{msg.neighborhood}</span>
                            </div>
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium leading-snug line-clamp-2">
                                {msg.text}
                            </p>
                        </div>
                    </motion.div>
                )).reverse()}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto size-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center relative overflow-hidden group border-4 border-white dark:border-gray-900"
            >
                <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">forum</span>
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="absolute -top-1 -right-1 size-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
            </motion.button>
        </div>
    );
};
