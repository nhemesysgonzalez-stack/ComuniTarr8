
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [partners, setPartners] = useState<any[]>([]);
    const [stats, setStats] = useState({ users: 0, partners: 0, news: 0 });
    const [loading, setLoading] = useState(true);

    // SEGURIDAD: Solo Cindy puede entrar
    useEffect(() => {
        if (!user || user.email !== 'nhemesysgonzalez@gmail.com') {
            navigate('/');
        } else {
            fetchAdminData();
        }
    }, [user]);

    const fetchAdminData = async () => {
        setLoading(true);

        // 1. Cargar solicitudes de comercios
        const { data: partnersData } = await supabase
            .from('business_partners')
            .select('*')
            .order('created_at', { ascending: false });

        if (partnersData) setPartners(partnersData);

        // 2. Cargar estadísticas rápidas
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: newsCount } = await supabase.from('announcements').select('*', { count: 'exact', head: true });

        setStats({
            users: userCount || 0,
            partners: partnersData?.length || 0,
            news: newsCount || 0
        });

        setLoading(false);
    };

    const handleAction = async (id: string, newStatus: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('business_partners')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert(`Error al actualizar: ${error.message}`);
        } else {
            alert(`Solicitud ${newStatus === 'approved' ? 'aprobada' : 'rechazada'} con éxito.`);
            fetchAdminData();
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 font-sans pb-20">
            {/* Header Admin */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-primary">admin_panel_settings</span>
                        Panel de Cindy
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">
                        Gestión centralizada de ComuniTarr
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-[10px] font-black text-primary uppercase">Vecinos</p>
                        <p className="text-2xl font-black dark:text-white">{stats.users}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-[10px] font-black text-emerald-500 uppercase">Comercios</p>
                        <p className="text-2xl font-black dark:text-white">{stats.partners}</p>
                    </div>
                </div>
            </div>

            {/* Solicitudes de Comercios */}
            <section className="space-y-6">
                <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined">pending_actions</span>
                    Solicitudes de Comercios
                </h2>

                <div className="grid gap-4">
                    {partners.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 p-10 rounded-[40px] text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No hay solicitudes pendientes</p>
                        </div>
                    ) : (
                        partners.map((partner) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={partner.id}
                                className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-3xl text-primary">storefront</span>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black dark:text-white leading-none">{partner.business_name}</h3>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">
                                            {partner.business_type} • {partner.neighborhood}
                                        </p>
                                        <div className="flex gap-2 items-center">
                                            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                                Propuesta: {partner.proposed_discount}
                                            </span>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${partner.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                                                {partner.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {partner.status === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => handleAction(partner.id, 'rejected')}
                                                className="size-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                title="Rechazar"
                                            >
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                            <button
                                                onClick={() => handleAction(partner.id, 'approved')}
                                                className="bg-primary text-white h-12 px-6 rounded-2xl font-black text-xs hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm">check</span>
                                                APROBAR COMERCIO
                                            </button>
                                        </>
                                    ) : (
                                        <div className={`size-12 rounded-2xl flex items-center justify-center ${partner.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                            <span className="material-symbols-outlined font-black">
                                                {partner.status === 'approved' ? 'verified' : 'block'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>

            {/* Quick Actions */}
            <section className="grid md:grid-cols-2 gap-8">
                <Link to="/announcements" className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[40px] text-white shadow-xl hover:scale-[1.02] transition-all group overflow-hidden relative">
                    <span className="material-symbols-outlined absolute -right-10 -bottom-10 text-[200px] opacity-10 group-hover:rotate-12 transition-transform">campaign</span>
                    <h3 className="text-2xl font-black mb-2 relative z-10">Publicar Aviso Oficial</h3>
                    <p className="opacity-80 font-medium relative z-10">Envía una noticia importante a todo el barrio en un segundo.</p>
                </Link>
                <Link to="/polls" className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[40px] text-white shadow-xl hover:scale-[1.02] transition-all group overflow-hidden relative">
                    <span className="material-symbols-outlined absolute -right-10 -bottom-10 text-[200px] opacity-10 group-hover:rotate-12 transition-transform">how_to_vote</span>
                    <h3 className="text-2xl font-black mb-2 relative z-10">Crear Votación</h3>
                    <p className="opacity-80 font-medium relative z-10">Lanza una encuesta para que el barrio decida sobre un tema.</p>
                </Link>
            </section>
        </div>
    );
};

export default Admin;
