import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmergencyBroadcastProps {
    onDismiss?: () => void;
}

export const EmergencyBroadcast: React.FC<EmergencyBroadcastProps> = ({ onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    // Logic to auto-show if there is an active alert for today (Feb 19 2026)
    useEffect(() => {
        const hasSeenAlert = sessionStorage.getItem('hasSeenCautionFeb19');
        if (!hasSeenAlert) {
            setTimeout(() => {
                setIsVisible(true);
            }, 5000); // Aparece un poco después
        }
    }, []);

    const triggerBuzz = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    };

    const dismissAlert = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenCautionFeb19', 'true');
        if (onDismiss) onDismiss();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.9 }}
                    className="fixed bottom-6 left-6 right-6 z-[100] md:max-w-md md:left-auto"
                >
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[40px] shadow-2xl border-4 border-green-500 p-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Estado de la Ciudad</span>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                            NORMALIDAD RESTABLECIDA
                        </h2>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            Finalizados los trabajos de limpieza post-Carnaval. Todas las calles y líneas de autobús operan con normalidad. ¡Gracias por vuestra colaboración!
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl">
                                <span className="block text-[8px] font-black text-blue-600 uppercase mb-1">Tráfico</span>
                                <span className="text-[10px] font-bold text-blue-900 dark:text-blue-200">Sin cortes</span>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl">
                                <span className="block text-[8px] font-black text-green-600 uppercase mb-1">Limpieza</span>
                                <span className="text-[10px] font-bold text-green-900 dark:text-green-200">100% Completada</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={dismissAlert}
                                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Entendido
                            </button>
                            <button className="flex-1 py-4 bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all">
                                Ver Mapa
                            </button>
                        </div>

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>SÁBADO 21 FEB 2026</span>
                            <span>AEMET: Despejado 17ºC</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
