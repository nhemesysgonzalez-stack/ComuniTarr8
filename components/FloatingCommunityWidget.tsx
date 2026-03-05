
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
    { id: 0, user: 'Admin ComuniTarr', avatar: '/logo.svg', text: "🏠 ¡Esta noche Jue 5! Asamblea Vecinal AAVV Sant Pere a las 19:00h. Temas: aceras, zonas verdes y alumbrado. ¡Os esperamos!", neighborhood: 'GENERAL' },
    { id: 1, user: 'Meteo TGN', avatar: '/logo.svg', text: '☀️ Jueves nublado con claros. Máxima de 15ºC. Sin lluvia prevista. 🌤️', neighborhood: 'GENERAL' },
    { id: 2, user: 'Obras TGN', avatar: '/logo.svg', text: '🚧 Obras C/ Unió (3ª jornada, penúltimo día). Fin previsto mañana viernes. Rodeo por C/ Apodaca. 🛠️', neighborhood: 'CENTRE' },
    { id: 3, user: 'AAVV Campclar', avatar: '/logo.svg', text: '⚽ ¡Esta noche a las 20h! Fútbol sala vecinal en el Polideportivo Campclar. ¡Únete! 📞 977 23 80 00', neighborhood: 'CAMPCLAR' },
    { id: 4, user: 'Biblioteca TGN', avatar: '/logo.svg', text: '📚 Mañana Viernes 18:30h — Club de Lectura mensual (novela histórica). ¡Todos bienvenidos! 📖', neighborhood: 'GENERAL' },
    { id: 5, user: 'Joan P.', avatar: 'https://i.pravatar.cc/150?u=joanp', text: '🛒 ¿Alguien va hoy al Mercadona de la Rambla? Busco que me traigan leche y pan. Te lo agradezco! 🙏', neighborhood: 'CENTRE' },
    { id: 6, user: 'Trànsit TGN', avatar: '/logo.svg', text: '🚗 T-11 y A-7 fluidas. Precaución en Av. Roma carril dcho. por señalización. EMT y Renfe normales. ✅', neighborhood: 'GENERAL' },
];

const tickerMessages = [
    { user: 'Admin', text: '🏠 Asamblea Vecinal 19h hoy' },
    { user: 'Obras', text: '🚧 C/ Unió: 3ª Jornada (último día mañana)' },
    { user: 'AAVV Campclar', text: '⚽ Fútbol Sala 20h hoy' },
    { user: 'Meteo', text: '☁️ Nublado y 15ºC' },
    { user: 'Biblioteca', text: '📚 Club Lectura mañana 18:30h' }
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
