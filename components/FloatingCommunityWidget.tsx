
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: "♻️ Hoy Martes: Día de recogida de muebles y voluminosos en zona centro. Déjalos junto al contenedor (20-22h).", neighborhood: 'CENTRE' },
    { id: 1, user: 'Meteo TGN', avatar: '/logo.svg', text: '☀️ Martes soleado. Máxima de 17ºC. Jornada perfecta para pasear por la Anella Verda. 😎', neighborhood: 'GENERAL' },
    { id: 2, user: 'EMATSA Info', avatar: '/logo.svg', text: '💧 Aviso: Avería en Calle Unió. Suministro afectado hoy martes hasta las 13:00h aprox. 🛠️', neighborhood: 'CENTRE' },
    { id: 3, user: 'Cine Metropol', avatar: '/logo.svg', text: '🎞️ Hoy 20:30h: Apertura del ciclo de Cine V.O. con la película "Parásitos". ¡Os esperamos! 🍿', neighborhood: 'GENERAL' },
    { id: 4, user: 'Toni G.', avatar: 'https://i.pravatar.cc/150?u=toni', text: '🎾 Busco pareja para pádel esta tarde a las 19:30h en el Polideportivo. ¿Quién se anima? 🏸', neighborhood: 'GENERAL' },
    { id: 5, user: 'Sara M.', avatar: 'https://i.pravatar.cc/150?u=sara', text: '📚 ¡Buenos días! ¿Alguna recomendación para el club de lectura comunitario de mañana? 📖', neighborhood: 'GENERAL' },
    { id: 6, user: 'Trànsit TGN', avatar: '/logo.svg', text: '🚗 Circulación fluida en los accesos norte y sur. Sin incidencias destacables esta mañana. ✅', neighborhood: 'GENERAL' },
];

const tickerMessages = [
    { user: 'Admin', text: '♻️ Recogida muebles 20h' },
    { user: 'EMATSA', text: '💧 Calle Unió: Reparación' },
    { user: 'Metropol', text: '🎞️ Cine V.O. 20:30h' },
    { user: 'Meteo', text: '☀️ Sol y 17ºC' },
    { user: 'Vecinos', text: '🎾 ¿Pádel a las 19:30h?' }
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
