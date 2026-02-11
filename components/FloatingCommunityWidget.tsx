
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: '🚨 ALERTA VIENTO EXTREMO: +100 km/h previstas. Evita desplazamientos. ES-Alert enviado a todos. 💨⚠️', neighborhood: 'GENERAL' },
    { id: 1, user: 'Protecció Civil', avatar: '/logo.svg', text: '⛔ MAÑANA: Suspendidas clases, universidad y actividad sanitaria no urgente (00:00-20:00h). 🏠', neighborhood: 'GENERAL' },
    { id: 2, user: 'Maria T.', avatar: 'https://i.pravatar.cc/150?u=maria', text: 'He asegurado la terraza. Si tenéis macetas, quitadlas YA. El pronóstico es muy serio. 🌬️🪴', neighborhood: 'Part Alta' },
    { id: 3, user: 'PrepperTGN', avatar: '/logo.svg', text: 'Parques cerrados (Francolí, Miracle, Part Alta). Alejaos de árboles y fachadas. Precaución extrema. 🌳⚠️', neighborhood: 'Ponent' },
    { id: 4, user: 'Javi P.', avatar: 'https://i.pravatar.cc/150?u=javi', text: 'Me han cancelado el viaje a Barcelona. RENFE no opera mañana por el viento. Os lo aviso. 🚆❌', neighborhood: 'Llevant' },
    { id: 5, user: 'Laura G.', text: 'Casting Hotel Imperial CANCELADO por temporal. Reprogramado próxima semana (os aviso). 🎬', avatar: 'https://i.pravatar.cc/150?u=laura', neighborhood: 'Centro' },
    { id: 6, user: 'Carlos M.', avatar: 'https://i.pravatar.cc/150?u=carlos', text: 'Cierran el Passeig Arqueològic y Amfiteatre. Tened cuidado si vais por la Part Alta. 🏛️', neighborhood: 'Part Alta' },
];

const tickerMessages = [
    { user: 'Protecció Civil', text: '⚠️ Alerta Viento +100 km/h' },
    { user: 'Admin', text: '⛔ Clases Suspendidas Jueves' },
    { user: 'Maria T.', text: 'Asegurad Macetas YA 🪴' },
    { user: 'PrepperTGN', text: 'Parques Cerrados 🌳' },
    { user: 'RENFE', text: 'Serv. Suspendido Jueves 🚆' }
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
