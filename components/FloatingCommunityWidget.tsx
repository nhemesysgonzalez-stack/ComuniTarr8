
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: number | string;
    user: string;
    avatar: string;
    text: string;
    neighborhood?: string;
    time?: string;
    isOfficial?: boolean;
}

const mockMessages: Message[] = [
    { id: '1', user: 'Ana M.', text: '🌴 ¡Qué calor! Recuerden hidratarse bien si bajan a la playa esta tarde. #Verano', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', time: 'Hace 2m' },
    { id: '2', user: 'Carlos R.', text: '🎉 Ya huele a Santa Tecla. ¡Qué ganas de que lleguen las fiestas mayores!', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', time: 'Hace 5m' },
    { id: '3', user: 'Protección Civil', text: '⚠️ AVISO: Bandera verde en la playa del Miracle. Precaución con el sol central del día.', avatar: 'https://ui-avatars.com/api/?name=PC&background=ef4444&color=fff', time: 'Hace 12m', isOfficial: true },
    { id: '4', user: 'Elena G.', text: '💼 EMPLEO: Nuevas ofertas de trabajo de verano publicadas en la sección de Empleos.', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', time: 'Hace 15m' },
    { id: '5', user: 'Laura P.', text: '🚌 Los autobuses hacia las playas (L-8 y L-54) van bastante llenos, salid con tiempo.', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d', time: 'Hace 22m' },
    { id: '6', user: 'TGN Impulsa', text: '💡 RECORDATORIO: Mañana taller de orientación laboral de verano. Plazas libres.', avatar: 'https://ui-avatars.com/api/?name=TI&background=3b82f6&color=fff', time: 'Hace 30m', isOfficial: true },
];

const tickerMessages = [
    "🏖️ PLAYAS: Bandera verde en todas las playas. Temperatura del agua: 24ºC.",
    "🌡️ METEOROLOGÍA: Alerta por calor. Máximas de 34ºC. Mantente hidratado.",
    "🎆 SANTA TECLA: Se acerca septiembre y las fiestas mayores. Consulta el pre-programa.",
    "💼 EMPLEO: Nuevas ofertas de trabajo de verano publicadas en la sección de Empleos.",
    "🚌 TRANSPORTE: EMT refuerza líneas a playas durante el mes de agosto."
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
