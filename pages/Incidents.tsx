import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../services/supabaseClient';

interface Incident {
    id: string;
    user_id: string;
    title: string;
    description: string;
    contact_info?: string;
    neighborhood: string;
    image_url?: string;
    status: 'open' | 'in_progress' | 'resolved';
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url?: string;
    };
}

const Incidents: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

    useEffect(() => {
        fetchIncidents();
    }, [user, filter]);

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const barrio = user?.user_metadata?.neighborhood || 'GENERAL';

            let query = supabase
                .from('incidents')
                .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
                // Removing strict filter so users can see all activity for now
                // .or(`neighborhood.eq.${barrio},neighborhood.eq.GENERAL`)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (!error && data) {
                setIncidents(data);
            }
        } catch (err) {
            console.error('Error fetching incidents:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-red-500';
            case 'in_progress': return 'bg-yellow-500';
            case 'resolved': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'open': return 'Reportada';
            case 'in_progress': return 'Notificada Ayto.';
            case 'resolved': return 'Archivada';
            default: return status;
        }
    };

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-red-500">report_problem</span>
                        Incidencias del Barrio
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mt-2">
                        Reporta y sigue el estado de los problemas de tu comunidad
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { key: 'all', label: 'Todas', icon: 'list' },
                    { key: 'open', label: 'Reportadas', icon: 'error' },
                    { key: 'in_progress', label: 'En Notificación', icon: 'pending' },
                    { key: 'resolved', label: 'Archivadas', icon: 'check_circle' }
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key as any)}
                        className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${filter === f.key
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">{f.icon}</span>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Incidents List */}
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : incidents.length === 0 ? (
                <div className="text-center py-20">
                    <span className="material-symbols-outlined text-8xl text-gray-300 dark:text-gray-700 mb-4">sentiment_satisfied</span>
                    <h3 className="text-2xl font-black text-gray-400 dark:text-gray-600 uppercase">
                        {filter === 'all' ? 'No hay incidencias reportadas' : `No hay incidencias ${getStatusText(filter).toLowerCase()}`}
                    </h3>
                    <p className="text-sm text-gray-400 dark:text-gray-600 mt-2">
                        ¡Tu barrio está en perfecto estado!
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {incidents.map((incident, idx) => (
                        <motion.div
                            key={incident.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all group"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <img
                                        src={incident.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${incident.profiles?.full_name || 'V'}`}
                                        className="size-10 rounded-full border-2 border-primary/20"
                                        alt="Avatar"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black dark:text-white truncate">{incident.profiles?.full_name || 'Vecino Anónimo'}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">
                                            {new Date(incident.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest ${getStatusColor(incident.status)}`}>
                                    {getStatusText(incident.status)}
                                </span>
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-black dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                                {incident.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                {incident.description}
                            </p>

                            {/* Image Preview if exists */}
                            {incident.image_url && (
                                <div className="mb-4 rounded-2xl overflow-hidden h-48 border border-gray-100 dark:border-gray-700">
                                    <img
                                        src={incident.image_url}
                                        alt={incident.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{incident.neighborhood}</span>
                                </div>
                                {incident.contact_info && (
                                    <button className="text-[10px] font-black text-gray-400 hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">contact_page</span>
                                        Contacto
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 rounded-3xl p-6 border border-red-500/20">
                <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-4xl text-red-500">info</span>
                    <div>
                        <h3 className="text-lg font-black dark:text-white mb-2">¿Cómo funciona?</h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm text-red-500 mt-0.5">check_circle</span>
                                <span><strong>Reporta:</strong> Usa el botón "Reportar Incidencia" desde la página principal</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm text-yellow-500 mt-0.5">check_circle</span>
                                <span><strong>Visibilidad:</strong> El objetivo es hacer visibles los problemas del barrio.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm text-green-500 mt-0.5">check_circle</span>
                                <span><strong>Notificación:</strong> Las incidencias más votadas se notifican al Ayuntamiento por RRSS.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Incidents;
