import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const Advertise: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company: '',
        contact: '',
        email: '',
        type: 'Oferta Local',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('ad_requests').insert({
                business_name: formData.company,
                contact_name: formData.contact,
                email: formData.email,
                type: formData.type,
                message: formData.message
            });

            if (error) throw error;

            alert('¡Solicitud enviada con éxito! La administración de ComuniTarr revisará tu propuesta y te contactará pronto.');
            setFormData({ company: '', contact: '', email: '', type: 'Oferta Local', message: '' });
        } catch (error) {
            console.error(error);
            alert('Error al enviar la solicitud. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20">
            <div className="bg-primary text-white py-16 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 z-0"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <span className="material-symbols-outlined text-6xl mb-4">campaign</span>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Haz Crecer tu Negocio</h1>
                    <p className="text-xl opacity-90">Llega a miles de vecinos de Tarragona directamente. Promociona tus servicios en ComuniTarr.</p>
                </div>
            </div>

            <main className="max-w-4xl mx-auto -mt-10 px-6 relative z-10">
                <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h2 className="text-2xl font-black dark:text-white mb-6">¿Por qué anunciarte aquí?</h2>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600">
                                        <span className="material-symbols-outlined">target</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold dark:text-white">Público Local 100%</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Tus anuncios solo los ven personas que viven cerca de tu negocio.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600">
                                        <span className="material-symbols-outlined">analytics</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold dark:text-white">Estadísticas Reales</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Recibe informes mensuales de cuántos vecinos han visto tu oferta.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600">
                                        <span className="material-symbols-outlined">verified</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold dark:text-white">Confianza Vecinal</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Al estar en ComuniTarr, ganas el sello de "Comercio de Confianza".</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h2 className="text-2xl font-black dark:text-white mb-6">Contacta con Administración</h2>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nombre del Negocio</label>
                                <input required value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Persona de Contacto</label>
                                <input required value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tipo de Promoción</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3">
                                    <option>Oferta Local (Descuentos)</option>
                                    <option>Patrocinio de Evento</option>
                                    <option>Banner Principal</option>
                                    <option>Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Mensaje</label>
                                <textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 h-32" placeholder="Cuéntanos qué te gustaría promocionar..."></textarea>
                            </div>
                            <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black font-black py-4 rounded-xl hover:scale-105 transition shadow-xl">
                                ENVIAR SOLICITUD
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Advertise;
