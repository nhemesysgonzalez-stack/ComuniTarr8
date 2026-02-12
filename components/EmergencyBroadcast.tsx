import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmergencyBroadcastProps {
    onDismiss?: () => void;
}

export const EmergencyBroadcast: React.FC<EmergencyBroadcastProps> = ({ onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    // Logic to auto-show if there is an active alert for today (Feb 12 2026)
    useEffect(() => {
        const hasSeenAlert = sessionStorage.getItem('hasSeenWindAlertFeb12');
        if (!hasSeenAlert) {
            setTimeout(() => {
                setIsVisible(true);
                triggerBuzz();
            }, 2000);
        }
    }, []);

    const triggerBuzz = () => {
        if ('vibrate' in navigator) {
            // Emergency pattern: SOS in Morse or just strong pulses
            navigator.vibrate([500, 200, 500, 200, 500]);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenWindAlertFeb12', 'true');
        if (onDismiss) onDismiss();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-red-600/90 backdrop-blur-xl"
                >
                    <motion.div
                        initial={{ scale: 0.8, rotate: -5 }}
                        animate={{
                            scale: 1,
                            rotate: 0,
                            x: [0, -10, 10, -10, 10, 0] // Shake animation
                        }}
                        transition={{
                            duration: 0.5,
                            animate: { repeat: Infinity, repeatDelay: 5 }
                        }}
                        className="bg-white rounded-[40px] p-8 md:p-12 max-w-xl w-full shadow-[0_0_100px_rgba(255,255,255,0.4)] relative overflow-hidden"
                    >
                        {/* Visual Pulse Background */}
                        <motion.div
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute inset-0 bg-red-500"
                        />

                        <div className="relative z-10 text-center">
                            <div className="size-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                                <span className="material-symbols-outlined text-white text-5xl">warning</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-red-600 uppercase tracking-tighter leading-none mb-6">
                                ALERTA MÁXIMA <br /> TARRAGONA
                            </h2>

                            <div className="bg-red-50 rounded-3xl p-6 mb-8 border-2 border-red-100">
                                <p className="text-xl font-black text-gray-900 leading-tight mb-4 uppercase">
                                    💨 VIENTO EXTREMO (Mestral)
                                </p>
                                <p className="text-gray-600 font-bold leading-relaxed mb-4">
                                    Rachas superiores a <span className="text-red-600">90 km/h</span> detectadas. Riesgo de caída de ramas y objetos.
                                </p>
                                <ul className="text-left text-xs font-black text-red-700 space-y-2 uppercase tracking-wide">
                                    <li className="flex items-center gap-2">⚠️ EVITAR BALCÓN DEL MEDITERRANI</li>
                                    <li className="flex items-center gap-2">⚠️ ASEGURAR MACETAS Y TOLDOS</li>
                                    <li className="flex items-center gap-2">⚠️ MUCHO CUIDADO CERCA DE ANDAMIOS</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="w-full bg-red-600 text-white py-6 rounded-[25px] font-black text-xl uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all shadow-2xl shadow-red-600/40"
                            >
                                HE SIDO INFORMADO
                            </button>

                            <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                SOPORTE SECUNDARIO COMUNITARR - 12 FEB 2026
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
