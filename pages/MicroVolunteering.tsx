import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface VolunteerOpportunity {
    id: string;
    creator_id: string;
    title: string;
    description: string;
    neighborhood: string;
    contact_info: string;
    created_at: string;
}

const MicroVolunteering: React.FC = () => {
    const { user } = useAuth();
    const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [opportunityTitle, setOpportunityTitle] = useState('');
    const [opportunityDescription, setOpportunityDescription] = useState('');
    const [opportunityContact, setOpportunityContact] = useState('');

    useEffect(() => {
        fetchOpportunities();
    }, [user?.user_metadata?.neighborhood]);

    const fetchOpportunities = async () => {
        setLoading(true);
        try {
            const data = await safeSupabaseFetch('volunteer_opportunities',
                supabase
                    .from('volunteer_opportunities')
                    .select('*')
                    .eq('neighborhood', user?.user_metadata?.neighborhood || 'GENERAL')
                    .order('created_at', { ascending: false })
            );

            setOpportunities(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleOpportunitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { success } = await safeSupabaseInsert('volunteer_opportunities', {
                creator_id: user?.id,
                title: opportunityTitle,
                description: opportunityDescription,
                contact_info: opportunityContact,
                neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
            });

            if (!success) throw new Error('Falló la creación');
            alert('¡Oportunidad de voluntariado creada!');
            setShowCreateModal(false);
            setOpportunityTitle('');
            setOpportunityDescription('');
            setOpportunityContact('');
            fetchOpportunities();
        } catch (e) {
            console.error(e);
            alert('Error al crear oportunidad');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20 font-sans">
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 py-24 px-6 border-b border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <span className="inline-block px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                        Ayuda Rápida
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black dark:text-white tracking-tighter uppercase leading-none mb-6">
                        MICRO-VOLUNTARIADO
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-bold max-w-2xl mx-auto mb-8">
                        Pequeñas acciones, gran impacto. Ofrece o encuentra ayuda puntual en tu barrio.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-3 px-8 py-5 bg-blue-500 text-white rounded-[30px] shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <span className="material-symbols-outlined font-black">add_circle</span>
                        PUBLICAR TAREA
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-10 py-16">
                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-20 opacity-20">
                        <div className="size-10 border-4 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
                        <p className="text-xs font-black uppercase tracking-widest">Cargando oportunidades...</p>
                    </div>
                ) : opportunities.length === 0 ? (
                    <div className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 p-12 rounded-[40px] border-2 border-dashed border-blue-500/20 text-center max-w-2xl mx-auto">
                        <span className="material-symbols-outlined text-blue-500 text-6xl mb-4 block">handshake</span>
                        <h3 className="text-lg font-black dark:text-white mb-2">No hay tareas de voluntariado aún</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Sé el primero en publicar una tarea de micro-voluntariado en {user?.user_metadata?.neighborhood || 'tu barrio'}.
                            Puede ser ayudar a un vecino mayor con la compra, pasear un perro, acompañar a alguien al médico, o cualquier ayuda puntual.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                        >
                            PUBLICAR PRIMERA TAREA
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {opportunities.map((opportunity, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={opportunity.id}
                                className="group bg-white dark:bg-surface-dark rounded-[35px] p-6 md:p-8 border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-blue-500/30 transition-all"
                            >
                                <div className="flex gap-6 items-start">
                                    <div className="shrink-0 size-16 md:size-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-3xl text-blue-500">handshake</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg md:text-xl font-black dark:text-white leading-tight mb-3 group-hover:text-blue-500 transition-colors">
                                            {opportunity.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                            {opportunity.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm text-blue-500">person</span>
                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                                    Publicado por vecino
                                                </span>
                                            </div>
                                            {opportunity.contact_info && (
                                                <>
                                                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
                                                    <a
                                                        href={`tel:${opportunity.contact_info}`}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-xs font-black hover:bg-blue-500 hover:text-white transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">call</span>
                                                        AYUDAR
                                                    </a>
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        📞 {opportunity.contact_info}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-16 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 p-8 rounded-[35px] border border-blue-500/20">
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-blue-500 text-3xl">info</span>
                        <div>
                            <h3 className="text-sm font-black dark:text-white mb-2 uppercase tracking-widest">Qué es el micro-voluntariado</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                Son pequeñas tareas puntuales que no requieren compromiso a largo plazo. Perfectas para ayudar cuando tienes un rato libre.
                            </p>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li>✓ Ayuda con la compra a vecinos mayores</li>
                                <li>✓ Pasear mascotas</li>
                                <li>✓ Acompañamiento a citas médicas</li>
                                <li>✓ Ayuda con tecnología</li>
                                <li>✓ Pequeñas reparaciones</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Opportunity Modal */}
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
                                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Publicar Tarea</h3>
                                <button onClick={() => setShowCreateModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleOpportunitySubmit} className="space-y-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-3xl mb-4">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 text-center">Ideas Rápidas (Click para rellenar)</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {[
                                            { t: 'Limpieza Playas', d: '¿Alguien se apunta a una jornada de limpieza en la Playa del Miracle este domingo? Me pondré en contacto con la Associació Aurora.', c: 'Coordinar en Foro' },
                                            { t: 'Paseo APAPT', d: 'Voy a la protectora a pasear perros el martes. ¿Algún vecino se anima a venir conmigo?', c: '633445566' },
                                            { t: 'Ocio Down TGN', d: 'Acompañamiento para joven con Down a ver los Gigantes de Tarragona. 1 hora aproximada.', c: '611223344' },
                                            { t: 'Info Abrazos', d: 'Me gustaría saber horarios y requisitos para el voluntariado de abrazos en el Joan XXIII.', c: 'Ver Secc. Servicios' }
                                        ].map((idea, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    setOpportunityTitle(idea.t);
                                                    setOpportunityDescription(idea.d);
                                                    setOpportunityContact(idea.c);
                                                }}
                                                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl text-[9px] font-black uppercase text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                            >
                                                + {idea.t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">¿Qué necesitas?</label>
                                    <input
                                        type="text"
                                        value={opportunityTitle}
                                        onChange={(e) => setOpportunityTitle(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
                                        placeholder="Ej: Ayuda para llevar la compra a casa"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Detalles</label>
                                    <textarea
                                        value={opportunityDescription}
                                        onChange={(e) => setOpportunityDescription(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-blue-500/20 outline-none resize-none"
                                        placeholder="Describe la tarea: cuándo, dónde, cuánto tiempo aproximado..."
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Tu Contacto</label>
                                    <input
                                        type="text"
                                        value={opportunityContact}
                                        onChange={(e) => setOpportunityContact(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
                                        placeholder="Teléfono o email"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2">
                                        Los voluntarios te contactarán para ayudarte
                                    </p>
                                </div>

                                <button type="submit" className="w-full bg-blue-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
                                    Publicar Tarea
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MicroVolunteering;
