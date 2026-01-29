import React, { useState } from 'react';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <div className="min-h-screen bg-quisqueya-crema">
            <Header onCartClick={() => setIsCartOpen(true)} />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            <div className="max-w-4xl mx-auto px-4 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="text-quisqueya-terracota font-black uppercase tracking-[0.3em] text-xs">Nuestra Herencia</span>
                    <h1 className="font-serif text-5xl md:text-7xl text-quisqueya-tierra mt-4">Nuestra <span className="italic">Historia</span></h1>
                </motion.div>

                <div className="prose prose-lg prose-quisqueya mx-auto text-quisqueya-tierra space-y-8 leading-relaxed">
                    <p className="text-xl font-medium italic text-quisqueya-palma border-l-4 border-quisqueya-sol pl-8">
                        "Quisqueya Alma no es solo una marca; es un latido. Es el eco de los taínos que llamaron a nuestra isla Quisqueya (Madre de todas las tierras) y la elegancia del Caribe moderno."
                    </p>

                    <p>
                        Todo comenzó en las calles empedradas de la Zona Colonial de Santo Domingo. Fascinados por la maestría de los talabarteros locales y la delicadeza de los ceramistas que moldean el barro rojo de nuestras tierras, decidimos que este arte no podía quedarse solo en la isla.
                    </p>

                    <div className="grid grid-cols-2 gap-8 py-12">
                        <img src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop" className="rounded-3xl shadow-xl rotate-[-2deg]" alt="Artesano" />
                        <img src="https://images.unsplash.com/photo-1610631780747-d030999d1469?q=80&w=800&auto=format&fit=crop" className="rounded-3xl shadow-xl rotate-[2deg] translate-y-12" alt="Cerámica" />
                    </div>

                    <h2 className="font-serif text-3xl text-quisqueya-terracota pt-12">El Puente a España</h2>
                    <p>
                        Desde nuestra sede en España, gestionamos cada envío con el cuidado que merece una obra de arte. Queremos que cuando abras un paquete de Quisqueya Alma, el aroma de nuestras velas de coco y cacao te transporte a las playas de Samaná, y que la textura de nuestros bolsos de cuero te recuerde la fortaleza de nuestras raíces.
                    </p>

                    <p>
                        Trabajamos directamente con familias de artesanos, asegurando un comercio justo y preservando técnicas que han pasado de generación en generación. Cada pieza que adquieres ayuda a mantener viva la cultura dominicana y a dar a conocer su lado más sofisticado y contemporáneo.
                    </p>

                    <div className="bg-quisqueya-palma text-white p-12 rounded-[3rem] mt-20 text-center relative overflow-hidden">
                        <h3 className="font-serif text-3xl mb-4 relative z-10">¿Llevas el alma del Caribe contigo?</h3>
                        <p className="text-sm opacity-80 mb-8 relative z-10 uppercase tracking-widest font-black">Únete a nuestra comunidad de amantes del diseño auténtico</p>
                        <button className="bg-quisqueya-sol text-black px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest relative z-10 hover:scale-105 transition-all">
                            Ver Colección
                        </button>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                    </div>
                </div>
            </div>

            <footer className="py-12 text-center text-[10px] font-black uppercase text-quisqueya-terracota/40 tracking-[0.4em]">
                Quisqueya Alma · Artesanía de Autor · 2026
            </footer>
        </div>
    );
};

export default About;
