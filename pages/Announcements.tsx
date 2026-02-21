import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface Announcement {
    id: string;
    title: string;
    content: string;
    category: string;
    author_name: string;
    created_at: string;
    neighborhood: string;
    itinerary?: string;
    link_url?: string;
    expires_at?: string;
}

const AnnouncementItem: React.FC<{ notice: Announcement }> = ({ notice }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-surface-dark rounded-[32px] p-8 shadow-xl border-l-[12px] flex flex-col gap-4 items-start transition-all hover:scale-[1.01] ${notice.category === 'URGENTE' ? 'border-l-red-500' :
                notice.category === 'EVENTO' ? 'border-l-sky-500' :
                    notice.category === 'EXITO' ? 'border-l-green-500' : 'border-l-blue-500'
                }`}
        >
            <div className="w-full">
                <div className="flex items-center gap-3 mb-4">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${notice.category === 'URGENTE' ? 'bg-red-100 text-red-600' :
                        notice.category === 'EVENTO' ? 'bg-sky-100 text-sky-600' :
                            notice.category === 'EXITO' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        {notice.category}
                    </span>
                    <span className="text-gray-400 font-bold text-[10px]">• {new Date(notice.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        {notice.neighborhood || 'GENERAL'}
                    </span>
                </div>
                <h3 className="text-2xl font-black dark:text-white mb-2 leading-tight">{notice.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-4">
                    {notice.content}
                </p>

                {notice.itinerary && (
                    <div className="mb-4">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            <span className="material-symbols-outlined">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                            {isExpanded ? 'Ocultar Itinerario' : 'Ver Itinerario Completo'}
                        </button>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-primary/30">
                                        <div className="space-y-3">
                                            {notice.itinerary.split('\n').map((step, i) => (
                                                <div key={i} className="flex gap-3 items-start">
                                                    <span className="text-primary font-black">•</span>
                                                    <span className="text-sm font-bold dark:text-gray-300">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-[10px] font-black text-primary">
                            {notice.author_name ? notice.author_name.charAt(0) : 'V'}
                        </div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{notice.author_name || 'Vecino'}</span>
                    </div>

                    {notice.link_url && (
                        <a
                            href={notice.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            Fuente Oficial
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const Announcements: React.FC = () => {
    const { user, addPoints } = useAuth();
    const [notices, setNotices] = useState<Announcement[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('Info');
    const [expiresAt, setExpiresAt] = useState('');

    useEffect(() => {
        fetchNotices();
    }, [user?.user_metadata?.neighborhood]);

    const fetchNotices = async () => {
        setLoading(true);
        const weatherAlert: Announcement = {
            id: 'weather-sat-sun',
            title: "☀️ SÁBADO: Tarde Radiante",
            content: "Tras el viento de ayer, hoy disfrutamos de un sábado soleado y estable en toda Tarragona. Temperaturas agradables de hasta 17°C ideal para pasear.",
            category: "INFO",
            neighborhood: "GENERAL",
            author_name: "Protección Civil TGN",
            itinerary: "• Tarde: Soleado 17°C\n• Noche: Despejado 9°C\n• Mañana Dom: Intervalos nubosos\n• Viento: Calma total",
            created_at: new Date().toISOString()
        };

        const weekendAgendaNotice: Announcement = {
            id: 'weekend-agenda-sat',
            title: "🎭 HOY: Teatro Metropol y Vermuts",
            content: "Recordatorio: Función de 'La Vida es Sueño' esta noche 20:30h. Durante la tarde, ambiente festivo en el Serrallo con música en directo.",
            category: "EVENTO",
            neighborhood: "GENERAL",
            author_name: "Ajuntament TGN",
            itinerary: "• Tarde: Música en Serrallo\n• Noche: Teatro Metropol (20:30h)\n• Mañana Dom: Carrera Popular 5K (10h)",
            link_url: "https://www.tarragona.cat/agenda",
            created_at: new Date().toISOString()
        };

        const routineAdvisory: Announcement = {
            id: 'pharmacy-guard-sat',
            title: "💊 FARMACIA DE GUARDIA (Sábado)",
            content: "Turno de guardia hoy sábado y mañana domingo: Farmàcia La Font (C/ Colom, 2). Abierta 24h para cualquier urgencia.",
            category: "INFO",
            neighborhood: "GENERAL",
            author_name: "Col·legi de Farmàcies",
            itinerary: "• Todo el finde: Farm. La Font\n• Tel: 977 22 11 00\n• Urgencias: 117",
            created_at: new Date().toISOString()
        };

        const cleaningSuccess: Announcement = {
            id: 'clean-beach-success',
            title: "🌿 ÉXITO: Limpieza en el Miracle",
            content: "¡Gran jornada de limpieza esta mañana! Más de 30 voluntarios hemos dejado la playa del Miracle impecable. Gracias a todos los que habéis venido.",
            category: "EXITO",
            neighborhood: "BARRIS MARÍTIMS",
            author_name: "Mare Nostrum TGN",
            created_at: new Date().toISOString()
        };


        try {
            const data = await safeSupabaseFetch('announcements',
                supabase
                    .from('announcements')
                    .select('*')
                    .or(`neighborhood.eq.${user?.user_metadata?.neighborhood || 'GENERAL'},neighborhood.eq.GENERAL`)
                    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
                    .order('created_at', { ascending: false })
            );
            const fetched = data || [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const validFetched = fetched.filter((n: any) => {
                const nDate = new Date(n.created_at);
                const diffTime = Math.abs(today.getTime() - nDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            });

            setNotices([weatherAlert, weekendAgendaNotice, routineAdvisory, cleaningSuccess, ...validFetched]);
        } catch (e) {
            console.error(e);
            setNotices([weatherAlert]);
        } finally {
            setLoading(false);
        }
    };

    const handleNoticeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { success } = await safeSupabaseInsert('announcements', {
                user_id: user?.id,
                author_name: user?.user_metadata?.full_name || 'Vecino',
                title: title,
                content: content,
                category: type.toUpperCase(),
                neighborhood: user?.user_metadata?.neighborhood || 'GENERAL',
                expires_at: expiresAt || null
            });

            if (!success) throw new Error('Falló la creación');
            await addPoints(30, 15); // Recompensa por informar al barrio
            alert('¡Aviso publicado con éxito! +30 XP / +15 ComuniPoints');
            setShowCreateModal(false);
            setTitle('');
            setContent('');
            setExpiresAt('');
            fetchNotices();
        } catch (e) {
            console.error(e);
            alert('Error al publicar aviso');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20 font-sans">
            <div className="bg-red-600 text-white py-16 px-6">
                <div className="max-w-4xl mx-auto flex items-center gap-10">
                    <div className="hidden md:block">
                        <span className="material-symbols-outlined text-[120px] opacity-20">campaign</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black mb-4 tracking-tight">Avisos de Barrio</h1>
                        <p className="text-xl opacity-90 max-w-xl font-medium leading-relaxed">Información oficial y vecinal de última hora. Mantente al día de lo que afecta a {user?.user_metadata?.neighborhood || 'tu zona'}.</p>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-6 md:p-12 -mt-10">
                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-20 opacity-50">
                        <div className="size-10 border-4 border-red-500 border-t-transparent animate-spin rounded-full"></div>
                        <p className="text-xs font-black uppercase tracking-widest">Cargando avisos...</p>
                    </div>
                ) : notices.length === 0 ? (
                    <div className="bg-white dark:bg-surface-dark rounded-[32px] p-12 text-center shadow-xl">
                        <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">notifications_off</span>
                        <h3 className="text-xl font-black dark:text-white mb-2">No hay avisos recientes</h3>
                        <p className="text-gray-500 mb-6">Sé el primero en informar de algo importante en el barrio.</p>
                        <button onClick={() => setShowCreateModal(true)} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all">
                            PUBLICAR PRIMER AVISO
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {notices.map(notice => (
                            <AnnouncementItem key={notice.id} notice={notice} />
                        ))}
                    </div>
                )}

                <div className="mt-16 text-center">
                    <button onClick={() => setShowCreateModal(true)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-12 py-5 rounded-3xl font-black text-xl hover:shadow-2xl transition-all">
                        PUBLICAR AVISO
                    </button>
                </div>
            </main>

            {/* Create Modal */}
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
                                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Nuevo Aviso</h3>
                                <button onClick={() => setShowCreateModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleNoticeSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Tipo de Aviso</label>
                                    <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-red-500/20 focus:ring-2">
                                        <option value="Info">Información</option>
                                        <option value="Urgente">Urgente</option>
                                        <option value="Comunidad">Comunidad</option>
                                        <option value="Éxito">Éxito</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Título</label>
                                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-red-500/20 focus:ring-2" placeholder="Ej: Corte de calle por obras" />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                                    <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={4} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-red-500/20 focus:ring-2 resize-none" placeholder="Detalles del aviso..." />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Fecha de Caducidad (Opcional)</label>
                                    <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-red-500/20 focus:ring-2" />
                                    <p className="text-[10px] text-gray-400 mt-1 font-bold">El aviso desaparecerá automáticamente después de esta fecha.</p>
                                </div>
                                <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                                    PUBLICAR
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Announcements;
