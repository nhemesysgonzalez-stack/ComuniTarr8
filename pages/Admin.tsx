
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [partners, setPartners] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [activityStats, setActivityStats] = useState<any[]>([]);
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

        try {
            // 1. Cargar solicitudes de comercios
            const { data: partnersData } = await supabase
                .from('business_partners')
                .select('*')
                .order('created_at', { ascending: false });

            if (partnersData) setPartners(partnersData);

            // 2. Cargar últimos vecinos registrados (Todos para Cindy)
            const { data: usersData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (usersData) setRecentUsers(usersData);

            // 3. Cargar Actividad Reciente
            const { data: activityData } = await supabase
                .from('activity_logs')
                .select('*, profiles(full_name, avatar_url)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (activityData) setRecentActivity(activityData);

            // 4. Calcular Estadísticas de Actividad (Agrupar por acción)
            const { data: groupData } = await supabase
                .from('activity_logs')
                .select('action');

            if (groupData) {
                const counts = groupData.reduce((acc: any, curr: any) => {
                    acc[curr.action] = (acc[curr.action] || 0) + 1;
                    return acc;
                }, {});
                const sortedStats = Object.entries(counts)
                    .map(([name, count]) => ({ name, count: count as number }))
                    .sort((a, b) => b.count - a.count);
                setActivityStats(sortedStats);
            }

            // 5. Cargar estadísticas rápidas
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: newsCount } = await supabase.from('announcements').select('*', { count: 'exact', head: true });

            setStats({
                users: userCount || 0,
                partners: partnersData?.length || 0,
                news: newsCount || 0
            });
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
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
                                            <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">payments</span>
                                                Coste: {partner.required_points || 50} CP
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

            {/* Dashboard Stats Extra */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activityStats.slice(0, 3).map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Acción</p>
                        <h3 className="text-lg font-black dark:text-white uppercase">{stat.name}</h3>
                        <p className="text-3xl font-black text-primary">{stat.count} <span className="text-xs opacity-50">votos/clics</span></p>
                    </div>
                ))}
            </div>

            {/* Nueva sección: Actividad en Tiempo Real */}
            <section className="grid lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">military_tech</span>
                        Ranking de Actividad
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        {recentUsers.slice(0, 8).sort((a, b) => (b.karma || 0) - (a.karma || 0)).map((u, i) => (
                            <div key={u.id} className="p-5 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-black text-gray-300 w-6">#{i + 1}</span>
                                    <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.full_name}`} className="size-10 rounded-xl" alt="" />
                                    <div>
                                        <p className="text-sm font-black dark:text-white">{u.full_name}</p>
                                        <p className="text-[9px] font-black text-gray-400 font-bold uppercase tracking-widest">{u.neighborhood || 'SIN BARRIO'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-black text-primary leading-none">{u.karma || 0} XP</p>
                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none mt-1">{u.comuni_points || 0} CP</p>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-200">chevron_right</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        Actividad en Tiempo Real
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden max-h-[500px] overflow-y-auto custom-scrollbar">
                        {recentActivity.length === 0 ? (
                            <div className="p-10 text-center text-gray-400 font-bold">No hay actividad registrada aún</div>
                        ) : (
                            recentActivity.map((activity) => (
                                <div key={activity.id} className="p-5 border-b border-gray-50 dark:border-gray-700 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <img
                                        src={activity.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${activity.profiles?.full_name || 'V'}`}
                                        className="size-10 rounded-xl"
                                        alt=""
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold dark:text-white truncate">
                                            {activity.profiles?.full_name || 'Vecino'}
                                            <span className="text-primary mx-2">→</span>
                                            <span className="font-black text-xs uppercase tracking-tighter">{activity.action}</span>
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                                            {new Date(activity.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-[8px] font-black bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">
                                        {activity.details?.neighborhood || 'GENERAL'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500">trending_up</span>
                        Frecuencia de Módulos
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                        {activityStats.map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black uppercase tracking-widest dark:text-white">{stat.name}</span>
                                    <span className="text-xs font-black text-primary">{stat.count} ACCIONES</span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((stat.count / (activityStats[0]?.count || 1)) * 100, 100)}%` }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nuevos Vecinos (Usuarios) */}
            <section className="space-y-6">
                <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined">group_add</span>
                    Listado Completo de Vecinos ({recentUsers.length})
                </h2>

                <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-gray-700">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vecino</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Barrio</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Puntos</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.full_name || 'V'}`} className="size-10 rounded-xl object-cover" alt="V" />
                                                <span className="font-bold dark:text-white">{u.full_name || 'Sin nombre'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-xs font-black text-primary uppercase">{u.neighborhood || 'GENERAL'}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-xs font-black dark:text-white">{u.karma || 0} XP</span>
                                        </td>
                                        <td className="px-8 py-4 text-xs text-gray-400 font-bold uppercase">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
