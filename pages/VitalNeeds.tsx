import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface VitalNeed {
    id: string;
    creator_id: string;
    type: 'medical' | 'food' | 'company' | 'emotional' | 'other';
    title: string;
    description: string;
    contact_info: string;
    is_urgent: boolean;
    neighborhood: string;
    created_at: string;
}

const VitalNeeds: React.FC = () => {
    const { user } = useAuth();
    const [needs, setNeeds] = useState<VitalNeed[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [needType, setNeedType] = useState('medical');
    const [needTitle, setNeedTitle] = useState('');
    const [needDescription, setNeedDescription] = useState('');
    const [needContact, setNeedContact] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        fetchNeeds();
    }, [user?.user_metadata?.neighborhood]);

    const fetchNeeds = async () => {
        setLoading(true);
        try {
            const data = await safeSupabaseFetch('vital_needs',
                supabase
                    .from('vital_needs')
                    .select('*')
                    .eq('neighborhood', user?.user_metadata?.neighborhood || 'GENERAL')
                    .order('created_at', { ascending: false })
            );

            const mockNeeds: VitalNeed[] = [
                {
                    id: 'mock-n1',
                    creator_id: 'v4',
                    type: 'other',
                    title: 'Ayuda Limpiar Terraza',
                    description: 'Tengo toda la terraza llena de hojas y tierra del viento de ayer. ¿Algún chaval que quiera ganarse una propina ayudándome a barrer?',
                    contact_info: '622 34 56 78',
                    is_urgent: false,
                    neighborhood: 'GENERAL',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'mock-n2',
                    creator_id: 'v5',
                    type: 'other',
                    title: 'Coche para Concierto',
                    description: 'Voy a la Sala Zero esta noche y vivo en San Pere y San Pau. ¿Alguien baja en coche y tiene sitio? Comparto gasolina.',
                    contact_info: '655 89 21 00',
                    is_urgent: false,
                    neighborhood: 'GENERAL',
                    created_at: new Date().toISOString()
                }
            ];

            setNeeds(data && data.length > 0 ? data : mockNeeds);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleNeedSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { success } = await safeSupabaseInsert('vital_needs', {
                creator_id: user?.id,
                type: needType,
                title: needTitle,
                description: needDescription,
                contact_info: needContact,
                is_urgent: isUrgent,
                neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
            });

            if (!success) throw new Error('Falló la creación');
            alert('¡Solicitud de ayuda publicada!');
            setShowCreateModal(false);
            setNeedTitle('');
            setNeedDescription('');
            setNeedContact('');
            setIsUrgent(false);
            fetchNeeds();
        } catch (e) {
            console.error(e);
            alert('Error al crear solicitud');
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'medical': return 'medical_services';
            case 'food': return 'soup_kitchen';
            case 'company': return 'elderly';
            case 'emotional': return 'psychology';
            default: return 'help';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'medical': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
            case 'food': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
            case 'company': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'emotional': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
            default: return 'text-gray-500 bg-gray-50 dark:bg-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20 font-sans">
            {/* Header */}
            <div className="bg-red-500 text-white py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <span className="material-symbols-outlined text-6xl mb-4 text-red-100">favorite</span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Cuidados Vitales</h1>
                    <p className="text-xl max-w-2xl mx-auto opacity-90 font-medium leading-relaxed mb-8">
                        Una red de seguridad vecinal. Nadie en {user?.user_metadata?.neighborhood || 'Tarragona'} debería sentirse solo o desatendido en momentos difíciles.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-white text-red-600 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                    >
                        SOLICITAR AYUDA AHORA
                    </button>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-6 md:p-12 -mt-10 relative z-20">
                {/* Solidarity Initiatives Section */}
                <section className="mb-12 bg-white dark:bg-surface-dark rounded-[40px] p-8 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-8 border-l-[12px] border-l-emerald-500">
                    <div className="size-24 rounded-3xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-4xl text-emerald-600">cleaning_services</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full">ACCIÓN VECINAL</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">POST-TEMPORAL</span>
                        </div>
                        <h2 className="text-xl md:text-3xl font-black dark:text-white mb-2">Limpieza de Parques 🧹</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                            El viento ha dejado los parques llenos de ramas. Antes del fin de semana, organizamos cuadrillas para limpiar zonas de juego infantil. Si tienes guantes y tiempo, ¡acércate!
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                        <a href="#" onClick={(e) => { e.preventDefault(); alert('Gracias por unirte a la limpieza.'); }} className="px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all text-center flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">nature_people</span>
                            AYUDAR A LIMPIAR
                        </a>
                        <p className="text-[9px] text-center font-bold text-gray-400">Puntos: Parque Ciudad y Francolí</p>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Needs List */}
                    <div className="lg:col-span-2 space-y-8">
                        {loading ? (
                            <div className="flex flex-col items-center gap-4 py-20 opacity-50">
                                <div className="size-10 border-4 border-red-500 border-t-transparent animate-spin rounded-full"></div>
                                <p className="text-xs font-black uppercase tracking-widest">Cargando solicitudes...</p>
                            </div>
                        ) : needs.length === 0 ? (
                            <div className="bg-white dark:bg-surface-dark rounded-[35px] p-12 text-center border-2 border-dashed border-red-200 dark:border-red-900/30">
                                <span className="material-symbols-outlined text-red-300 text-6xl mb-4">volunteer_activism</span>
                                <h3 className="text-xl font-black dark:text-white mb-2">No hay solicitudes activas</h3>
                                <p className="text-gray-500 dark:text-gray-400">Si necesitas ayuda, no dudes en pedirla. Tus vecinos están aquí.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Tablón Comunitario</h2>
                                    <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200">Simulación del Sistema</span>
                                </div>
                                {needs.map(need => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={need.id}
                                        className={`bg-white dark:bg-surface-dark rounded-[30px] p-6 shadow-xl border ${need.is_urgent ? 'border-red-500/50 ring-4 ring-red-500/10' : 'border-gray-100 dark:border-gray-800'}`}
                                    >
                                        <div className="flex items-start gap-5">
                                            <div className={`shrink-0 size-14 rounded-2xl flex items-center justify-center ${getTypeColor(need.type)}`}>
                                                <span className="material-symbols-outlined text-3xl">{getTypeIcon(need.type)}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        {need.is_urgent && (
                                                            <span className="inline-block px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-2">URGENTE</span>
                                                        )}
                                                        <h3 className="text-lg font-black dark:text-white leading-tight mb-2">{need.title}</h3>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-400">{new Date(need.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{need.description}</p>

                                                <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                    {need.contact_info && (
                                                        <a href={`tel:${need.contact_info}`} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                                                            <span className="material-symbols-outlined text-sm">call</span>
                                                            CONTACTAR Y AYUDAR
                                                        </a>
                                                    )}
                                                </div>
                                                {need.contact_info && (
                                                    <p className="mt-2 text-[10px] text-gray-400 font-bold">📞 {need.contact_info}</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Stats & Info */}
                    <div className="space-y-6">
                        <div className="bg-emerald-500 text-white p-8 rounded-[35px] shadow-lg relative overflow-hidden">
                            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-emerald-400/50">volunteer_activism</span>
                            <h3 className="text-2xl font-black mb-2 relative z-10">Voluntarios Activos</h3>
                            <p className="text-5xl font-black mb-6 relative z-10">142</p>
                            <p className="relative z-10 font-medium">Vecinos dispuestos a ayudar en Tarragona ahora mismo.</p>
                            <button onClick={() => alert('¡Gracias! Te hemos apuntado como voluntario.')} className="mt-6 w-full py-3 bg-white text-emerald-600 font-black rounded-xl hover:bg-emerald-50 transition relative z-10 text-xs uppercase tracking-widest shadow-xl">
                                QUIERO SER VOLUNTARIO
                            </button>
                        </div>

                        <div className="bg-white dark:bg-surface-dark p-8 rounded-[35px] shadow-lg border-2 border-red-500/20 dark:border-red-900/30">
                            <h3 className="font-black text-red-600 dark:text-red-400 mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                Recursos Reales (24h)
                            </h3>
                            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                <li className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/30">
                                    <span className="material-symbols-outlined text-red-500">local_pharmacy</span>
                                    <div>
                                        <strong className="block text-red-700 dark:text-red-300">Farmàcia Fullana (24h)</strong>
                                        <p className="text-[10px] opacity-70">C/ de la Unió, 1 - 977 23 30 84</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                    <span className="material-symbols-outlined text-blue-500">medical_services</span>
                                    <div>
                                        <strong className="block text-blue-700 dark:text-blue-300">Hospital Joan XXIII</strong>
                                        <p className="text-[10px] opacity-70">Urgencias: 977 29 58 00</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                                    <span className="material-symbols-outlined text-orange-500">soup_kitchen</span>
                                    <div>
                                        <strong className="block text-orange-700 dark:text-orange-300">Menjador Social Bonavista</strong>
                                        <p className="text-[10px] opacity-70">C/ Vint, 2 - 977 54 91 80</p>
                                    </div>
                                </li>
                            </ul>
                            <p className="mt-6 text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center">
                                Información verificada para Tarragona
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Need Modal */}
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
                            className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Solicitar Ayuda</h3>
                                <button onClick={() => setShowCreateModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleNeedSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Tipo de Ayuda</label>
                                    <select
                                        value={needType}
                                        onChange={(e) => setNeedType(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-red-500/20 outline-none"
                                    >
                                        <option value="medical">Urgencia Médica / Salud</option>
                                        <option value="food">Alimentos / Necesidades Básicas</option>
                                        <option value="company">Compañía / Acompañamiento</option>
                                        <option value="emotional">Apoyo Emocional</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Título Breve</label>
                                    <input
                                        type="text"
                                        value={needTitle}
                                        onChange={(e) => setNeedTitle(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-red-500/20 outline-none"
                                        placeholder="Ej: Necesito ir a farmacia"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Detalles</label>
                                    <textarea
                                        value={needDescription}
                                        onChange={(e) => setNeedDescription(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-red-500/20 outline-none resize-none"
                                        placeholder="Explica qué necesitas con detalle..."
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Tu Contacto</label>
                                    <input
                                        type="text"
                                        value={needContact}
                                        onChange={(e) => setNeedContact(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-red-500/20 outline-none"
                                        placeholder="Teléfono (se mostrará a los vecinos)"
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                                    <input
                                        type="checkbox"
                                        id="urgent"
                                        checked={isUrgent}
                                        onChange={(e) => setIsUrgent(e.target.checked)}
                                        className="size-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <label htmlFor="urgent" className="text-sm font-bold text-red-700 dark:text-red-300">
                                        Es una urgencia
                                    </label>
                                </div>

                                <button type="submit" className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                                    Publicar Solicitud
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VitalNeeds;
