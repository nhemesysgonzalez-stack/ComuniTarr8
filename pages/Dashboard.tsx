import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Activity {
    id: string;
    activity_id: string;
    activity_type: string;
    status: string;
    created_at: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMyActivities();
        }
    }, [user]);

    const fetchMyActivities = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_activity_tracking')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setActivities(data || []);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark p-6 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">Mi Resumen</h1>
                        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">Actividades, retos y patrullas en las que estás inscrito.</p>
                    </div>
                    <div className="bg-primary px-8 py-4 rounded-[24px] shadow-xl shadow-primary/20 flex items-center gap-4 text-white">
                        <span className="material-symbols-outlined text-3xl">stars</span>
                        <div>
                            <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Puntos de Honor</p>
                            <p className="text-2xl font-black">1.250 XP</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Progress Card */}
                    <div className="bg-white dark:bg-surface-dark p-10 rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-black dark:text-white mb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            Retos Activos
                        </h3>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-black">
                                    <span className="dark:text-white">Reciclaje Semanal</span>
                                    <span className="text-primary">80%</span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[80%] rounded-full"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-black">
                                    <span className="dark:text-white">Km Solidarios</span>
                                    <span className="text-orange-500">40%</span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-[40%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Activities */}
                    <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-10 rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-black dark:text-white mb-8">Próximas Citas Vecinales</h3>

                        {loading ? (
                            <div className="flex flex-col items-center py-20 animate-pulse">
                                <div className="size-12 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
                                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-20 border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[32px] flex flex-col items-center">
                                <span className="material-symbols-outlined text-6xl text-gray-200 dark:text-gray-700 mb-6">event_busy</span>
                                <p className="text-gray-500 font-bold text-lg mb-8">Aún no te has inscrito en ninguna actividad.</p>
                                <button
                                    onClick={() => navigate('/challenges')}
                                    className="bg-primary text-white px-10 py-5 rounded-3xl font-black text-lg hover:scale-105 transition shadow-2xl shadow-primary/20"
                                >
                                    EXPLORAR RETOS
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((act) => (
                                    <div key={act.id} className="flex items-center gap-6 p-6 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-[24px] transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                        <div className={`size-14 rounded-[20px] flex items-center justify-center shadow-lg ${act.activity_type === 'patrol' ? 'bg-red-500 text-white' :
                                                act.activity_type === 'challenge' ? 'bg-primary text-white' : 'bg-gray-500 text-white'
                                            }`}>
                                            <span className="material-symbols-outlined text-3xl">
                                                {act.activity_type === 'patrol' ? 'shield' : 'trophy'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-xl dark:text-white capitalize">{act.activity_type} de Barrio</h4>
                                            <p className="text-sm text-gray-400 font-bold">Inscrito el {new Date(act.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full">
                                            <span className="material-symbols-outlined text-sm">verified</span>
                                            <span className="text-xs font-black uppercase">Confirmado</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
