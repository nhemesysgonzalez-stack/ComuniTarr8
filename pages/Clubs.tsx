import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface Club {
    id: string;
    creator_id: string;
    name: string;
    description: string;
    neighborhood: string;
    contact_info: string;
    created_at: string;
}

const Clubs: React.FC = () => {
    const { user } = useAuth();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [clubName, setClubName] = useState('');
    const [clubDescription, setClubDescription] = useState('');
    const [clubContact, setClubContact] = useState('');

    useEffect(() => {
        fetchClubs();
    }, [user?.user_metadata?.neighborhood]);

    const fetchClubs = async () => {
        setLoading(true);
        try {
            const data = await safeSupabaseFetch('clubs',
                supabase
                    .from('clubs')
                    .select('*')
                    .eq('neighborhood', user?.user_metadata?.neighborhood || 'GENERAL')
                    .order('created_at', { ascending: false })
            );

            setClubs(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleClubSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { success } = await safeSupabaseInsert('clubs', {
                creator_id: user?.id,
                name: clubName,
                description: clubDescription,
                contact_info: clubContact,
                neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
            });

            if (!success) throw new Error('Falló la creación');
            alert('¡Club creado con éxito!');
            setShowCreateModal(false);
            setClubName('');
            setClubDescription('');
            setClubContact('');
            fetchClubs();
        } catch (e) {
            console.error(e);
            alert('Error al crear club');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20 font-sans">
            <div className="bg-white dark:bg-surface-dark py-24 px-6 border-b border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <span className="inline-block px-4 py-2 bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                        Comunidad
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black dark:text-white tracking-tighter uppercase leading-none mb-6">
                        CLUBES Y QUEDADAS
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-bold max-w-2xl mx-auto mb-8">
                        Conecta con vecinos que comparten tus intereses. Crea tu propio club o únete a uno existente.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-3 px-8 py-5 bg-primary text-white rounded-[30px] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <span className="material-symbols-outlined font-black">add_circle</span>
                        CREAR CLUB
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-10 py-16">
                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-20 opacity-20">
                        <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
                        <p className="text-xs font-black uppercase tracking-widest">Cargando clubes...</p>
                    </div>
                ) : clubs.length === 0 ? (
                    <div className="bg-gradient-to-br from-pink-500/5 to-primary/5 dark:from-pink-500/10 dark:to-primary/10 p-12 rounded-[40px] border-2 border-dashed border-pink-500/20 text-center max-w-2xl mx-auto">
                        <span className="material-symbols-outlined text-pink-500 text-6xl mb-4 block">diversity_3</span>
                        <h3 className="text-lg font-black dark:text-white mb-2">No hay clubes aún</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Sé el primero en crear un club en {user?.user_metadata?.neighborhood || 'tu barrio'}. Organiza quedadas, actividades o simplemente un espacio para conocer vecinos.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-pink-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/20"
                        >
                            CREAR PRIMER CLUB
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {clubs.map((club, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={club.id}
                                className="group bg-white dark:bg-surface-dark rounded-[35px] overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-pink-500/30 transition-all"
                            >
                                <div className="aspect-video bg-gradient-to-br from-pink-500/20 to-primary/20 relative overflow-hidden flex items-center justify-center">
                                    <span className="material-symbols-outlined text-6xl text-pink-500/40">diversity_3</span>
                                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/90 dark:bg-gray-800/90 text-pink-500 shadow-lg">
                                        Club
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-black dark:text-white leading-tight mb-3 group-hover:text-pink-500 transition-colors">
                                        {club.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                        {club.description}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-gray-400">person</span>
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                                Organizador
                                            </span>
                                        </div>
                                        {club.contact_info && (
                                            <a
                                                href={`tel:${club.contact_info}`}
                                                className="px-4 py-2 bg-pink-500/10 text-pink-500 rounded-xl text-xs font-black hover:bg-pink-500 hover:text-white transition-all"
                                            >
                                                CONTACTAR
                                            </a>
                                        )}
                                    </div>
                                    {club.contact_info && (
                                        <p className="text-[10px] font-bold text-gray-400 mt-3">
                                            📞 {club.contact_info}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-16 bg-gradient-to-r from-pink-500/5 to-primary/5 dark:from-pink-500/10 dark:to-primary/10 p-8 rounded-[35px] border border-pink-500/20">
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-pink-500 text-3xl">info</span>
                        <div>
                            <h3 className="text-sm font-black dark:text-white mb-2 uppercase tracking-widest">Cómo funcionan los clubes</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                Los clubes son iniciativas creadas por vecinos como tú. Cada club tiene un organizador que deja sus datos de contacto.
                                Si te interesa un club, usa el botón "CONTACTAR" para hablar directamente con el organizador y unirte a las actividades.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Club Modal */}
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
                            className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Crear Club</h3>
                                <button onClick={() => setShowCreateModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleClubSubmit} className="space-y-4">
                                <div className="p-4 bg-pink-50 dark:bg-pink-900/10 rounded-3xl mb-4">
                                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-3 text-center">Ideas Rápidas (Click para rellenar)</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {[
                                            { t: 'Pádel Vecinal', d: 'Buscamos gente para jugar partidos los jueves por la tarde en las pistas del barrio.', c: '611222333' },
                                            { t: 'Club de Lectura', d: 'Nos reunimos una vez al mes para comentar un libro y tomar café.', c: '644555666' },
                                            { t: 'Juegos de Mesa', d: 'Quedadas los viernes noche para jugar a Catán, Dixit y más.', c: '677888999' }
                                        ].map((idea, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    setClubName(idea.t);
                                                    setClubDescription(idea.d);
                                                    setClubContact(idea.c);
                                                }}
                                                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-700 rounded-xl text-[9px] font-black uppercase text-pink-500 hover:bg-pink-500 hover:text-white transition-all shadow-sm"
                                            >
                                                + {idea.t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre del Club</label>
                                    <input
                                        type="text"
                                        value={clubName}
                                        onChange={(e) => setClubName(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-pink-500/20 outline-none"
                                        placeholder="Ej: Club de Lectura"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                                    <textarea
                                        value={clubDescription}
                                        onChange={(e) => setClubDescription(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-pink-500/20 outline-none resize-none"
                                        placeholder="Describe las actividades, horarios, nivel..."
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Tu Contacto</label>
                                    <input
                                        type="text"
                                        value={clubContact}
                                        onChange={(e) => setClubContact(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-pink-500/20 outline-none"
                                        placeholder="Teléfono o email"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2">
                                        Los interesados te contactarán directamente para unirse
                                    </p>
                                </div>

                                <button type="submit" className="w-full bg-pink-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/20">
                                    Crear Club
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Clubs;
