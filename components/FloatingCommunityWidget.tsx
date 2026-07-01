
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
    { id: 420, user: 'Marta R.', avatar: 'https://i.pravatar.cc/150?u=marta', text: '🔥 ¡Qué calor hace en Tarragona! Hoy toca playa del Miracle sí o sí. ¿Alguien se apunta?', neighborhood: 'Centre' },
    { id: 421, user: 'Joan F.', avatar: 'https://i.pravatar.cc/150?u=joanf', text: '🎆 ¡Vivan las Festes de Sant Joan! Esta noche hogueras en la playa de la Rabassada. ¡A quemar lo malo del año!', neighborhood: 'Bonavista' },
    { id: 422, user: 'Ana C.', avatar: 'https://i.pravatar.cc/150?u=anac', text: '🏖️ El socorrismo ya está operativo en Playa Larga y L\'Arrabassada. Las duchas también funcionan. ¡Buenas noticias!', neighborhood: 'Llevant' },
    { id: 423, user: 'Pep M.', avatar: 'https://i.pravatar.cc/150?u=pepm', text: '🌡️ 34ºC esta tarde en Tarragona. Recuerda hidratarte y evitar el sol de 12h a 17h. ¡Cuídate, vecino!', neighborhood: 'Part Alta' },
    { id: 424, user: 'Laura V.', avatar: 'https://i.pravatar.cc/150?u=laurav', text: '💼 He visto en ComuniTarr que hay ofertas de trabajo de verano en hostelería. ¡Justo lo que buscaba!', neighborhood: 'Serrallo' },
    { id: 425, user: 'Carlos D.', avatar: 'https://i.pravatar.cc/150?u=carlosd', text: '🚌 La EMT refuerza las líneas hacia las playas en julio. La L8 hasta La Rabassada pasa cada 20 minutos.', neighborhood: 'Ponent' }
];

const tickerMessages = [
    "🏖️ PLAYAS: Bandera verde en todas las playas. Temperatura del agua: 24ºC.",
    "🌡️ METEOROLOGÍA: Alerta por calor. Máximas de 34ºC. Mantente hidratado.",
    "🎆 SANT JOAN: Hogueras autorizadas en La Rabassada esta noche a partir de las 22h.",
    "💼 EMPLEO: Nuevas ofertas de trabajo de verano publicadas en la sección de Empleos.",
    "🚌 TRANSPORTE: EMT refuerza líneas a playas durante julio y agosto."
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
