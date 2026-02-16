import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmergencyBroadcastProps {
    onDismiss?: () => void;
}

export const EmergencyBroadcast: React.FC<EmergencyBroadcastProps> = ({ onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    // Logic to auto-show if there is an active alert for today (Feb 16 2026)
    useEffect(() => {
        const hasSeenAlert = sessionStorage.getItem('hasSeenCautionFeb16');
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
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenCautionFeb16', 'true');
        if (onDismiss) onDismiss();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-primary/90 backdrop-blur-xl"
                >
                    <motion.div
                        initial={{ scale: 0.8, rotate: -5 }}
                        animate={{
                            scale: 1,
                            rotate: 0,
                        }}
                        className="bg-white rounded-[40px] p-8 md:p-12 max-w-xl w-full shadow-[0_0_100px_rgba(255,255,255,0.4)] relative overflow-hidden"
                    >
                        {/* Visual Pulse Background */}
                        <motion.div
                            animate={{ opacity: [0.05, 0.15, 0.05] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-primary"
                        />

                        <div className="relative z-10 text-center">
                            <div className="size-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                                <span className="material-symbols-outlined text-white text-5xl">gavel</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tighter leading-none mb-6">
                                VEREDICTO FINAL <br /> CARNAVAL TGN 2026
                            </h2>

                            <div className="bg-blue-50 rounded-3xl p-6 mb-8 border-2 border-blue-100">
                                <p className="text-xl font-black text-gray-900 leading-tight mb-4 uppercase">
                                    ⚖️ HOY: JUICIO AL CARNESTOLTES
                                </p>
                                <p className="text-gray-600 font-bold leading-relaxed mb-4">
                                    Esta tarde se celebra el <span className="text-primary font-black">Juicio a la Reina y su Concubí</span> en el Teatre Metropol. El destino del Carnaval está en juego.
                                </p>
                                <ul className="text-left text-xs font-black text-primary space-y-2 uppercase tracking-wide">
                                    <li className="flex items-center gap-2">🏛️ 18:30H Y 20:00H: SESIONES DE JUICIO (METROPOL)</li>
                                    <li className="flex items-center gap-2">🧹 OPERATIVO LIMPIEZA: CALLES DEL CENTRO EN CURSO</li>
                                    <li className="flex items-center gap-2">🚗 TRÁFICO: RESTABLECIDO EN RAMBLA Y AV. CATALUNYA</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="w-full bg-primary text-white py-6 rounded-[25px] font-black text-xl uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all shadow-2xl shadow-primary/40"
                            >
                                ENTENDIDO, ¡GRACIAS!
                            </button>

                            <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                INFO ACTUALIZADA - LUNES 16 FEB 2026
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
