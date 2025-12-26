import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'Urgente' | 'Info' | 'Comunidad' | 'Éxito';
    author_name: string;
    created_at: string;
    neighborhood: string;
}

const Announcements: React.FC = () => {
    const { user } = useAuth();
    const [notices, setNotices] = useState<Announcement[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('Info');

    useEffect(() => {
        fetchNotices();
    }, [user?.user_metadata?.neighborhood]);

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const data = await safeSupabaseFetch('announcements',
                supabase
                    .from('announcements')
                    .select('*')
                    .eq('neighborhood', user?.user_metadata?.neighborhood || 'GENERAL')
                    .order('created_at', { ascending: false })
            );
            setNotices(data || []);
        } catch (e) {
            console.error(e);
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
                type: type,
                neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
            });

            if (!success) throw new Error('Falló la creación');
            alert('¡Aviso publicado con éxito!');
            setShowCreateModal(false);
            setTitle('');
            setContent('');
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
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={notice.id}
                                className={`bg-white dark:bg-surface-dark rounded-[32px] p-8 shadow-xl border-l-[12px] flex flex-col md:flex-row gap-8 items-start transition-all hover:scale-[1.01] ${notice.type === 'Urgente' ? 'border-l-red-500' :
                                        notice.type === 'Info' ? 'border-l-blue-500' :
                                            notice.type === 'Éxito' ? 'border-l-green-500' : 'border-l-orange-500'
                                    }`}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${notice.type === 'Urgente' ? 'bg-red-100 text-red-600' :
                                                notice.type === 'Info' ? 'bg-blue-100 text-blue-600' :
                                                    notice.type === 'Éxito' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {notice.type}
                                        </span>
                                        <span className="text-gray-400 font-bold text-[10px]">• {new Date(notice.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-2xl font-black dark:text-white mb-2 leading-tight">{notice.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
                                        {notice.content}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-[10px] font-black text-gray-500">
                                            {notice.author_name ? notice.author_name.charAt(0) : 'V'}
                                        </div>
                                        <span className="text-sm font-black text-gray-500">{notice.author_name || 'Vecino'}</span>
                                    </div>
                                </div>
                            </motion.div>
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
