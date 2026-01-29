import React from 'react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    return (
        <section className="relative h-[85vh] flex items-center overflow-hidden bg-quisqueya-crema">
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1600&auto=format&fit=crop"
                    alt="Colección Artesanal Quisqueya"
                    className="w-full h-full object-cover object-center opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-quisqueya-crema via-quisqueya-crema/40 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-xl"
                >
                    <span className="text-quisqueya-palma font-black uppercase tracking-[0.4em] text-xs mb-4 block">
                        Cultura Dominicana · Diseño de Autor
                    </span>
                    <h2 className="font-serif text-6xl md:text-8xl text-quisqueya-terracota leading-[0.9] mb-6">
                        El alma del <br />
                        <span className="italic">Caribe</span> en tu hogar.
                    </h2>
                    <p className="text-quisqueya-tierra text-lg md:text-xl font-medium mb-10 leading-relaxed">
                        Piezas únicas hechas a mano, inspiradas en la herencia Taína y los colores vibrantes del Trópico. Exclusivo para España.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button className="bg-quisqueya-terracota text-white px-10 py-5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-quisqueya-tierra transition-all shadow-xl shadow-quisqueya-terracota/20 hover:scale-105 active:scale-95">
                            Explorar Colección
                        </button>
                        <button className="border-2 border-quisqueya-palma text-quisqueya-palma px-10 py-5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-quisqueya-palma hover:text-white transition-all hover:scale-105 active:scale-95">
                            Nuestra Historia
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Bottom floating badges */}
            <div className="absolute bottom-10 right-10 hidden lg:flex flex-col gap-4">
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-lg flex items-center gap-3 border border-quisqueya-terracota/5">
                    <div className="bg-quisqueya-sol w-10 h-10 rounded-full flex items-center justify-center text-xs font-black">100%</div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-tighter">Hecho a Mano</p>
                        <p className="text-[8px] font-bold text-gray-500">Artesanos Dominicanos</p>
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-lg flex items-center gap-3 border border-quisqueya-terracota/5 translate-x-[-20px]">
                    <div className="bg-quisqueya-mar w-10 h-10 rounded-full flex items-center justify-center text-white">
                        <Package size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-tighter">Envío Express</p>
                        <p className="text-[8px] font-bold text-gray-500">Stock Real en España</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

import { Package } from 'lucide-react';
export default Hero;
