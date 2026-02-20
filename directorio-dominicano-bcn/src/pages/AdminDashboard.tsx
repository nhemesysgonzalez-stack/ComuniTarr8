import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {
    Shield, CheckCircle, XCircle, Users, Building2,
    BarChart3, Search, AlertTriangle, Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Business } from '../types';

const AdminDashboard: React.FC = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
    const [, setLoading] = useState(true);
    const [stats] = useState({
        totalUsers: 245,
        totalBusinesses: 156,
        premiumBusinesses: 12
    });

    useEffect(() => {
        if (isAdmin) {
            fetchAdminData();
        }
    }, [isAdmin]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const { data: pending } = await supabase
                .from('dd_businesses')
                .select('*')
                .eq('is_approved', false);

            if (pending) setPendingBusinesses(pending);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        const { error } = await supabase
            .from('dd_businesses')
            .update({ is_approved: true })
            .eq('id', id);

        if (!error) fetchAdminData();
    };

    if (authLoading) return <div className="p-20 text-center">Cargando auth...</div>;
    if (!isAdmin) return <Navigate to="/" />;

    return (
        <div className="bg-surface-2 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-4 mb-12">
                    <div className="size-16 bg-dr-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">Panel de Control</h1>
                        <p className="text-gray-500 font-bold">Administración Global del Directorio</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="card p-8 flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-blue-50 text-dr-blue flex items-center justify-center"><Users size={28} /></div>
                        <div>
                            <span className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Usuarios</span>
                            <p className="text-3xl font-black text-dr-blue">{stats.totalUsers}</p>
                        </div>
                    </div>
                    <div className="card p-8 flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-red-50 text-dr-red flex items-center justify-center"><Building2 size={28} /></div>
                        <div>
                            <span className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Negocios</span>
                            <p className="text-3xl font-black text-dr-red">{stats.totalBusinesses}</p>
                        </div>
                    </div>
                    <div className="card p-8 flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-amber-50 text-dr-gold flex items-center justify-center"><BarChart3 size={28} /></div>
                        <div>
                            <span className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Suscripciones</span>
                            <p className="text-3xl font-black text-dr-gold">{stats.premiumBusinesses}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase tracking-tight">Solicitudes Pendientes</h2>
                            <span className="badge badge-red">{pendingBusinesses.length} Nuevas</span>
                        </div>

                        {pendingBusinesses.length === 0 ? (
                            <div className="card p-12 text-center">
                                <CheckCircle size={40} className="text-green-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold">No hay negocios pendientes de aprobación.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingBusinesses.map(biz => (
                                    <div key={biz.id} className="card p-6 flex flex-col md:flex-row items-center gap-6 hover:border-dr-blue transition-colors">
                                        <div className="size-20 rounded-2xl overflow-hidden shrink-0">
                                            <img src={biz.images[0]} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="font-black text-lg mb-1">{biz.name}</h4>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{biz.category} • {biz.city}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="btn btn-outline btn-sm gap-2"><Eye size={14} /> Ver</button>
                                            <button onClick={() => handleApprove(biz.id)} className="btn btn-primary btn-sm bg-green-600 border-green-600 hover:bg-green-700 gap-2">
                                                <CheckCircle size={14} /> Aprobar
                                            </button>
                                            <button className="btn btn-outline btn-sm text-dr-red border-dr-red/20 hover:bg-dr-red hover:text-white gap-2">
                                                <XCircle size={14} /> Rechazar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-black uppercase tracking-tight">Acciones Rápidas</h2>
                        <div className="card p-6 space-y-3">
                            <button className="btn btn-outline w-full justify-start gap-4">
                                <Search size={18} /> Buscar Negocio
                            </button>
                            <button className="btn btn-outline w-full justify-start gap-4">
                                <AlertTriangle size={18} /> Reportes de Spam
                            </button>
                            <button className="btn btn-outline w-full justify-start gap-4">
                                <Building2 size={18} /> Gestionar Ciudades
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
