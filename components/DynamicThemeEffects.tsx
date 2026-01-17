import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const DynamicThemeEffects: React.FC = React.memo(() => {
    const location = useLocation();

    // Solo mostrar en la Home (Welcome screen)
    const isHome = location.pathname === '/';

    const rainDrops = useMemo(() => [...Array(100)].map((_, i) => ({
        id: i,
        duration: Math.random() * 0.8 + 0.6, // Más lenta y suave
        left: Math.random() * 110,
        height: Math.random() * 20 + 10,
        delay: Math.random() * 2,
        opacity: Math.random() * 0.3 + 0.2
    })), []);

    if (!isHome) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
            {/* Lluvia Suave para Home */}
            <div className="absolute inset-0">
                {rainDrops.map((drop) => (
                    <motion.div
                        key={`rain-${drop.id}`}
                        initial={{ y: -100 }}
                        animate={{ y: 1000 }}
                        transition={{
                            duration: drop.duration,
                            repeat: Infinity,
                            ease: "linear",
                            delay: drop.delay
                        }}
                        className="absolute pointer-events-none"
                        style={{
                            left: drop.left + '%',
                            opacity: drop.opacity
                        }}
                    >
                        <div
                            className="bg-white/40 rounded-full"
                            style={{
                                width: '1.5px',
                                height: drop.height + 'px'
                            }}
                        ></div>
                    </motion.div>
                ))}
            </div>

            {/* Suave tinte atmosférico sin relámpagos */}
            <div className="absolute inset-0 bg-blue-900/5 pointer-events-none"></div>
        </div>
    );
});

DynamicThemeEffects.displayName = 'DynamicThemeEffects';

export default DynamicThemeEffects;
