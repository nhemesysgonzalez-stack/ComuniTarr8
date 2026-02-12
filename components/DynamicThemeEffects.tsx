import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const DynamicThemeEffects: React.FC = React.memo(() => {
    const location = useLocation();

    // Solo mostrar en la Home (Welcome screen)
    const isHome = location.pathname === '/';

    const windParticles = useMemo(() =>
        [...Array(15)].map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            duration: 0.2 + Math.random() * 0.4,
            delay: Math.random() * 5,
            opacity: 0.1 + Math.random() * 0.1
        })), []);

    if (!isHome) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Ráfagas de viento horizontales */}
            {windParticles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute h-[1px] w-40 bg-white/20 blur-[1px]"
                    style={{ top: p.top, left: -200 }}
                    animate={{
                        left: ['-20vw', '120vw'],
                        opacity: [0, p.opacity, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Overlay de día ventoso */}
            <div className="absolute inset-0 bg-gray-500/5 mix-blend-overlay"></div>
        </div>
    );
});

DynamicThemeEffects.displayName = 'DynamicThemeEffects';

export default DynamicThemeEffects;
