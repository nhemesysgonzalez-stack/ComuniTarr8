
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../services/supabaseClient';

const Neighbors: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [neighbors, setNeighbors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchNeighbors();
    }, [user?.user_metadata?.neighborhood]);

    const fetchNeighbors = async () => {
        setLoading(true);
        const barrio = user?.user_metadata?.neighborhood || 'GENERAL';

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('neighborhood', barrio)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setNeighbors(data);
        }
        setLoading(false);
    };

    const filteredNeighbors = neighbors.filter(n =>
        n.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 font-sans pb-20">
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black dark:text-white tracking-tight">
                            Nuestros <span className="text-primary">Vecinos</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">
                            Gente increíble viviendo en {user?.user_metadata?.neighborhood || 'Tarragona'}
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-2 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 px-6 max-w-md">
                    <span className="material-symbols-outlined text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar vecino por nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-bold dark:text-white w-full py-3"
                    />
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 animate-pulse h-48"></div>
                    ))}
                </div>
            ) : filteredNeighbors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredNeighbors.map((n, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={n.id}
                            className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded-full">
                                    LVL {Math.floor((n.karma || 0) / 100) + 1}
                                </span>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="relative">
                                    <img
                                        src={n.avatar_url || `https://ui-avatars.com/api/?name=${n.full_name || 'V'}&background=random`}
                                        className="size-20 rounded-[24px] object-cover shadow-lg border-2 border-white dark:border-gray-700"
                                        alt={n.full_name}
                                    />
                                    <span className="absolute -bottom-1 -right-1 size-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                                </div>

                                <div>
                                    <h3 className="text-lg font-black dark:text-white leading-tight">{n.full_name}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Vecino Activo</p>
                                </div>

                                <div className="w-full pt-4 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                    <div className="text-gray-400">Karma</div>
                                    <div className="text-primary">{n.karma || 0} XP</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-20 rounded-[40px] text-center space-y-4 border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <span className="material-symbols-outlined text-6xl text-gray-300">person_search</span>
                    <p className="text-gray-500 font-bold">No se han encontrado vecinos con ese nombre.</p>
                </div>
            )}
        </div>
    );
};

export default Neighbors;
