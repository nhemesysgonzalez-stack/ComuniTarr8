
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: "🛒 Hoy Miércoles: Mercat Setmanal en la Plaça del Fòrum (Part Alta) de 8:00h a 14:00h. ¡Productos frescos de temporada!", neighborhood: 'PART ALTA' },
    { id: 1, user: 'Meteo TGN', avatar: '/logo.svg', text: '☀️ Miércoles soleado. Máxima de 16ºC. Buen día para ir al mercado o la Anella Verda. 🌿', neighborhood: 'GENERAL' },
    { id: 2, user: 'Obras TGN', avatar: '/logo.svg', text: '🚧 Obras en C/ Unió (2ª jornada). Rodeo por C/ Apodaca recomendado. Fin previsto: viernes. 🛠️', neighborhood: 'CENTRE' },
    { id: 3, user: 'C.C. Part Alta', avatar: '/logo.svg', text: '💻 ¡Hoy 17:00h! Taller gratuito de Digitalización en el Centre Cívic Part Alta. Plazas limitadas. 📲', neighborhood: 'GENERAL' },
    { id: 4, user: 'Carles F.', avatar: 'https://i.pravatar.cc/150?u=carles', text: '⚽ ¿Alguien se apunta a fútbol sala esta tarde a las 20h en el Polideportivo Campclar? 🏃', neighborhood: 'CAMPCLAR' },
    { id: 5, user: 'Montse R.', avatar: 'https://i.pravatar.cc/150?u=montse', text: '📚 ¡Buenos días vecinos! Hoy retoma el club de lectura del barrio. Tema: novela histórica. 📖', neighborhood: 'GENERAL' },
    { id: 6, user: 'Trànsit TGN', avatar: '/logo.svg', text: '🚗 Circulación fluida en T-11 y A-7 esta mañana. EMT y Renfe sin alteraciones. ✅', neighborhood: 'GENERAL' },
];

const tickerMessages = [
    { user: 'Admin', text: '🛒 Mercat Part Alta 8-14h' },
    { user: 'Obras', text: '🚧 C/ Unió: 2ª Jornada obras' },
    { user: 'C.C. Part Alta', text: '💻 Taller Digital 17:00h' },
    { user: 'Meteo', text: '☀️ Sol y 16ºC' },
    { user: 'Vecinos', text: '⚽ ¿Fútbol sala a las 20h?' }
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
