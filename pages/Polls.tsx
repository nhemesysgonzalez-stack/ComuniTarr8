import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';
import { logActivity } from '../services/activityLogger';

interface Poll {
    id: string;
    creator_id: string;
    title: string;
    options: string[];
    neighborhood: string;
    created_at: string;
}

const Polls: React.FC = () => {
    const { user, addPoints } = useAuth();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [votedPollIds, setVotedPollIds] = useState<string[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [pollTitle, setPollTitle] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);

    const handleVote = async (pollId: string, optionIndex: number, optionText: string) => {
        // Verificar si ya ha votado
        if (votedPollIds.includes(pollId)) {
            alert('Usted ya ha efectuado su voto en esta votación.');
            return;
        }

        const confirmVote = window.confirm(`¿Quieres registrar tu voto para "${optionText}"?`);
        if (!confirmVote) return;

        try {
            const { success } = await safeSupabaseInsert('poll_votes', {
                poll_id: pollId,
                user_id: user?.id,
                option_index: optionIndex,
                option_text: optionText,
                neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
            });

            if (success) {
                await addPoints(20, 5); // Recompensa por votar
                await logActivity('Votar en Encuesta', { pollId, optionText, neighborhood: user?.user_metadata?.neighborhood });
                alert(`¡Gracias! Tu voto para "${optionText}" ha sido registrado correctamente. +20 XP / +5 ComuniPoints`);
                setVotedPollIds(prev => [...prev, pollId]);
            }
        } catch (e) {
            console.error(e);
            alert('Hubo un problema al registrar tu voto.');
        }
    };

    useEffect(() => {
        fetchPolls();
    }, [user?.user_metadata?.neighborhood]);

    const fetchPolls = async () => {
        setLoading(true);
        try {
            const data = await safeSupabaseFetch('polls',
                supabase
                    .from('polls')
                    .select('*')
                    .eq('neighborhood', user?.user_metadata?.neighborhood || 'GENERAL')
                    .order('created_at', { ascending: false })
            );

            const mockPolls: Poll[] = [
                {
                    id: 'poll-sat-1',
                    creator_id: 'v1',
                    title: '¿Qué te ha parecido el ambiente festivo de este sábado en la Rambla? 🎭',
                    options: ['Genial, mucha vida', 'Demasiado ruido', 'Bien, pero falta sombra', 'No he pasado por allí'],
                    neighborhood: 'GENERAL',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'poll-sat-2',
                    creator_id: 'v2',
                    title: '¿Participarás en la Carrera Popular de mañana domingo? 🏃',
                    options: ['Sí, como corredor', 'Sí, como voluntario/público', 'No puedo ir', 'No sabía que había carrera'],
                    neighborhood: 'GENERAL',
                    created_at: new Date().toISOString()
                }
            ];

            setPolls(data && data.length > 0 ? data : mockPolls);

            // Cargar los votos del usuario actual
            if (user?.id) {
                const { data: voteData } = await supabase
                    .from('poll_votes')
                    .select('poll_id')
                    .eq('user_id', user.id);

                if (voteData) {
                    setVotedPollIds(voteData.map(v => v.poll_id));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };


    const handlePollSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validOptions = pollOptions.filter(opt => opt.trim() !== '');

        if (validOptions.length < 2) {
            alert('Debes tener al menos 2 opciones');
            return;
        }

        try {
            const { success } = await safeSupabaseInsert('polls', {
                creator_id: user?.id,
                title: pollTitle,
                options: validOptions,
                neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
            });

            if (!success) throw new Error('Falló la creación');
            await addPoints(50, 15); // Recompensa por crear consulta
            await logActivity('Crear Encuesta', { title: pollTitle, neighborhood: user?.user_metadata?.neighborhood });
            alert('¡Votación creada con éxito! +50 XP / +15 ComuniPoints');
            setShowCreateModal(false);
            setPollTitle('');
            setPollOptions(['', '']);
            fetchPolls();
        } catch (e) {
            console.error(e);
            alert('Error al crear votación');
        }
    };

    const addOption = () => {
        setPollOptions([...pollOptions, '']);
    };

    const removeOption = (index: number) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20 font-sans">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 py-24 px-6 border-b border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <span className="inline-block px-4 py-2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                        Democracia Vecinal
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black dark:text-white tracking-tighter uppercase leading-none mb-6">
                        VOTACIONES
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-bold max-w-2xl mx-auto mb-8">
                        Decide junto a tus vecinos sobre temas importantes del barrio. (Las votaciones actuales pueden ser ejemplos).
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-3 px-8 py-5 bg-cyan-500 text-white rounded-[30px] shadow-2xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <span className="material-symbols-outlined font-black">add_circle</span>
                        CREAR VOTACIÓN
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-10 py-16">
                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-20 opacity-20">
                        <div className="size-10 border-4 border-cyan-500 border-t-transparent animate-spin rounded-full"></div>
                        <p className="text-xs font-black uppercase tracking-widest">Cargando votaciones...</p>
                    </div>
                ) : (
                    <div className="space-y-8">

                        <div className="flex items-center gap-4 py-8">
                            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Otras Votaciones Vecinales</span>
                            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                        </div>

                        {polls.length === 0 ? (
                            <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 p-12 rounded-[40px] border-2 border-dashed border-cyan-500/20 text-center max-w-2xl mx-auto">
                                <span className="material-symbols-outlined text-cyan-500 text-6xl mb-4 block">how_to_vote</span>
                                <h3 className="text-lg font-black dark:text-white mb-2">No hay más votaciones activas</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    Crea una votación para consultar otros temas con tus vecinos en {user?.user_metadata?.neighborhood || 'tu barrio'}.
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-6 py-3 bg-cyan-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
                                >
                                    CREAR NUEVA VOTACIÓN
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {polls.map((poll, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={poll.id}
                                        className="group bg-white dark:bg-surface-dark rounded-[35px] p-8 border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-cyan-500/30 transition-all"
                                    >
                                        <div className="flex items-start gap-6 mb-6">
                                            <div className="shrink-0 size-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-3xl text-cyan-500">how_to_vote</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-black dark:text-white leading-tight mb-2 group-hover:text-cyan-500 transition-colors">
                                                    {poll.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="material-symbols-outlined text-sm">person</span>
                                                    <span className="font-bold">Propuesta por vecino</span>
                                                    <span>•</span>
                                                    <span>{new Date(poll.created_at).toLocaleDateString('es-ES')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {poll.options.map((option, optIdx) => {
                                                const hasVoted = votedPollIds.includes(poll.id);
                                                return (
                                                    <button
                                                        key={optIdx}
                                                        disabled={hasVoted}
                                                        onClick={() => handleVote(poll.id, optIdx, option)}
                                                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all group/option ${hasVoted
                                                            ? 'border-gray-100 dark:border-gray-800 opacity-60 cursor-not-allowed'
                                                            : 'border-gray-100 dark:border-gray-800 hover:border-cyan-500 hover:bg-cyan-500/5'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold dark:text-white group-hover/option:text-cyan-500 transition-colors">
                                                                {option}
                                                            </span>
                                                            <span className="material-symbols-outlined text-gray-400 group-hover/option:text-cyan-500 transition-colors">
                                                                {hasVoted ? 'check_circle' : 'radio_button_unchecked'}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                                💡 <strong>Nota:</strong> Esta es una votación informativa creada por un vecino. Los resultados sirven para conocer la opinión de la comunidad.
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-16 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 p-8 rounded-[35px] border border-cyan-500/20">
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-cyan-500 text-3xl">info</span>
                        <div>
                            <h3 className="text-sm font-black dark:text-white mb-2 uppercase tracking-widest">Cómo funcionan las votaciones</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                Las votaciones son propuestas creadas por vecinos para conocer la opinión de la comunidad sobre diferentes temas.
                                Son informativas y ayudan a tomar decisiones colectivas.
                            </p>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li>✓ Propuestas de mejoras en el barrio</li>
                                <li>✓ Organización de eventos</li>
                                <li>✓ Proyectos comunitarios</li>
                                <li>✓ Normas de convivencia</li>
                                <li>✓ Uso de espacios comunes</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Poll Modal */}
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
                            className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Crear Votación</h3>
                                <button onClick={() => setShowCreateModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handlePollSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Pregunta</label>
                                    <input
                                        type="text"
                                        value={pollTitle}
                                        onChange={(e) => setPollTitle(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-cyan-500/20 outline-none"
                                        placeholder="Ej: ¿Qué mejora prefieres para la plaza?"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Opciones</label>
                                    <div className="space-y-2">
                                        {pollOptions.map((option, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateOption(idx, e.target.value)}
                                                    required
                                                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-cyan-500/20 outline-none"
                                                    placeholder={`Opción ${idx + 1}`}
                                                />
                                                {pollOptions.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(idx)}
                                                        className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <span className="material-symbols-outlined">close</span>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="mt-3 w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-black text-gray-400 hover:border-cyan-500 hover:text-cyan-500 transition-all"
                                    >
                                        + AÑADIR OPCIÓN
                                    </button>
                                </div>

                                <button type="submit" className="w-full bg-cyan-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20">
                                    Crear Votación
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Polls;
