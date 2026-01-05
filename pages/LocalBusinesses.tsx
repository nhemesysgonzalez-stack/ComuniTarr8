
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';

const LocalBusinesses: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [showPartnerModal, setShowPartnerModal] = useState(false);
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState('Tienda');
    const [proposedDiscount, setProposedDiscount] = useState('');
    const [requiredPoints, setRequiredPoints] = useState('50');
    const [contact, setContact] = useState('');
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApprovedPartners();
    }, [user?.user_metadata?.neighborhood]);

    const fetchApprovedPartners = async () => {
        setLoading(true);
        try {
            const data = await safeSupabaseFetch('business_partners',
                supabase
                    .from('business_partners')
                    .select('*')
                    .eq('status', 'approved')
                    .or(`neighborhood.eq.${user?.user_metadata?.neighborhood || 'GENERAL'},neighborhood.eq.GENERAL`)
            );
            setPartners(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePartnerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Guardar la solicitud del comercio
        const { success } = await safeSupabaseInsert('business_partners', {
            user_id: user?.id,
            business_name: businessName,
            business_type: businessType,
            proposed_discount: proposedDiscount,
            required_points: parseInt(requiredPoints) || 50,
            contact_info: contact,
            neighborhood: user?.user_metadata?.neighborhood || 'GENERAL',
            status: 'pending'
        });

        if (success) {
            // 2. Generar notificación para Cindy
            await safeSupabaseInsert('admin_notifications', {
                type: 'NEW_BUSINESS_PARTNER',
                title: `Nuevo comercio: ${businessName}`,
                content: {
                    business_name: businessName,
                    type: businessType,
                    discount: proposedDiscount,
                    points_required: requiredPoints,
                    contact: contact,
                    neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
                },
                admin_email: 'nhemesysgonzalez@gmail.com'
            });

            alert('¡Gracias por unirte! He enviado una notificación a Cindy. Se pondrá en contacto contigo pronto.');
            setShowPartnerModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark font-sans">
            {/* Hero Section para Comercios */}
            <section className="bg-gradient-to-br from-indigo-900 to-primary py-20 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <span className="material-symbols-outlined text-[300px] absolute -top-20 -left-20 rotate-12">storefront</span>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">Impulsa tu comercio con ComuniPoints</h1>
                    <p className="text-xl md:text-2xl text-indigo-100 mb-10 leading-relaxed">
                        Únete a la economía circular de Tarragona. Atrae a nuevos clientes premiando la solidaridad vecinal con tus propios descuentos.
                    </p>
                    <button
                        onClick={() => setShowPartnerModal(true)}
                        className="bg-white text-primary px-10 py-5 rounded-[25px] font-black text-lg shadow-2xl hover:scale-105 transition-all uppercase tracking-widest"
                    >
                        Quiero ser comercio aliado
                    </button>
                </div>
            </section>

            {/* Recompensas Disponibles */}
            <section className="max-w-7xl mx-auto py-20 px-6 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-black dark:text-white uppercase tracking-tighter mb-2">Recompensas en {user?.user_metadata?.neighborhood || 'Tarragona'}</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Canjea tus ComuniPoints por estos beneficios exclusivos</p>
                    </div>
                    <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600">payments</span>
                        <div className="text-left">
                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Tu Saldo Actual</p>
                            <p className="text-xl font-black text-emerald-600 leading-none">{user?.user_metadata?.comuni_points || 0} CP</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-20 opacity-20">
                        <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
                        <p className="text-xs font-black uppercase tracking-widest">Cargando ofertas...</p>
                    </div>
                ) : partners.length === 0 ? (
                    <div className="bg-white dark:bg-surface-dark p-20 rounded-[40px] text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">redeem</span>
                        <h3 className="text-xl font-black dark:text-white mb-2 uppercase">Próximamente más recompensas</h3>
                        <p className="text-gray-500 max-w-md mx-auto italic">Estamos aprobando nuevos comercios en tu zona. ¡Vuelve pronto o invita a tu tienda favorita!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {partners.map((partner) => (
                            <motion.div
                                key={partner.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-surface-dark rounded-[40px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-emerald-500/30 transition-all group"
                            >
                                <div className="h-48 bg-gradient-to-br from-emerald-500/10 to-primary/10 flex items-center justify-center relative">
                                    <span className="material-symbols-outlined text-7xl text-emerald-500/20 group-hover:scale-125 transition-transform duration-500">
                                        {partner.business_type === 'Restauración' ? 'restaurant' :
                                            partner.business_type === 'Alimentación' ? 'shopping_cart' :
                                                partner.business_type === 'Moda / Regalos' ? 'apparel' : 'storefront'}
                                    </span>
                                    <div className="absolute bottom-4 left-6 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                                        <p className="text-2xl font-black text-emerald-600 leading-none">{partner.required_points || 50} <span className="text-[10px] uppercase font-black">CP</span></p>
                                    </div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-black dark:text-white leading-tight">{partner.proposed_discount}</h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{partner.business_name}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-emerald-500">verified</span>
                                    </div>
                                    <div className="h-[2px] bg-gray-50 dark:bg-gray-800 w-full"></div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                        {partner.neighborhood}
                                    </div>
                                    <button
                                        disabled={(user?.user_metadata?.comuni_points || 0) < (partner.required_points || 50)}
                                        onClick={() => {
                                            alert(`¡Genial! Presenta este código en ${partner.business_name} para obtener tu recompensa: CP-${Math.random().toString(36).substring(7).toUpperCase()}`);
                                        }}
                                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${(user?.user_metadata?.comuni_points || 0) >= (partner.required_points || 50)
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed grayscale'
                                            }`}
                                    >
                                        {(user?.user_metadata?.comuni_points || 0) >= (partner.required_points || 50) ? 'Canjear Recompensa' : 'Puntos insuficientes'}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="bg-gradient-to-br from-gray-900 to-black p-12 rounded-[50px] text-white flex flex-col md:flex-row items-center justify-between gap-8 mt-12 overflow-hidden relative shadow-2xl">
                    <span className="material-symbols-outlined text-[200px] absolute -right-20 -bottom-20 opacity-5 -rotate-12">volunteer_activism</span>
                    <div className="space-y-4 relative z-10 max-w-xl text-center md:text-left">
                        <h3 className="text-3xl font-black leading-tight uppercase tracking-tighter">¿Quieres más ComuniPoints?</h3>
                        <p className="text-gray-400 font-medium">Sigue ayudando a tus vecinos reportando baches, regando plantas o participando en las votaciones del barrio.</p>
                    </div>
                    <Link to="/" className="shrink-0 bg-white text-black px-10 py-5 rounded-[25px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all relative z-10">
                        Hacer una buena acción
                    </Link>
                </div>
            </section>

            {/* Modal de Inscripción */}
            <AnimatePresence>
                {showPartnerModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPartnerModal(false)}
                    >
                        <motion.div
                            initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-surface-dark p-8 md:p-12 rounded-[50px] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter leading-none">Forma parte de la red</h2>
                                <button onClick={() => setShowPartnerModal(false)} className="material-symbols-outlined text-gray-400 hover:text-red-500 transition-colors">close</button>
                            </div>

                            <form onSubmit={handlePartnerSubmit} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block mx-2">Nombre del Comercio</label>
                                    <input required value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-5 font-bold outline-none ring-primary/20 focus:ring-4 transition-all" placeholder="Ej: Panadería El Serrallo" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block mx-2">Tipo de Local</label>
                                        <select value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-5 font-bold outline-none ring-primary/20 focus:ring-4 transition-all appearance-none">
                                            <option>Restauración</option>
                                            <option>Alimentación</option>
                                            <option>Servicios</option>
                                            <option>Moda / Regalos</option>
                                            <option>Otros</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block mx-2">Título de la Recompensa</label>
                                        <input required value={proposedDiscount} onChange={e => setProposedDiscount(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-5 font-bold outline-none ring-primary/20 focus:ring-4 transition-all" placeholder="Ej: 10% dto. o Café gratis" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block mx-2">ComuniPoints necesarios para canjear</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            value={requiredPoints}
                                            onChange={e => setRequiredPoints(e.target.value)}
                                            className="w-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-none rounded-3xl p-5 font-black outline-none ring-emerald-500/20 focus:ring-4 transition-all pl-14"
                                        />
                                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500">payments</span>
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-600/50 uppercase">CP MÍNIMOS</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 mt-2 ml-2 italic">* El vecino verá que necesita {requiredPoints} CP para obtener tu "{proposedDiscount || 'oferta'}"</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block mx-2">Email o Teléfono de contacto</label>
                                    <input required value={contact} onChange={e => setContact(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-5 font-bold outline-none ring-primary/20 focus:ring-4 transition-all" />
                                </div>
                                <div className="bg-primary/10 p-6 rounded-3xl border border-primary/20">
                                    <p className="text-xs font-bold text-primary leading-relaxed">
                                        * Al unirte, aparecerás marcado con un icono especial en el mapa y en la sección de "Comercio Local". Tú podrás cambiar tu oferta en cualquier momento.
                                    </p>
                                </div>
                                <button type="submit" className="w-full bg-primary text-white p-6 rounded-3xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 transition-all uppercase tracking-widest">
                                    Enviar solicitud
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LocalBusinesses;
