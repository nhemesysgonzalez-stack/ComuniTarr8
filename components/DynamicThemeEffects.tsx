import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const DynamicThemeEffects: React.FC = React.memo(() => {
    const location = useLocation();

    // Solo mostrar en la Home (Welcome screen)
    const isHome = location.pathname === '/';

    const raindrops = useMemo(() =>
        [...Array(25)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            duration: 0.5 + Math.random() * 0.5,
            delay: Math.random() * 2,
            opacity: 0.1 + Math.random() * 0.2
        })), []);

    if (!isHome) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Lluvia suave nocturna */}
            {raindrops.map((drop) => (
                <motion.div
                    key={drop.id}
                    className="absolute w-[1px] h-10 bg-blue-300/30"
                    style={{ left: drop.left, top: -100 }}
                    animate={{
                        top: ['0vh', '110vh'],
                        opacity: [0, drop.opacity, 0]
                    }}
                    transition={{
                        duration: drop.duration,
                        repeat: Infinity,
                        delay: drop.delay,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Overlay de noche lluviosa */}
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
        </div>
    );
});

DynamicThemeEffects.displayName = 'DynamicThemeEffects';

export default DynamicThemeEffects;
