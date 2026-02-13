import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const DynamicThemeEffects: React.FC = React.memo(() => {
    const location = useLocation();

    // Solo mostrar en la Home (Welcome screen)
    const isHome = location.pathname === '/';

    const confettiParticles = useMemo(() =>
        [...Array(20)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            duration: 3 + Math.random() * 4,
            delay: Math.random() * 5,
            size: 4 + Math.random() * 8,
            color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)]
        })), []);

    if (!isHome) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Confeti cayendo suavemente */}
            {confettiParticles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-sm"
                    style={{
                        left: p.left,
                        top: -20,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        opacity: 0.6
                    }}
                    animate={{
                        top: ['-5vh', '110vh'],
                        rotate: [0, 360, 720],
                        x: [0, 20, -20, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Overlay festivo */}
            <div className="absolute inset-0 bg-yellow-500/5 mix-blend-overlay"></div>
        </div>
    );
});

DynamicThemeEffects.displayName = 'DynamicThemeEffects';

export default DynamicThemeEffects;
