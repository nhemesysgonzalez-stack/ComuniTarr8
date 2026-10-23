
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
    { id: '1', user: 'Anna M.', text: '🌰 ¡Castañada este sábado 25 Oct en la Plaza de la Font! Castañas gratis, música y actividades para niños a las 17h. ¡Vamos todos!', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', time: 'Hace 3m', neighborhood: 'Centre' },
    { id: '2', user: 'Protecció Civil', text: '⚠️ METEO: Rachas de viento moderado esta tarde en la zona litoral. Precaución en el Serrallo y playa. Máximas de 17ºC.', avatar: 'https://ui-avatars.com/api/?name=PC&background=ef4444&color=fff', time: 'Hace 8m', isOfficial: true },
    { id: '3', user: 'Gatuninos TGN', text: '🐈 URGENTE: Gatuninos Torreforta necesita mantas y toallas para los gatos de las colonias este invierno. Déjalas en el Centre Cívic Torreforta. ¡Gracias!', avatar: 'https://ui-avatars.com/api/?name=GT&background=f97316&color=fff', time: 'Hace 10m', neighborhood: 'Torreforta' },
    { id: '4', user: 'Elena G.', text: '💼 EMPLEO: Parc Central busca personal para la campaña de Navidad 2026. Turnos de tarde. ¡Mira la sección Empleos de ComuniTarr!', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', time: 'Hace 22m', neighborhood: 'Eixample' },
    { id: '5', user: 'Carlos R.', text: '🚧 Ojo: la Calle Major sigue cortada de 08h a 14h por las obras. Pasad por la Baixada del Roser.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', time: 'Hace 30m', neighborhood: 'Part Alta' },
    { id: '6', user: 'TGN Cultura', text: '🎷 Concert de Jazz gratuito al Amfiteatre Romà el sábado 25 Oct a las 19h. ¡Plazas limitadas — llega pronto!', avatar: 'https://ui-avatars.com/api/?name=TC&background=3b82f6&color=fff', time: 'Hace 45m', isOfficial: true },
    { id: '7', user: 'Laura P.', text: '🛒 Mercadillo de Segunda Mano en Bonavista este domingo 26 Oct, de 09h a 14h. Ropa vintage, productos de temporada...', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d', time: 'Hace 1h', neighborhood: 'Bonavista' },
    { id: '8', user: 'Jordi V.', text: '🎃 ¡8 días para Halloween! La Ruta de Terror de la Part Alta ya tiene inscripciones abiertas. ¡Gratis en los Centros Cívicos!', avatar: 'https://i.pravatar.cc/150?u=b048581f4e29026701d', time: 'Hace 1h 20m', neighborhood: 'Part Alta' },
    { id: '9', user: 'EMATSA', text: '💧 Corte de suministro agua previsto viernes 24 Oct de 09h a 12h en zonas de Torreforta. Suministro garantizado antes del mediodía.', avatar: 'https://ui-avatars.com/api/?name=EM&background=0ea5e9&color=fff', time: 'Hace 2h', isOfficial: true },
    { id: '10', user: 'Cruz Roja TGN', text: '🔴 Cruz Roja Tarragona busca voluntarios para este otoño 2026. Contacta: 977 221 009. ¡Tu tiempo puede cambiar una vida!', avatar: 'https://ui-avatars.com/api/?name=CR&background=dc2626&color=fff', time: 'Hace 2h 30m', isOfficial: true }
];

const tickerMessages = [
    "🌰 CASTANYADA: Sábado 25 Oct · 17h · Plaza de la Font. ¡Gratis! Castañas, boniatos y música.",
    "🐈 GATUNINOS TORREFORTA: Necesitan mantas y toallas para colonias felinas. Entrega en Centre Cívic Torreforta.",
    "🎃 HALLOWEEN: Ruta de Terror Part Alta · Viernes 31 Oct. Inscripción gratuita en Centros Cívicos.",
    "🎷 JAZZ AL AMFITEATRE: Concert gratuito sábado 25 Oct a las 19h. Plazas limitadas.",
    "💼 EMPLEO NAVIDAD 2026: Abiertas bolsas de trabajo en Parc Central, Riu Clar y comercio local.",
    "🚧 OBRAS PART ALTA: Calle Major cortada de 08h a 14h, lunes a viernes. Usa la Baixada del Roser.",
    "🛒 MERCADILLO BONAVISTA: Domingo 26 Oct de 09h a 14h. Productos de temporada y segunda mano.",
    "🔴 CRUZ ROJA TGN: Busca voluntarios para otoño 2026. Tel: 977 221 009. ¡Incorporación inmediata!"
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
