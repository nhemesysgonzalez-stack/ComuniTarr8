
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: "💜 Nuevo canal APOYO en el Foro: recursos contra bullying, violencia y acompañamiento. ¡Pásate!", neighborhood: 'GENERAL' },
    { id: 1, user: 'Meteo TGN', avatar: '/logo.svg', text: '☁️ Martes nublado con posibles lluvias por la tarde. Temperatura 13ºC. Llevad chaqueta. 🌧️', neighborhood: 'GENERAL' },
    { id: 2, user: 'TGN Empleo', avatar: '/logo.svg', text: '💼 Nuevas ofertas de empleo esta semana en hostelería y comercio. Consulta el Foro > Empleo.', neighborhood: 'EMPLEO' },
    { id: 3, user: 'Nuria P.', avatar: 'https://i.pravatar.cc/150?u=nuria', text: '🟣 Recordad: 016 para violencia de género (no deja rastro en factura). SIAD Tarragona: 977 24 47 95.', neighborhood: 'APOYO' },
    { id: 4, user: 'Joan B.', avatar: 'https://i.pravatar.cc/150?u=joan', text: '📚 ¿Habéis visto la nueva biblioteca del barrio? Abre hoy martes de 9 a 20h. Ideal para estudiar.', neighborhood: 'Part Alta' },
    { id: 5, user: 'Maria G.', avatar: 'https://i.pravatar.cc/150?u=maria', text: '🤝 Me ofrezco para acompañar vecinos/as mayores al médico. Lunes y miércoles tardes. ¡Escribidme!', neighborhood: 'APOYO' },
    { id: 6, user: 'Mireia R.', avatar: 'https://i.pravatar.cc/150?u=mireia', text: '🏊 La piscina municipal del Francolí abre hoy martes de 7 a 22h. ¡A retomar la rutina!', neighborhood: 'Centro' },
];

const tickerMessages = [
    { user: 'Admin', text: '💜 Canal Apoyo Activo' },
    { user: 'Meteo', text: '☁️ Nublado 13ºC' },
    { user: 'Empleo', text: '💼 Ofertas Nuevas' },
    { user: 'Foro', text: '🤝 Apoyo Vecinal' },
    { user: 'Vecinos', text: '☁️ ¡Buen Martes!' }
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
