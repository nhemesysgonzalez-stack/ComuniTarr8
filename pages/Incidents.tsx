import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch } from '../services/dataHandler';

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

    useEffect(() => {
        fetchIncidents();
    }, [user]);

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            // 1. Try fetching with profiles join
            let query = supabase
                .from('incidents')
                .select(`*, profiles(full_name, avatar_url)`)
                .order('created_at', { ascending: false });

            let data = await safeSupabaseFetch('incidents', query);

            // 2. If no data or fail, try a flat fetch (without join) to be safe
            if (!data || data.length === 0) {
                let simpleQuery = supabase
                    .from('incidents')
                    .select('*')
                    .order('created_at', { ascending: false });

                const backupData = await safeSupabaseFetch('incidents', simpleQuery);
                if (backupData && backupData.length > 0) {
                    data = backupData;
                }
            }

            if (data) {
                // Mock Incidents for Demo (Thursday 19th)
                const mockIncidents: Incident[] = [
                    {
                        id: 'mock-inc-sat-1',
                        user_id: 'admin',
                        title: '☀️ Sábado de Sol y Playa',
                        description: 'Las playas de Tarragona están en perfectas condiciones hoy sábado. Bandera verde en todas ellas. ¡Disfrutad del buen tiempo!',
                        neighborhood: 'BARRIS MARÍTIMS',
                        status: 'resolved',
                        created_at: new Date().toISOString(),
                        profiles: { full_name: 'Protección Civil TGN', avatar_url: '/logo.svg' },
                        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800'
                    },
                    {
                        id: 'mock-inc-sat-2',
                        user_id: 'user3',
                        title: '🐕 Perro encontrado',
                        description: 'He encontrado un Beagle cachorro cerca del Parque de la Ciudad hoy a las 12:00. Muy asustado pero bien. Sin collar.',
                        neighborhood: 'CENTRO',
                        status: 'open',
                        contact_info: '622 33 44 55 (Marta)',
                        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
                        profiles: { full_name: 'Marta G.', avatar_url: 'https://i.pravatar.cc/150?u=marta' }
                    }
                ];


                // Merge real data with mock data, avoiding duplicates if possible (simple merge here)
                setIncidents([...data, ...mockIncidents]);
            }
        } catch (err) {
            console.error('Error fetching incidents:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, imageUrl?: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta incidencia?')) return;

        try {
            // 1. Delete from DB (Remote)
            const { error } = await supabase.from('incidents').delete().eq('id', id);

            // 2. Delete from LocalStorage (Important: This is why it reappears)
            const localKey = 'local_incidents';
            const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
            const updatedLocalData = localData.filter((inc: any) => inc.id !== id);
            localStorage.setItem(localKey, JSON.stringify(updatedLocalData));

            // 3. Delete Image from Storage if exists
            if (imageUrl && !imageUrl.includes('unsplash.com')) {
                const fileName = imageUrl.split('/').pop();
                if (fileName) {
                    await supabase.storage.from('incidents').remove([fileName]);
                }
            }

            setIncidents(prev => prev.filter(inc => inc.id !== id));
            alert('Incidencia eliminada correctamente de la nube y del dispositivo.');
        } catch (err: any) {
            console.error('Error deleting incident:', err);
            alert('No se pudo eliminar: ' + err.message);
        }
    };

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-red-500">campaign</span>
                        Avisos Civis
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mt-2">
                        Gestiona tus avisos y consulta los reportes del barrio.
                    </p>
                </div>
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
                    <span className="material-symbols-outlined text-8xl text-gray-300 dark:text-gray-700 mb-4">notifications_off</span>
                    <h3 className="text-2xl font-black text-gray-400 dark:text-gray-600 uppercase italic">
                        No hay avisos publicados
                    </h3>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {incidents.map((incident, idx) => (
                        <motion.div
                            key={incident.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all group relative"
                        >
                            {/* Actions (Delete if owner) */}
                            {user?.id === incident.user_id && (
                                <button
                                    onClick={() => handleDelete(incident.id, incident.image_url)}
                                    className="absolute top-6 right-6 size-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-20 shadow-sm"
                                    title="Eliminar reporte"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                            )}

                            {/* Header */}
                            <div className="flex items-start justify-between mb-4 pr-12">
                                <div className="flex items-center gap-3 flex-1">
                                    <img
                                        src={incident.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${incident.profiles?.full_name || 'V'}`}
                                        className="size-10 rounded-full border-2 border-primary/20"
                                        alt="Avatar"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black dark:text-white truncate">{incident.profiles?.full_name || 'Vecino'}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">
                                            {new Date(incident.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-black dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                                {incident.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                {incident.description}
                            </p>

                            {/* Image Preview if exists */}
                            <div className="mb-4 rounded-2xl overflow-hidden h-48 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative group">
                                {incident.image_url ? (
                                    <img
                                        src={incident.image_url}
                                        alt={incident.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            console.error("Error cargando imagen:", incident.image_url);
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80'; // Fallback city image
                                        }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 opacity-20">
                                        <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                                        <span className="text-[10px] font-black uppercase">Sin imagen</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{incident.neighborhood}</span>
                                </div>
                                {incident.contact_info && (
                                    <button className="text-[10px] font-black text-gray-400 hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">contact_page</span>
                                        {t('contact_button')}
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
                        <h3 className="text-lg font-black dark:text-white mb-2">{t('how_it_works')}</h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm text-red-500 mt-0.5">check_circle</span>
                                <span><strong>{t('report_step')}:</strong> {t('report_step_desc')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm text-yellow-500 mt-0.5">check_circle</span>
                                <span><strong>{t('visibility_step')}:</strong> {t('visibility_step_desc')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm text-green-500 mt-0.5">check_circle</span>
                                <span><strong>{t('notify_step')}:</strong> {t('notify_step_desc')}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Incidents;
