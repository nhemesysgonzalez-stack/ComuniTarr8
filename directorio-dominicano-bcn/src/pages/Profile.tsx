import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    User, Settings, Crown, LayoutDashboard, CreditCard,
    Plus, Edit3, Trash2, Camera, ExternalLink,
    TrendingUp, Eye, MessageCircle
} from 'lucide-react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from '../lib/supabase';
import { type Business, CATEGORIES, CITIES } from '../types';

const Profile: React.FC = () => {
    const { user, signOut } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'businesses' | 'subscription'>('profile');
    const [showBusinessForm, setShowBusinessForm] = useState(searchParams.get('setup') === 'business');
    const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
    // const [loading, setLoading] = useState(true);

    // Business Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'Restaurantes',
        description: '',
        long_description: '',
        address: '',
        city: 'Barcelona',
        phone: '',
        whatsapp: '',
        instagram: '',
        facebook: '',
        website: ''
    });

    useEffect(() => {
        if (!user) navigate('/login');
        else fetchMyBusinesses();
    }, [user]);

    const fetchMyBusinesses = async () => {
        if (!user) return;
        try {
            const { data } = await supabase
                .from('dd_businesses')
                .select('*')
                .eq('owner_id', user.id);

            if (data) setMyBusinesses(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateBusiness = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const newBusiness = {
            ...formData,
            owner_id: user.id,
            slug,
            images: ['https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?q=80&w=800&auto=format&fit=crop'], // Placeholder
            is_premium: user.role === 'negocio_premium',
            is_approved: true, // Auto-approve for now
            is_featured: false,
            views: 0,
            clicks: 0,
            created_at: new Date().toISOString()
        };

        try {
            const { error } = await supabase.from('dd_businesses').insert(newBusiness);
            if (!error) {
                setShowBusinessForm(false);
                fetchMyBusinesses();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="bg-surface-2 min-h-screen py-12">
            <div className="container mx-auto px-4">

                {/* Header Profile */}
                <div className="bg-white rounded-[40px] p-8 md:p-12 mb-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative">
                        <div className="size-32 md:size-40 bg-dr-blue rounded-[40px] flex items-center justify-center text-white text-4xl font-black">
                            {user?.full_name[0] || 'U'}
                        </div>
                        <button className="absolute bottom-2 right-2 size-10 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-dr-blue transition-colors">
                            <Camera size={20} />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-3xl font-black uppercase tracking-tight">{user?.full_name}</h1>
                            {user?.role === 'negocio_premium' ? (
                                <span className="badge badge-premium">Premium User</span>
                            ) : (
                                <span className="badge badge-blue">{user?.role}</span>
                            )}
                        </div>
                        <p className="text-gray-500 font-bold mb-6">{user?.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`btn btn-sm gap-2 ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
                            >
                                <Settings size={14} /> Ajustes
                            </button>
                            {user?.role.startsWith('negocio') && (
                                <button
                                    onClick={() => setActiveTab('businesses')}
                                    className={`btn btn-sm gap-2 ${activeTab === 'businesses' ? 'btn-primary' : 'btn-ghost'}`}
                                >
                                    <LayoutDashboard size={14} /> Mis Negocios
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('subscription')}
                                className={`btn btn-sm gap-2 ${activeTab === 'subscription' ? 'btn-primary' : 'btn-ghost'}`}
                            >
                                <Crown size={14} /> Suscripción
                            </button>
                            <button onClick={() => signOut()} className="btn btn-ghost btn-sm text-dr-red hover:bg-red-50">Log Out</button>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="animate-in">
                    {activeTab === 'businesses' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black uppercase tracking-tight">Mis Negocios Registrados</h2>
                                <button
                                    onClick={() => setShowBusinessForm(true)}
                                    className="btn btn-primary gap-2"
                                >
                                    <Plus size={18} /> Nuevo Negocio
                                </button>
                            </div>

                            {showBusinessForm ? (
                                <div className="card p-10 max-w-3xl mx-auto">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="text-xl font-black uppercase tracking-tight">Información del Local</h3>
                                        <button onClick={() => setShowBusinessForm(false)} className="text-gray-400 font-bold hover:text-dr-red">Cancelar</button>
                                    </div>

                                    <form onSubmit={handleCreateBusiness} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="form-group">
                                                <label className="form-label">Nombre Comercial</label>
                                                <input
                                                    type="text" required className="form-input"
                                                    placeholder="Ej: El Rincon DR"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Categoría</label>
                                                <select
                                                    className="form-input"
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                >
                                                    {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Descripción Breve (Feed)</label>
                                            <input
                                                type="text" required className="form-input"
                                                placeholder="Una frase llamativa..."
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Historia y Detalles</label>
                                            <textarea
                                                className="form-input"
                                                placeholder="Cuéntanos más sobre tu negocio..."
                                                value={formData.long_description}
                                                onChange={e => setFormData({ ...formData, long_description: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="form-group">
                                                <label className="form-label">Dirección</label>
                                                <input
                                                    type="text" required className="form-input"
                                                    placeholder="Carrer de..."
                                                    value={formData.address}
                                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Ciudad</label>
                                                <select
                                                    className="form-input"
                                                    value={formData.city}
                                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                >
                                                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="form-group">
                                                <label className="form-label">Teléfono</label>
                                                <input
                                                    type="text" required className="form-input"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">WhatsApp (Con código 34)</label>
                                                <input
                                                    type="text" className="form-input"
                                                    placeholder="34600000000"
                                                    value={formData.whatsapp}
                                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className="btn btn-primary btn-lg w-full">Guardar y Publicar</button>
                                    </form>
                                </div>
                            ) : myBusinesses.length === 0 ? (
                                <div className="card p-20 text-center border-dashed border-2 border-gray-200">
                                    <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                        <Plus size={40} />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">Aún no tienes negocios</h3>
                                    <p className="text-gray-500 font-medium mb-8">Empieza publicando tu primer local en el directorio.</p>
                                    <button onClick={() => setShowBusinessForm(true)} className="btn btn-primary">Publicar Negocio</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myBusinesses.map(biz => (
                                        <div key={biz.id} className="card group flex flex-col h-full overflow-hidden">
                                            <div className="relative aspect-video">
                                                <img src={biz.images[0]} className="w-full h-full object-cover" alt="" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button className="size-10 bg-white rounded-xl flex items-center justify-center text-dr-blue hover:scale-110 transition-all shadow-lg"><Edit3 size={18} /></button>
                                                    <button className="size-10 bg-white rounded-xl flex items-center justify-center text-dr-red hover:scale-110 transition-all shadow-lg"><Trash2 size={18} /></button>
                                                </div>
                                                {biz.is_premium && <div className="absolute top-3 right-3 badge badge-premium px-2 py-0.5"><Crown size={10} /></div>}
                                            </div>
                                            <div className="p-6">
                                                <h4 className="font-black text-lg mb-1">{biz.name}</h4>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">{biz.category} • {biz.city}</p>

                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="bg-surface-2 p-3 rounded-xl">
                                                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-400 mb-1">
                                                            <Eye size={10} /> Vistas
                                                        </div>
                                                        <span className="font-black text-dr-blue">{biz.views}</span>
                                                    </div>
                                                    <div className="bg-surface-2 p-3 rounded-xl">
                                                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-400 mb-1">
                                                            <MessageCircle size={10} /> Clics WA
                                                        </div>
                                                        <span className="font-black text-dr-red">{biz.clicks}</span>
                                                    </div>
                                                </div>

                                                <Link to={`/negocio/${biz.slug}`} className="btn btn-outline btn-sm w-full gap-2">
                                                    Ver Perfil Público <ExternalLink size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'subscription' && (
                        <div className="max-w-4xl mx-auto space-y-10">
                            <div className="text-center mb-10">
                                <span className="badge badge-premium mb-4">Membresía Premium</span>
                                <h2 className="section-title mb-4 leading-none">Impulsa tu éxito</h2>
                                <p className="section-subtitle mx-auto">Toma el control total de tu visibilidad y conecta con más clientes dominicanos en Barcelona.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="card p-10 bg-white border-2 border-gray-100">
                                    <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">Tu estado actual</h3>
                                    <div className="p-6 bg-surface-2 rounded-3xl mb-8 flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Plan</span>
                                            <p className="text-2xl font-black text-dr-blue uppercase">{user?.role === 'negocio_premium' ? 'Premium Gold' : 'Básico Gratis'}</p>
                                        </div>
                                        {user?.role === 'negocio_premium' ? (
                                            <div className="size-14 rounded-2xl bg-dr-gold/20 text-dr-gold flex items-center justify-center">
                                                <Crown size={32} />
                                            </div>
                                        ) : (
                                            <div className="size-14 rounded-2xl bg-gray-100 text-gray-300 flex items-center justify-center">
                                                <User size={32} />
                                            </div>
                                        )}
                                    </div>

                                    <ul className="space-y-4 mb-10">
                                        <li className="flex items-center gap-3 text-sm font-bold text-gray-500">
                                            <TrendingUp size={16} className="text-dr-blue" /> Visibilidad en búsquedas: <span className="text-dr-blue ml-auto">{user?.role === 'negocio_premium' ? 'MÁXIMA' : 'NORMAL'}</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm font-bold text-gray-500">
                                            <Camera size={16} className="text-dr-blue" /> Límite de fotos: <span className="text-dr-blue ml-auto">{user?.role === 'negocio_premium' ? '10' : '1'}</span>
                                        </li>
                                    </ul>

                                    {user?.role !== 'negocio_premium' && (
                                        <div className="space-y-6">
                                            <div className="p-6 bg-dr-blue/5 border-2 border-dr-blue/10 rounded-3xl text-center">
                                                <span className="text-3xl font-black text-dr-blue">10€</span>
                                                <span className="text-sm font-bold text-gray-400">/mes</span>
                                            </div>

                                            {/* PayPal Integration */}
                                            <PayPalButtons
                                                style={{ layout: "vertical", shape: "pill", label: "subscribe" }}
                                                createSubscription={(_data, actions) => {
                                                    return actions.subscription.create({
                                                        plan_id: "P-YOUR_ACTUAL_PAYPAL_PLAN_ID_HERE" // The user will provide this later
                                                    });
                                                }}
                                                onApprove={async () => {
                                                    alert("¡Suscripción Premium activada! 🎉 (Simulación)");
                                                    // Here you would call Supabase to update the user role
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="size-12 rounded-2xl bg-dr-gold/10 text-dr-gold flex items-center justify-center shrink-0"><Crown size={24} /></div>
                                        <div>
                                            <h4 className="font-black text-lg mb-1 uppercase tracking-tight leading-none">Perfil Destacado Gold</h4>
                                            <p className="text-sm text-gray-500 font-medium">Aparece siempre arriba en tu categoría y destaca con un sello dorado oficial.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="size-12 rounded-2xl bg-dr-blue/10 text-dr-blue flex items-center justify-center shrink-0"><Eye size={24} /></div>
                                        <div>
                                            <h4 className="font-black text-lg mb-1 uppercase tracking-tight leading-none">Análisis de Resultados</h4>
                                            <p className="text-sm text-gray-500 font-medium">Mira cuántas personas ven tu local y cuántas te escriben por WhatsApp cada semana.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="size-12 rounded-2xl bg-dr-red/10 text-dr-red flex items-center justify-center shrink-0"><CreditCard size={24} /></div>
                                        <div>
                                            <h4 className="font-black text-lg mb-1 uppercase tracking-tight leading-none">Gestión Flexible</h4>
                                            <p className="text-sm text-gray-500 font-medium">Actualiza tus fotos comerciales y promociones en tiempo real. Cancela cuando quieras.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="max-w-2xl mx-auto card p-10">
                            <h2 className="text-2xl font-black mb-8 uppercase tracking-tight flex items-center gap-3">
                                <User className="text-dr-blue" /> Información de Cuenta
                            </h2>
                            <form className="space-y-6">
                                <div className="form-group">
                                    <label className="form-label">Nombre Completo</label>
                                    <input type="text" className="form-input" defaultValue={user?.full_name} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" disabled className="form-input bg-gray-50 opacity-60" defaultValue={user?.email} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ciudad</label>
                                    <select className="form-input" defaultValue={user?.city || 'Barcelona'}>
                                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <button type="button" className="btn btn-primary w-full">Guardar Cambios</button>
                            </form>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Profile;
