import React, { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import { products } from '../data/products';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [filter, setFilter] = useState('Todos');
    const categories = ['Todos', ...new Set(products.map(p => p.category))];

    const filteredProducts = filter === 'Todos'
        ? products
        : products.filter(p => p.category === filter);

    return (
        <div className="min-h-screen bg-quisqueya-crema flex flex-col">
            <Header onCartClick={() => setIsCartOpen(true)} />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            <main className="flex-grow">
                <Hero />

                {/* Filter Bar */}
                <section className="py-12 bg-white flex flex-col items-center">
                    <h2 className="font-serif text-3xl md:text-5xl text-quisqueya-terracota mb-8 text-center px-4">
                        Nuestra <span className="italic">Artesanía</span>
                    </h2>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 max-w-full">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === cat
                                        ? 'bg-quisqueya-terracota text-white shadow-xl shadow-quisqueya-terracota/30'
                                        : 'bg-quisqueya-crema text-quisqueya-tierra hover:bg-gray-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
                    >
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </motion.div>
                </section>

                {/* Story Section */}
                <section className="bg-quisqueya-palma text-quisqueya-crema py-24 overflow-hidden relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 relative z-10">
                        <div className="lg:w-1/2">
                            <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight">
                                Más que una tienda, <br />
                                <span className="italic text-quisqueya-sol">un puente cultural.</span>
                            </h2>
                            <p className="text-lg opacity-90 leading-relaxed mb-8">
                                Quisqueya Alma nace del deseo de traer el calor y el arte de la República Dominicana a los hogares españoles. Cada pieza cuenta una historia: la de un artesano, la de su familia y la de una isla bañada por el mar Caribe.
                            </p>
                            <p className="text-lg opacity-80 leading-relaxed italic border-l-4 border-quisqueya-sol pl-6">
                                "Somos el ritmo de la güira y la tambora, la paciencia del barro cocido y la elegancia del cuero tallado."
                            </p>
                        </div>
                        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                            <div className="space-y-4 pt-12">
                                <div className="aspect-square bg-quisqueya-crema/10 rounded-[3rem] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                    <img src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="Proceso" />
                                </div>
                                <div className="aspect-[3/4] bg-quisqueya-crema/10 rounded-[3rem] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                    <img src="https://images.unsplash.com/photo-1514228742587-6b1558fbed20?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="Detalle" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="aspect-[3/4] bg-quisqueya-crema/10 rounded-[3rem] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                    <img src="https://images.unsplash.com/photo-1610631780747-d030999d1469?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="Cultura" />
                                </div>
                                <div className="aspect-square bg-quisqueya-crema/10 rounded-[3rem] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                    <img src="https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="Vela" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Decorative abstract shape */}
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[100%] bg-quisqueya-terracota/20 rounded-full blur-[120px]"></div>
                </section>
            </main>

            <footer className="bg-quisqueya-crema pt-20 pb-10 border-t border-quisqueya-terracota/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
                        <div className="col-span-1 md:col-span-1">
                            <h3 className="font-serif text-2xl font-black text-quisqueya-terracota mb-6 uppercase tracking-widest">
                                Quisqueya Alma
                            </h3>
                            <p className="text-quisqueya-tierra/70 text-sm leading-relaxed">
                                Diseño artesanal con alma caribeña, gestionado desde España para amantes de lo exclusivo y lo auténtico.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-quisqueya-palma font-black uppercase text-[10px] tracking-widest mb-6">Explorar</h4>
                            <ul className="space-y-3 text-sm text-quisqueya-tierra/80">
                                <li>Nueva Colección</li>
                                <li>Mas vendidos</li>
                                <li>Personalizaciones</li>
                                <li>Puntos de venta</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-quisqueya-palma font-black uppercase text-[10px] tracking-widest mb-6">Soporte</h4>
                            <ul className="space-y-3 text-sm text-quisqueya-tierra/80">
                                <li>Envíos en España</li>
                                <li>Cambios y Devoluciones</li>
                                <li>Preguntas Frecuentes</li>
                                <li>Contacto</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-quisqueya-palma font-black uppercase text-[10px] tracking-widest mb-6">Suscríbete</h4>
                            <div className="flex bg-white rounded-full p-1 border border-quisqueya-terracota/20 focus-within:border-quisqueya-terracota shadow-sm transition-all">
                                <input type="email" placeholder="email@contacto.es" className="bg-transparent pl-4 pr-2 py-2 w-full text-xs outline-none" />
                                <button className="bg-quisqueya-terracota text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-quisqueya-palma transition-all">OK</button>
                            </div>
                        </div>
                    </div>
                    <div className="pt-10 border-t border-quisqueya-terracota/10 flex flex-col md:row items-center justify-between gap-4">
                        <p className="text-[10px] text-quisqueya-tierra/50 uppercase tracking-widest font-bold">
                            © 2026 Quisqueya Alma | Hecho con amor dominicano 🌴
                        </p>
                        <div className="flex gap-6">
                            {['IG', 'FB', 'TK'].map(s => <span key={s} className="text-[10px] font-black text-quisqueya-terracota hover:text-quisqueya-palma cursor-pointer">{s}</span>)}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
