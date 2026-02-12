import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface Workshop {
    id: string;
    title: string;
    instructor: string;
    date: string;
    description: string;
    image: string;
    spots: number;
    neighborhood: string;
    contact_info: string;
    created_at: string;
}

const Workshops: React.FC = () => {
    const { user } = useAuth();
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState('');
    const [instructor, setInstructor] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [spots, setSpots] = useState('10');
    const [contact, setContact] = useState('');

    useEffect(() => {
        fetchWorkshops();
    }, [user?.user_metadata?.neighborhood]);

    const fetchWorkshops = async () => {
        setLoading(true);
        try {
            const data = await safeSupabaseFetch('workshops',
                supabase
                    .from('workshops')
                    .select('*')
                    .eq('neighborhood', user?.user_metadata?.neighborhood || 'GENERAL')
                    .order('created_at', { ascending: false })
            );
            setWorkshops(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { success } = await safeSupabaseInsert('workshops', {
                creator_id: user?.id,
                title,
                instructor,
                date,
                description,
                image: image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
                spots: parseInt(spots),
                contact_info: contact,
                neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
            });

            if (!success) throw new Error('Falló la creación');
            alert('¡Taller propuesto con éxito!');
            setShowCreateModal(false);
            setTitle('');
            setDescription('');
            setInstructor('');
            setDate('');
            setContact('');
            fetchWorkshops();
        } catch (e) {
            console.error(e);
            alert('Error al crear taller');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20 font-sans">
            {/* Header */}
            <div className="bg-emerald-900 text-white py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10 blur-sm"></div>
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <span className="inline-block px-5 py-2 mb-6 text-xs font-black bg-emerald-500/20 backdrop-blur-md rounded-full uppercase tracking-[0.2em] text-emerald-300 border border-emerald-500/30">
                        Aprendizaje Comunitario
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">Talleres Gratuitos</h1>
                    <p className="text-xl md:text-2xl text-emerald-100/90 font-medium leading-relaxed max-w-3xl mx-auto">Comparte tu conocimiento o aprende algo nuevo. Iniciativa abierta para vecinos.</p>
                </div>
            </div>

            {/* Featured Class / Service Ad */}
            <div className="max-w-6xl mx-auto px-6 mb-12">
                <div className="bg-white dark:bg-surface-dark rounded-[40px] border-4 border-dashed border-emerald-500/20 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 hover:border-emerald-500/40 transition-all">
                    <div className="size-32 md:size-48 bg-emerald-100 dark:bg-emerald-900/30 rounded-[35px] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-7xl text-emerald-600">school</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">DESTACADO</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">APOYO ESCOLAR</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black dark:text-white mb-4 leading-tight">Taller de Máscaras Exprés 🎭</h2>
                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-6 max-w-2xl leading-relaxed text-sm md:text-base">
                            ¿Aún no tienes antifaz para el sábado? Ven hoy al Centro Cívico y diseña tu máscara de Carnaval con materiales reciclados. Todo incluido. ¡Gratis para vecinos!
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="tel:655892144" className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black hover:scale-105 transition-all">
                                <span className="material-symbols-outlined text-sm">call</span>
                                655 89 21 44
                            </a>
                            <span className="px-6 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-xl text-xs font-black">
                                DESDE 12€/HORA
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-10 text-center">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-emerald-600/20"
                >
                    CONVERTIRME EN INSTRUCTOR
                </button>
            </div>

            {/* List */}
            <div className="max-w-6xl mx-auto p-6 md:p-12 relative z-20 space-y-10">
                {loading ? (
                    <div className="text-center opacity-50 font-bold uppercase tracking-widest">Cargando talleres...</div>
                ) : workshops.length === 0 ? (
                    <div className="bg-white dark:bg-surface-dark p-12 rounded-[40px] text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">school</span>
                        <h3 className="text-xl font-black dark:text-white mb-2">No hay talleres programados</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Sé el primero en enseñar algo a tus vecinos.</p>
                    </div>
                ) : (
                    workshops.map(workshop => (
                        <div key={workshop.id} className="bg-white dark:bg-surface-dark p-8 md:p-10 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-10 hover:translate-y-[-4px] transition-all duration-500 group">
                            <div className="w-full md:w-[350px] h-[250px] shrink-0 rounded-[32px] overflow-hidden relative shadow-xl">
                                <img src={workshop.image} alt={workshop.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black text-emerald-600 shadow-lg">
                                    {workshop.spots} plazas
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-emerald-500 transition-colors">{workshop.title}</h3>
                                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6 font-bold">
                                    <span className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="material-symbols-outlined text-emerald-500">school</span>
                                        {workshop.instructor}
                                    </span>
                                    <span className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="material-symbols-outlined text-emerald-500">calendar_month</span>
                                        {workshop.date}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-lg">
                                    {workshop.description}
                                </p>
                                {workshop.contact_info && (
                                    <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Contacto para inscripciones</p>
                                        <p className="font-bold text-gray-700 dark:text-gray-300">{workshop.contact_info}</p>
                                    </div>
                                )}
                                <button onClick={() => alert(`Contacta a ${workshop.instructor} en ${workshop.contact_info}`)} className="bg-emerald-600 text-white px-10 py-5 rounded-[24px] font-black text-lg hover:bg-emerald-700 transition-all w-full md:w-fit shadow-2xl shadow-emerald-600/20 active:scale-95">
                                    CONTACTAR ORGANIZADOR
                                </button>
                            </div>
                        </div>
                    )))}
            </div>

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
                            className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Proponer Taller</h3>
                                <button onClick={() => setShowCreateModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl mb-4 text-center">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Ideas Rápidas (Click para rellenar)</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {[
                                            { t: 'Huerto Urbano', i: 'Pedro S.', d: 'Sábado 11:00 AM', desc: 'Aprende a cultivar tus propios tomates y lechugas en el balcón.', c: '688000111' },
                                            { t: 'Smartphone Pro', i: 'Marta G.', d: 'Lunes 18:30 PM', desc: 'Sácale provecho a tu móvil: fotos, seguridad y apps útiles.', c: '699222333' },
                                            { t: 'Costura Básica', i: 'Julia L.', d: 'Miércoles 17:00 PM', desc: 'Aprende a coser botones, bajos y arreglos sencillos.', c: '611444555' }
                                        ].map((idea, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    setTitle(idea.t);
                                                    setInstructor(idea.i);
                                                    setDate(idea.d);
                                                    setDescription(idea.desc);
                                                    setContact(idea.c);
                                                }}
                                                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-xl text-[9px] font-black uppercase text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                            >
                                                + {idea.t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Título</label>
                                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-emerald-500/20 focus:ring-2" placeholder="Ej: Taller de Pintura" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Instructor</label>
                                        <input type="text" value={instructor} onChange={e => setInstructor(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-emerald-500/20 focus:ring-2" placeholder="Tu nombre" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Fecha y Hora</label>
                                    <input type="text" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-emerald-500/20 focus:ring-2" placeholder="Ej: Sábados 10:00 AM" />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-emerald-500/20 focus:ring-2 resize-none" placeholder="¿Qué aprenderán los alumnos?" />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Tu Contacto (Email/Telf)</label>
                                    <input type="text" value={contact} onChange={e => setContact(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-emerald-500/20 focus:ring-2" placeholder="Para que los alumnos se inscriban" />
                                </div>

                                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                                    PUBLICAR TALLER
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Workshops;
