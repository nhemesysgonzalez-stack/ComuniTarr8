import React from 'react';
import { motion } from 'framer-motion';

const DynamicThemeEffects: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            {/* Rainfall Effect */}
            <div className="absolute inset-0">
                {[...Array(60)].map((_, i) => (
                    <motion.div
                        key={`rain-${i}`}
                        initial={{
                            top: -100,
                            left: Math.random() * 120 + '%',
                            opacity: Math.random() * 0.6 + 0.2,
                            scale: Math.random() * 0.7 + 0.3
                        }}
                        animate={{
                            top: '120%',
                            left: (parseFloat(Math.random() * 120 + '') - 20) + '%'
                        }}
                        transition={{
                            duration: Math.random() * 0.6 + 0.4,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 2
                        }}
                        className="absolute text-blue-300 pointer-events-none"
                        style={{ transform: 'rotate(20deg)' }}
                    >
                        <div className="w-[2px] h-[15px] bg-blue-400/30 rounded-full blur-[1px]"></div>
                    </motion.div>
                ))}
            </div>

            {/* Rainfall Atmosphere */}
            <div className="absolute inset-0 bg-blue-900/5 pointer-events-none"></div>
        </div>
    );
};

export default DynamicThemeEffects;
