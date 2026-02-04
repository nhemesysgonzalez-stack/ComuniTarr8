
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';
import { supabase } from '../services/supabaseClient';

const BusinessDirectory: React.FC = () => {
    const { user, addPoints } = useAuth();
    const { t } = useLanguage();
    const [showAddModal, setShowAddModal] = useState(false);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('Todos');

    // Form states
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Servicios');
    const [description, setDescription] = useState('');
    const [contact, setContact] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const data = await safeSupabaseFetch('business_directory',
                supabase
                    .from('business_directory')
                    .select('*, profiles(full_name, avatar_url)')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
            );
            setBusinesses(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { success } = await safeSupabaseInsert('business_directory', {
            user_id: user?.id,
            business_name: name,
            category: category,
            description: description,
            contact_info: contact,
            address: address,
            neighborhood: user?.user_metadata?.neighborhood || 'GENERAL',
            status: 'active'
        });

        if (success) {
            await addPoints(25, 10);
            alert('✅ ¡Negocio publicado! Has ganado +25 XP / +10 ComuniPoints');
            setShowAddModal(false);
            fetchBusinesses();
            // Reset form
            setName('');
            setCategory('Servicios');
            setDescription('');
            setContact('');
            setAddress('');
        }
    };

    const categories = ['Todos', 'Servicios', 'Alimentación', 'Belleza & Salud', 'Educación', 'Tecnología', 'Artesanía', 'Otros'];

    const filteredBusinesses = filterCategory === 'Todos'
        ? businesses
        : businesses.filter(b => b.category === filterCategory);

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'Servicios': return 'build';
            case 'Alimentación': return 'restaurant';
            case 'Belleza & Salud': return 'spa';
            case 'Educación': return 'school';
            case 'Tecnología': return 'devices';
            case 'Artesanía': return 'palette';
            default: return 'storefront';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark font-sans pb-20">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-emerald-600 to-teal-700 py-20 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <span className="material-symbols-outlined text-[300px] absolute -top-20 -left-20 rotate-12">storefront</span>
                    <span className="material-symbols-outlined text-[200px] absolute -bottom-10 -right-10 -rotate-12">campaign</span>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="size-20 bg-white/20 rounded-[30px] flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
                    >
                        <span className="material-symbols-outlined text-5xl">business_center</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight uppercase tracking-tighter">
                        Directorio de Negocios Locales
                    </h1>
                    <p className="text-xl md:text-2xl text-emerald-100 mb-10 leading-relaxed max-w-2xl mx-auto">
                        ¡Somos los voceros de tus negocios! Anuncia tu emprendimiento, taller o servicio GRATIS y llega a toda la comunidad.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-white text-emerald-600 px-10 py-5 rounded-[25px] font-black text-lg shadow-2xl hover:scale-105 transition-all uppercase tracking-widest"
                        >
                            📢 Anuncia tu negocio
                        </button>
                        <a
                            href="#directorio"
                            className="bg-emerald-800/50 backdrop-blur-md border-2 border-white/30 text-white px-10 py-5 rounded-[25px] font-black text-lg hover:scale-105 transition-all uppercase tracking-widest"
                        >
                            Ver Todos los Negocios
                        </a>
                    </div>
                </div>
            </section>

            {/* Radio Callout */}
            <section className="max-w-7xl mx-auto -mt-10 px-6 relative z-20">
                <div className="bg-gradient-to-r from-primary to-blue-600 p-8 rounded-[40px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl">radio</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">📻 ComuniTarr Radio</h3>
                            <p className="text-sm font-bold opacity-90">En vivo 24/7 - Tu emisora vecinal con música, avisos y retransmisiones</p>
                        </div>
                    </div>
                    <div className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                        <p className="text-xs font-black uppercase tracking-widest">🔴 En Directo</p>
                    </div>
                </div>
            </section>

            {/* Business Directory */}
            <section id="directorio" className="max-w-7xl mx-auto py-20 px-6 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-black dark:text-white uppercase tracking-tighter mb-2">Negocios en Tarragona</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Apoya el comercio local y conoce a tus vecinos emprendedores</p>
                    </div>
                    <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600">storefront</span>
                        <div className="text-left">
                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Total Negocios</p>
                            <p className="text-xl font-black text-emerald-600 leading-none">{businesses.length}</p>
                        </div>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${filterCategory === cat
                                ? 'bg-emerald-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                                }`}
                        >
                            {cat === 'Todos' ? `🌍 ${cat}` : cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-20 opacity-20">
                        <div className="size-10 border-4 border-emerald-600 border-t-transparent animate-spin rounded-full"></div>
                        <p className="text-xs font-black uppercase tracking-widest">Cargando negocios...</p>
                    </div>
                ) : filteredBusinesses.length === 0 ? (
                    <div className="bg-white dark:bg-surface-dark p-20 rounded-[40px] text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">storefront</span>
                        <h3 className="text-xl font-black dark:text-white mb-2 uppercase">Sé el primero en tu categoría</h3>
                        <p className="text-gray-500 max-w-md mx-auto italic">Todavía no hay negocios en esta categoría. ¡Anuncia el tuyo ahora!</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black hover:scale-105 transition-all"
                        >
                            Publicar Mi Negocio
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBusinesses.map((business) => (
                            <motion.div
                                key={business.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-surface-dark rounded-[40px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-emerald-500/30 transition-all group"
                            >
                                <div className="h-40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center relative">
                                    <span className="material-symbols-outlined text-7xl text-emerald-500/20 group-hover:scale-125 transition-transform duration-500">
                                        {getCategoryIcon(business.category)}
                                    </span>
                                    <div className="absolute top-4 right-4 bg-white dark:bg-surface-dark px-3 py-1 rounded-full shadow-lg">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{business.category}</p>
                                    </div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-black dark:text-white leading-tight mb-2">{business.business_name}</h3>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{business.description}</p>
                                    </div>
                                    <div className="h-[2px] bg-gray-50 dark:bg-gray-800 w-full"></div>

                                    {/* Owner info */}
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={business.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${business.profiles?.full_name || 'V'}`}
                                            className="size-8 rounded-lg"
                                            alt=""
                                        />
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Publicado por</p>
                                            <p className="text-xs font-bold dark:text-white">{business.profiles?.full_name || 'Vecino'}</p>
                                        </div>
                                    </div>

                                    {business.address && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {business.address}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                        <span className="material-symbols-outlined text-sm">phone</span>
                                        {business.contact_info}
                                    </div>
                                    <button
                                        onClick={() => {
                                            alert(`📞 Contacta con ${business.business_name}:\n\n${business.contact_info}\n\n¡Menciona que vienes de ComuniTarr!`);
                                        }}
                                        className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
                                    >
                                        Ver Contacto
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Add Business Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-surface-dark p-8 md:p-12 rounded-[50px] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter leading-none">Anuncia tu negocio</h2>
                                <button onClick={() => setShowAddModal(false)} className="material-symbols-outlined text-gray-400 hover:text-red-500 transition-colors">close</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block mx-2">Nombre del Negocio</label>
                                    <input
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-5 font-bold outline-none ring-emerald-500/20 focus:ring-4 transition-all dark:text-white"
                                        placeholder="Ej: Taller de Costura Mireia"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block mx-2">Categoría</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-5 font-bold outline-none ring-emerald-500/20 focus:ring-4 transition-all appearance-none dark:text-white"
                                    >
                                        <option>Servicios</option>
                                        <option>Alimentación</option>
                                        <option>Belleza & Salud</option>
                                        <option>Educación</option>
                                        <option>Tecnología</option>
                                        <option>Artesanía</option>
                                        <option>Otros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block mx-2">Descripción</label>
                                    <textarea
                                        required
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-5 font-bold outline-none ring-emerald-500/20 focus:ring-4 transition-all resize-none dark:text-white"
                                        placeholder="Describe tu negocio, servicios u horarios..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block mx-2">Dirección (Opcional)</label>
                                    <input
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-5 font-bold outline-none ring-emerald-500/20 focus:ring-4 transition-all dark:text-white"
                                        placeholder="Calle, número, barrio..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block mx-2">Teléfono o Email de contacto</label>
                                    <input
                                        required
                                        value={contact}
                                        onChange={e => setContact(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-5 font-bold outline-none ring-emerald-500/20 focus:ring-4 transition-all dark:text-white"
                                        placeholder="654 123 456 o email@ejemplo.com"
                                    />
                                </div>
                                <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20">
                                    <p className="text-xs font-bold text-emerald-600 leading-relaxed">
                                        🎁 Al publicar tu negocio recibes <strong>+25 XP</strong> y <strong>+10 ComuniPoints</strong>! Tu anuncio será 100% gratuito y visible para toda la comunidad.
                                    </p>
                                </div>
                                <button type="submit" className="w-full bg-emerald-600 text-white p-6 rounded-3xl font-black text-lg shadow-xl shadow-emerald-600/30 hover:scale-105 transition-all uppercase tracking-widest">
                                    📢 Publicar Ahora
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessDirectory;
