import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface SupportCircle {
    id: string;
    initiator_id: string;
    title: string;
    description: string;
    neighborhood: string;
    contact_info: string;
    created_at: string;
}

const SupportCircles: React.FC = () => {
    const { user } = useAuth();
    const [circles, setCircles] = useState<SupportCircle[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [circleTitle, setCircleTitle] = useState('');
    const [circleDescription, setCircleDescription] = useState('');
    const [circleContact, setCircleContact] = useState('');

    useEffect(() => {
        fetchCircles();
    }, [user?.user_metadata?.neighborhood]);

    const fetchCircles = async () => {
        setLoading(true);
        try {
            const data = await safeSupabaseFetch('support_circles',
                supabase
                    .from('support_circles')
                    .select('*')
                    .eq('neighborhood', user?.user_metadata?.neighborhood || 'GENERAL')
                    .order('created_at', { ascending: false })
            );

            const mockCircles: SupportCircle[] = [
                {
                    id: 'mock-1',
                    initiator_id: 'v1',
                    title: 'Apoyo Ansiedad Escolar',
                    neighborhood: 'GENERAL',
                    description: 'Grupo para padres y adolescentes lidiando con el estrés de los exámenes y la presión social. Nos apoyamos y compartimos recursos.',
                    contact_info: '611 22 33 44',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'mock-2',
                    initiator_id: 'v2',
                    title: 'Duelo por Mascotas',
                    neighborhood: 'GENERAL',
                    description: 'Para quienes han perdido a un compañero peludo y necesitan hablar con personas que entiendan ese dolor.',
                    contact_info: '622 99 88 77',
                    created_at: new Date().toISOString()
                }
            ];

            setCircles(data && data.length > 0 ? data : mockCircles);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCircleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { success } = await safeSupabaseInsert('support_circles', {
                initiator_id: user?.id,
                title: circleTitle,
                description: circleDescription,
                contact_info: circleContact,
                neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
            });

            if (!success) throw new Error('Falló la creación');
            alert('¡Círculo de apoyo creado con éxito!');
            setShowCreateModal(false);
            setCircleTitle('');
            setCircleDescription('');
            setCircleContact('');
            fetchCircles();
        } catch (e) {
            console.error(e);
            alert('Error al crear círculo');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20 font-sans">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 py-24 px-6 border-b border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <span className="inline-block px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                        Apoyo Mutuo
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black dark:text-white tracking-tighter uppercase leading-none mb-6">
                        CÍRCULOS DE APOYO
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-bold max-w-2xl mx-auto mb-8">
                        Grupos de apoyo emocional, crianza, cuidados o cualquier situación que requiera acompañamiento.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-3 px-8 py-5 bg-purple-500 text-white rounded-[30px] shadow-2xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <span className="material-symbols-outlined font-black">add_circle</span>
                        CREAR CÍRCULO
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-10 py-16">
                {/* Featured Ad - Mental Health */}
                <div className="mb-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row items-center relative group">
                    <div className="md:w-1/2 p-10 md:p-16 relative z-10 text-white">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Iniciativa Destacada • Salud Mental</span>
                        <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">¿Sientes estrés o ansiedad?</h2>
                        <p className="text-lg opacity-90 font-medium mb-8 leading-relaxed">
                            No estás solo. Ofrecemos acompañamiento gratuito y grupos de apoyo para adolescentes y adultos que luchan con la presión diaria. Aprende técnicas de mindfulness y gestión emocional con vecinos titulados.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="tel:611223344" className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">call</span>
                                LLAMAR AHORA
                            </a>
                            <a href="https://wa.me/34611223344" className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">chat</span>
                                WHATSAPP
                            </a>
                        </div>
                    </div>
                    <div className="md:w-1/2 h-64 md:h-[500px] relative">
                        <img
                            src="https://images.unsplash.com/photo-1518391846015-55a9cc003b25?q=80&w=800&auto=format&fit=crop"
                            className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                            alt="Stress Support"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 md:from-transparent to-transparent"></div>
                    </div>
                    {/* Decorative badge */}
                    <div className="absolute top-10 right-10 size-24 bg-yellow-400 rounded-full flex flex-col items-center justify-center text-indigo-900 rotate-12 shadow-2xl z-20 hidden md:flex">
                        <span className="text-[10px] font-black uppercase">Felicidad</span>
                        <span className="text-2xl font-black italic">GRATIS</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-20 opacity-20">
                        <div className="size-10 border-4 border-purple-500 border-t-transparent animate-spin rounded-full"></div>
                        <p className="text-xs font-black uppercase tracking-widest">Cargando círculos...</p>
                    </div>
                ) : circles.length === 0 ? (
                    <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 p-12 rounded-[40px] border-2 border-dashed border-purple-500/20 text-center max-w-2xl mx-auto">
                        <span className="material-symbols-outlined text-purple-500 text-6xl mb-4 block">groups</span>
                        <h3 className="text-lg font-black dark:text-white mb-2">No hay círculos de apoyo aún</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Sé el primero en crear un círculo de apoyo en {user?.user_metadata?.neighborhood || 'tu barrio'}.
                            Puede ser un grupo de madres/padres, apoyo emocional, cuidado de mayores, o cualquier situación donde el apoyo mutuo sea valioso.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/20"
                        >
                            CREAR PRIMER CÍRCULO
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {circles.map((circle, idx) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                key={circle.id}
                                className="group bg-white dark:bg-surface-dark rounded-[35px] p-8 border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-purple-500/30 transition-all"
                            >
                                <div className="flex items-start gap-6 mb-6">
                                    <div className="shrink-0 size-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-3xl text-purple-500">groups</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-black dark:text-white leading-tight mb-2 group-hover:text-purple-500 transition-colors">
                                            {circle.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-sm">person</span>
                                            <span className="font-bold">Iniciado por vecino</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                    {circle.description}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                                    {circle.contact_info && (
                                        <>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                📞 {circle.contact_info}
                                            </span>
                                            <a
                                                href={`tel:${circle.contact_info}`}
                                                className="px-5 py-2.5 bg-purple-500/10 text-purple-500 rounded-xl text-xs font-black hover:bg-purple-500 hover:text-white transition-all"
                                            >
                                                UNIRME
                                            </a>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-16 bg-gradient-to-r from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 p-8 rounded-[35px] border border-purple-500/20">
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-purple-500 text-3xl">info</span>
                        <div>
                            <h3 className="text-sm font-black dark:text-white mb-2 uppercase tracking-widest">Qué son los círculos de apoyo</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                Son grupos de vecinos que se reúnen para apoyarse mutuamente en situaciones específicas. El apoyo puede ser emocional, práctico o simplemente compartir experiencias.
                            </p>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li>✓ Grupos de crianza y maternidad/paternidad</li>
                                <li>✓ Apoyo en duelo o pérdidas</li>
                                <li>✓ Cuidadores de personas dependientes</li>
                                <li>✓ Apoyo emocional en momentos difíciles</li>
                                <li>✓ Grupos de autoayuda</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Circle Modal */}
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
                                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Crear Círculo de Apoyo</h3>
                                <button onClick={() => setShowCreateModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleCircleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre del Círculo</label>
                                    <input
                                        type="text"
                                        value={circleTitle}
                                        onChange={(e) => setCircleTitle(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-purple-500/20 outline-none"
                                        placeholder="Ej: Grupo de Apoyo a la Maternidad"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                                    <textarea
                                        value={circleDescription}
                                        onChange={(e) => setCircleDescription(e.target.value)}
                                        required
                                        rows={5}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-purple-500/20 outline-none resize-none"
                                        placeholder="Describe el propósito del círculo, cuándo se reúnen, qué tipo de apoyo ofrecen..."
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Tu Contacto</label>
                                    <input
                                        type="text"
                                        value={circleContact}
                                        onChange={(e) => setCircleContact(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-purple-500/20 outline-none"
                                        placeholder="Teléfono o email"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2">
                                        Los interesados te contactarán para unirse al círculo
                                    </p>
                                </div>

                                <button type="submit" className="w-full bg-purple-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/20">
                                    Crear Círculo
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupportCircles;
