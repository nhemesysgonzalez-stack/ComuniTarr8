
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { safeSupabaseInsert } from '../services/dataHandler';

const LocalBusinesses: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [showPartnerModal, setShowPartnerModal] = useState(false);
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState('Tienda');
    const [proposedDiscount, setProposedDiscount] = useState('');
    const [contact, setContact] = useState('');

    const handlePartnerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { success } = await safeSupabaseInsert('business_partners', {
            user_id: user?.id,
            business_name: businessName,
            business_type: businessType,
            proposed_discount: proposedDiscount,
            contact_info: contact,
            neighborhood: user?.user_metadata?.neighborhood || 'GENERAL',
            status: 'pending'
        });

        if (success) {
            alert('¡Gracias por unirte! Nos pondremos en contacto contigo pronto para activar tus ComuniPoints.');
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

            {/* Explicación del Sistema */}
            <section className="max-w-7xl mx-auto py-20 px-6 grid md:grid-cols-3 gap-12">
                <div className="bg-white dark:bg-gray-800 p-10 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                    <div className="size-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl text-blue-600">volunteer_activism</span>
                    </div>
                    <h3 className="text-2xl font-black dark:text-white">Los vecinos ayudan</h3>
                    <p className="text-gray-500 dark:text-gray-400">Los vecinos ganan puntos al realizar acciones positivas en el barrio (recados, clases, ayuda mutua).</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-10 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                    <div className="size-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl text-orange-600">currency_exchange</span>
                    </div>
                    <h3 className="text-2xl font-black dark:text-white">Canjean en tu local</h3>
                    <p className="text-gray-500 dark:text-gray-400">Tú decides qué beneficio ofreces (ej: 10% dto, un café gratis, 2x1) a cambio de una cantidad de puntos.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-10 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                    <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl text-green-600">trending_up</span>
                    </div>
                    <h3 className="text-2xl font-black dark:text-white">Ganas visibilidad</h3>
                    <p className="text-gray-500 dark:text-gray-400">Aparecerás destacado en el mapa como "Comercio Aliado" y atraerás a los vecinos más activos y solidarios.</p>
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
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block mx-2">Tu propuesta inicial</label>
                                        <input required value={proposedDiscount} onChange={e => setProposedDiscount(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-5 font-bold outline-none ring-primary/20 focus:ring-4 transition-all" placeholder="Ej: 10% descuento" />
                                    </div>
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
