import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface BusinessOffer {
    id: string;
    business_name: string;
    offer_title: string;
    description: string;
    discount: string;
    image_url: string;
    category: string;
    expires_in: string;
    neighborhood: string;
    contact_info: string;
}

const LocalBusinesses: React.FC = () => {
    const { user } = useAuth();
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [offers, setOffers] = useState<BusinessOffer[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [businessName, setBusinessName] = useState('');
    const [offerTitle, setOfferTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discount, setDiscount] = useState('');
    const [category, setCategory] = useState('Alimentación');
    const [expiresIn, setExpiresIn] = useState('');
    const [image, setImage] = useState('');
    const [contact, setContact] = useState('');


    useEffect(() => {
        fetchOffers();
    }, [user?.user_metadata?.neighborhood]);

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const data = await safeSupabaseFetch('business_offers',
                supabase
                    .from('business_offers')
                    .select('*')
                    .eq('neighborhood', user?.user_metadata?.neighborhood || 'GENERAL')
                    .order('created_at', { ascending: false })
            );
            setOffers(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleOfferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { success } = await safeSupabaseInsert('business_offers', {
                creator_id: user?.id,
                business_name: businessName,
                offer_title: offerTitle,
                description: description,
                discount: discount,
                category: category,
                expires_in: expiresIn,
                contact_info: contact,
                image_url: image || 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80',
                neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
            });

            if (!success) throw new Error('Falló la creación');
            alert('¡Oferta publicada con éxito!');
            setShowCreateModal(false);
            setBusinessName('');
            setOfferTitle('');
            setDescription('');
            setDiscount('');
            setExpiresIn('');
            setContact('');
            fetchOffers();
        } catch (e) {
            console.error(e);
            alert('Error al publicar oferta');
        }
    };

    const categories = ['Todos', 'Alimentación', 'Restauración', 'Salud y Deporte', 'Cultura', 'Servicios'];
    const filteredOffers = activeCategory === 'Todos' ? offers : offers.filter(o => o.category === activeCategory);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20 font-sans">
            {/* Header */}
            <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 py-12 px-6 text-center">
                <span className="inline-block p-3 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 mb-6">
                    <span className="material-symbols-outlined text-4xl">storefront</span>
                </span>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Comercio Local</h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                    Descubre las mejores ofertas de los negocios de tu barrio. ¡Apoya al comercio de proximidad!
                </p>
                <button onClick={() => setShowCreateModal(true)} className="mt-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
                    SOY UN NEGOCIO, QUIERO PUBLICAR
                </button>
            </div>

            {/* Categories */}
            <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 py-4 px-6 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 max-w-7xl mx-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Offers Grid */}
            <div className="max-w-7xl mx-auto p-6 md:p-12">
                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-20 opacity-50">
                        <div className="size-10 border-4 border-orange-500 border-t-transparent animate-spin rounded-full"></div>
                        <p className="text-xs font-black uppercase tracking-widest">Cargando ofertas...</p>
                    </div>
                ) : filteredOffers.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-[35px] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">store_off</span>
                        <h3 className="text-xl font-black dark:text-white mb-2">No hay ofertas activas</h3>
                        <p className="text-gray-500 text-sm">Sé el primer negocio en publicar una promoción en {user?.user_metadata?.neighborhood}.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredOffers.map(offer => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={offer.id}
                                className="bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 border border-gray-100 dark:border-gray-800"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img src={offer.image_url} alt={offer.offer_title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    {offer.discount && (
                                        <div className="absolute top-4 right-4 bg-red-500 text-white font-black px-3 py-1 rounded-lg shadow-lg rotate-3">
                                            {offer.discount}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                        <p className="text-white font-bold text-sm flex items-center gap-1">
                                            <span className="material-symbols-outlined text-base">store</span>
                                            {offer.business_name}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">{offer.category}</span>
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">Expira: {offer.expires_in}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{offer.offer_title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">{offer.description}</p>
                                    <button onClick={() => alert(`Contacta con ${offer.business_name} al: ${offer.contact_info}`)} className="w-full py-3 rounded-xl border-2 border-orange-500 text-orange-500 font-bold hover:bg-orange-500 hover:text-white transition-colors">
                                        VER OFERTA
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Offer Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Publicar Oferta</h3>
                                <button onClick={() => setShowCreateModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleOfferSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre del Negocio</label>
                                    <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-orange-500/20 focus:ring-2" placeholder="Ej: Panadería Juan" />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Título Oferta</label>
                                    <input type="text" value={offerTitle} onChange={e => setOfferTitle(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-orange-500/20 focus:ring-2" placeholder="Ej: 2x1 en Ensaimadas" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descuento</label>
                                        <input type="text" value={discount} onChange={e => setDiscount(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-orange-500/20 focus:ring-2" placeholder="-50%, 2x1..." />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Expira</label>
                                        <input type="text" value={expiresIn} onChange={e => setExpiresIn(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-orange-500/20 focus:ring-2" placeholder="Ej: 2 días" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Categoría</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-orange-500/20 focus:ring-2">
                                        {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-orange-500/20 focus:ring-2 resize-none" placeholder="Detalles de la oferta..." />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Contacto</label>
                                    <input type="text" value={contact} onChange={e => setContact(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-orange-500/20 focus:ring-2" placeholder="Teléfono o Dirección" />
                                </div>
                                <button type="submit" className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                                    PUBLICAR OFERTA
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LocalBusinesses;
