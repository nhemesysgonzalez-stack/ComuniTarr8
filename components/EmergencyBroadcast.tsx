import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmergencyBroadcastProps {
    onDismiss?: () => void;
}

export const EmergencyBroadcast: React.FC<EmergencyBroadcastProps> = ({ onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    // Logic to auto-show if there is an active alert for today (Feb 25 2026)
    useEffect(() => {
        const hasSeenAlert = sessionStorage.getItem('hasSeenCautionFeb25');
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
        sessionStorage.setItem('hasSeenCautionFeb25', 'true');
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
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[40px] shadow-2xl border-4 border-orange-500 p-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-orange-500 text-sm">warning</span>
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Aviso Suministro Agua</span>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-2 uppercase">
                            Corte Programado EMATSA
                        </h2>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            Lunes 2 Mar: Se está realizando una mejora en la red en la zona **Nou Eixample Sud**. El suministro se verá afectado hasta las **14:00h**.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl">
                                <span className="block text-[8px] font-black text-orange-600 uppercase mb-1">Zona</span>
                                <span className="text-[10px] font-bold text-orange-900 dark:text-orange-200">Eixample Sud</span>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl">
                                <span className="block text-[8px] font-black text-blue-600 uppercase mb-1">Fin Previsto</span>
                                <span className="text-[10px] font-bold text-blue-900 dark:text-blue-200">14:00h Hoy</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={dismissAlert}
                                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Entendido
                            </button>
                            <button className="flex-1 py-4 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all">
                                Ver Mapa
                            </button>
                        </div>

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>Lunes 2 Mar 2026</span>
                            <span>AEMET: Despejado 15ºC</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
