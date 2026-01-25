
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TARRAGONA_RADIO_URL = 'https://relay.stream.enacast-cloud.com:40007/tarragona128.mp3';

const RadioPlayer: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [showVolume, setShowVolume] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Error playing radio:", e));
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    return (
        <div className="px-2 mb-4">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-[28px] p-4 shadow-2xl border border-white/10 relative overflow-hidden group">
                {/* Animated Background Glow */}
                <div className={`absolute inset-0 bg-primary/20 blur-2xl transition-opacity duration-1000 ${isPlaying ? 'opacity-40' : 'opacity-0'}`}></div>

                <div className="relative z-10 flex items-center gap-4">
                    {/* Play Button Container */}
                    <button
                        onClick={togglePlay}
                        className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-500 scale-100 active:scale-95 shadow-lg ${isPlaying ? 'bg-primary text-white shadow-primary/40 rotate-[360deg]' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                    >
                        <span className="material-symbols-outlined text-3xl font-black">
                            {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="flex size-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">En Directo</span>
                        </div>
                        <h4 className="text-xs font-black text-white truncate tracking-tight uppercase">Tarragona Ràdio</h4>
                        <p className="text-[9px] font-bold text-primary/80 uppercase tracking-widest">96.7 FM</p>
                    </div>

                    {/* Equalizer / Visualizer Simulation */}
                    <div className="flex items-end gap-0.5 h-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                                key={i}
                                animate={isPlaying ? {
                                    height: [4, 16, 8, 20, 6, 12][(i + Math.floor(Math.random() * 6)) % 6]
                                } : { height: 4 }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 0.6,
                                    delay: i * 0.1,
                                    ease: "easeInOut"
                                }}
                                className="w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(43,140,238,0.6)]"
                            />
                        ))}
                    </div>
                </div>

                {/* Volume Control Overlay */}
                <div className="mt-3 flex items-center gap-3">
                    <button onClick={() => setShowVolume(!showVolume)} className="text-white/40 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">
                            {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                        </span>
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                </div>

                <audio
                    ref={audioRef}
                    src={TARRAGONA_RADIO_URL}
                    crossOrigin="anonymous"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />

                {/* Decorative Lens Flare */}
                <div className="absolute -top-10 -right-10 size-20 bg-white/5 blur-3xl rounded-full"></div>
            </div>

            <p className="text-[8px] text-center text-gray-500 font-bold mt-2 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                Escucha lo que pasa en tu ciudad
            </p>
        </div>
    );
};

export default RadioPlayer;
