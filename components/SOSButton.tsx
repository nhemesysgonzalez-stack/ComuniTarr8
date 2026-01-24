import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SOSButton: React.FC = () => {
    const [isAlerting, setIsAlerting] = useState(false);
    const [countdown, setCountdown] = useState(3);

    const triggerSOS = () => {
        setIsAlerting(true);
        let count = 3;
        setCountdown(3);

        const timer = setInterval(() => {
            count -= 1;
            setCountdown(count);
            if (count === 0) {
                clearInterval(timer);
                // Simulate send alert
                alert('🆘 ALERTA SOS ENVIADA A VECINOS CERCANOS Y EMERGENCIAS');
                setIsAlerting(false);
            }
        }, 1000);
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => !isAlerting && triggerSOS()}
                className="hidden lg:flex fixed bottom-8 left-8 z-[100] size-20 bg-red-600 text-white rounded-full shadow-[0_0_40px_rgba(220,38,38,0.5)] items-center justify-center group overflow-hidden border-4 border-white dark:border-gray-800"
            >
                <motion.div
                    animate={isAlerting ? { scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-0 bg-red-400 rounded-full"
                />
                <span className="material-symbols-outlined text-3xl lg:text-4xl font-black relative z-10 transition-transform group-hover:rotate-12">warning</span>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-[10px] font-black uppercase mt-8 relative z-20">SOS</p>
                </div>
            </motion.button>

            <AnimatePresence>
                {isAlerting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] bg-red-600/90 backdrop-blur-md flex flex-col items-center justify-center text-white"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="size-48 rounded-full border-8 border-white flex items-center justify-center mb-8"
                        >
                            <h2 className="text-8xl font-black">{countdown}</h2>
                        </motion.div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">¡ALERTA SOS!</h3>
                        <p className="text-xl font-bold opacity-80 mb-12">Cancelando en {countdown} segundos...</p>

                        <button
                            onClick={() => {
                                window.location.reload(); // Quick cancel hack for demo
                            }}
                            className="px-12 py-5 bg-white text-red-600 rounded-[30px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                            CANCELAR ALERTA
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
