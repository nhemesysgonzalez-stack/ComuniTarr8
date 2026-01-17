import React from 'react';
import { motion } from 'framer-motion';

const DynamicThemeEffects: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
            {/* Diluvio (Dense Rainfall) */}
            <div className="absolute inset-0">
                {[...Array(200)].map((_, i) => {
                    const duration = Math.random() * 0.3 + 0.2;
                    const left = Math.random() * 130 - 15;
                    const height = Math.random() * 40 + 30;

                    return (
                        <motion.div
                            key={`rain-${i}`}
                            initial={{ y: -200, x: 0 }}
                            animate={{
                                y: 1200,
                                x: -200 // Wind effect
                            }}
                            transition={{
                                duration: duration,
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 2
                            }}
                            className="absolute pointer-events-none"
                            style={{
                                left: left + '%',
                                opacity: Math.random() * 0.5 + 0.4
                            }}
                        >
                            <div
                                className="bg-white/80 rounded-full"
                                style={{
                                    width: '2px',
                                    height: height + 'px',
                                    filter: 'blur(0.5px)',
                                    boxShadow: '0 0 8px rgba(255,255,255,0.4)'
                                }}
                            ></div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Thunder Flash */}
            <motion.div
                animate={{
                    opacity: [0, 0, 0.4, 0, 0.2, 0, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatDelay: 8
                }}
                className="absolute inset-0 bg-white pointer-events-none z-[10001]"
            />

            {/* Heavy Atmosphere Overlay */}
            <div className="absolute inset-0 bg-blue-950/20 pointer-events-none backdrop-blur-[0.5px]"></div>

            {/* Splash effect at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
        </div>
    );
};

export default DynamicThemeEffects;
