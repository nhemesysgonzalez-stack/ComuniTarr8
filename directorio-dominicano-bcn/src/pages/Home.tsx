import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Crown, ChevronRight, TrendingUp, Users, Award } from 'lucide-react';
import { CATEGORIES, type Business } from '../types';
import { supabase } from '../lib/supabase';

const Home: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            setLoading(true);
            // Mock data for initial development while DB tables are created
            const mockFeatured: Business[] = [
                {
                    id: '1',
                    owner_id: 'owner1',
                    name: 'Restaurante El Criollo',
                    slug: 'restaurante-el-criollo',
                    category: 'Restaurantes',
                    description: 'El auténtico sabor dominicano en el corazón de Barcelona. Mofongo, Sancocho y el mejor Pica Pollo.',
                    address: 'Carrer de Trafalgar, 45, Barcelona',
                    city: 'Barcelona',
                    phone: '934 12 34 56',
                    whatsapp: '600112233',
                    images: ['https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?q=80&w=800&auto=format&fit=crop'],
                    is_premium: true,
                    is_approved: true,
                    is_featured: true,
                    views: 1250,
                    clicks: 340,
                    rating_avg: 4.8,
                    rating_count: 56,
                    created_at: new Date().toISOString()
                },
                {
                    id: '2',
                    owner_id: 'owner2',
                    name: 'Colmado La Bendición',
                    slug: 'colmado-la-bendicion',
                    category: 'Colmados',
                    description: 'Todos los productos de nuestra tierra: plátanos, salami Induveca, maltas y más.',
                    address: 'Carrer de la Unió, 12, Barcelona',
                    city: 'Barcelona',
                    phone: '931 22 33 44',
                    whatsapp: '611223344',
                    images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop'],
                    is_premium: true,
                    is_approved: true,
                    is_featured: true,
                    views: 890,
                    clicks: 210,
                    rating_avg: 4.5,
                    rating_count: 32,
                    created_at: new Date().toISOString()
                },
                {
                    id: '3',
                    owner_id: 'owner3',
                    name: 'Peluquería Estilo Dominicano',
                    slug: 'peluqueria-estilo-dominicano',
                    category: 'Belleza',
                    description: 'Especialistas en cortes dominicanos, blowout y color. Ven a ponerte bella.',
                    address: 'Avinguda del Paral·lel, 120, Barcelona',
                    city: 'Barcelona',
                    phone: '933 44 55 66',
                    whatsapp: '622334455',
                    images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop'],
                    is_premium: true,
                    is_approved: true,
                    is_featured: true,
                    views: 740,
                    clicks: 180,
                    rating_avg: 4.9,
                    rating_count: 45,
                    created_at: new Date().toISOString()
                }
            ];

            try {
                const { data } = await supabase
                    .from('dd_businesses')
                    .select('*')
                    .eq('is_featured', true)
                    .eq('is_approved', true)
                    .limit(3);

                if (data && data.length > 0) setFeaturedBusinesses(data);
                else setFeaturedBusinesses(mockFeatured);
            } catch (e) {
                setFeaturedBusinesses(mockFeatured);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="hero-gradient py-24 md:py-32 relative text-white overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center animate-in">
                        <h1 className="section-title text-white mb-6 text-shadow-lg">
                            El rincón dominicano en <span className="text-dr-red">Barcelona</span>
                        </h1>
                        <p className="text-lg md:text-xl font-medium opacity-90 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Descubre los mejores restaurantes, servicios y negocios locales de nuestra comunidad. ¡Siéntete como en casa!
                        </p>

                        {/* Search Box */}
                        <div className="bg-white/10 backdrop-blur-xl p-2 rounded-3xl border border-white/20 shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto">
                            <div className="flex-1 flex items-center gap-3 px-4 py-3 text-white">
                                <Search size={22} className="text-white/60" />
                                <input
                                    type="text"
                                    placeholder="¿Qué estás buscando? (ex: Pica Pollo)"
                                    className="bg-transparent border-none outline-none w-full text-lg placeholder:text-white/50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="hidden md:block w-px bg-white/20 h-10 my-auto"></div>
                            <div className="flex items-center gap-2 px-4 py-3 text-white">
                                <MapPin size={22} className="text-white/60" />
                                <span className="font-bold">Barcelona</span>
                            </div>
                            <Link
                                to={`/directorio?search=${searchTerm}`}
                                className="btn btn-red btn-lg shadow-xl"
                            >
                                Buscar
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-8 mt-16 text-white/80">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={18} className="text-dr-gold" />
                                <span className="font-black">150+ Negocios</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-dr-gold" />
                                <span className="font-black">2k+ Usuarios</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award size={18} className="text-dr-gold" />
                                <span className="font-black">Calidad DR</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Badges Visualization */}
                <div className="absolute top-20 -left-10 size-40 bg-dr-red rounded-full opacity-10 blur-3xl"></div>
                <div className="absolute bottom-10 -right-10 size-60 bg-dr-blue rounded-full opacity-10 blur-3xl"></div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h2 className="section-title mb-4">Explora por Categoría</h2>
                            <p className="section-subtitle">Lo que necesites, de nuestra gente para nuestra gente.</p>
                        </div>
                        <Link to="/directorio" className="btn btn-ghost group">
                            Ver todo <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {CATEGORIES.slice(0, 11).map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/directorio?category=${cat.slug}`}
                                className="flex flex-col items-center gap-4 p-8 rounded-3xl border border-gray-100 hover:border-dr-blue hover:shadow-xl transition-all group animate-in"
                            >
                                <div
                                    className="size-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm"
                                    style={{ backgroundColor: `${cat.color}10`, color: cat.color }}
                                >
                                    {cat.icon}
                                </div>
                                <span className="font-bold text-sm text-gray-700">{cat.name}</span>
                            </Link>
                        ))}
                        <Link
                            to="/directorio"
                            className="flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 border-dashed border-gray-200 hover:border-dr-blue transition-all group"
                        >
                            <div className="size-16 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-dr-blue">
                                <Search size={32} />
                            </div>
                            <span className="font-bold text-sm text-gray-500">Más...</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Businesses Section */}
            <section className="py-20 bg-surface-2">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="badge badge-premium">Premium</span>
                        <span className="font-black text-[10px] uppercase tracking-widest text-dr-gold">Destacados</span>
                    </div>
                    <h2 className="section-title mb-12">Negocios Recomendados</h2>

                    <div className="business-grid">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="card h-[400px] animate-pulse bg-gray-200"></div>
                            ))
                        ) : (
                            featuredBusinesses.map((biz) => (
                                <Link key={biz.id} to={`/negocio/${biz.slug}`} className="card card-premium flex flex-col h-full group">
                                    <div className="relative aspect-video overflow-hidden">
                                        <img
                                            src={biz.images[0]}
                                            alt={biz.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                            <Star size={14} className="text-dr-gold fill-dr-gold" />
                                            <span className="font-black text-xs text-dr-blue">{biz.rating_avg}</span>
                                        </div>
                                        {biz.is_premium && (
                                            <div className="absolute top-4 right-4 bg-dr-blue text-white p-2 rounded-xl shadow-lg border border-white/20">
                                                <Crown size={18} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex-grow flex flex-col">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-dr-blue mb-2">{biz.category}</div>
                                        <h3 className="text-xl font-black mb-3 group-hover:text-dr-blue transition-colors line-clamp-1">{biz.name}</h3>
                                        <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed font-medium">{biz.description}</p>

                                        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <MapPin size={14} />
                                                <span className="text-xs font-bold leading-none">{biz.city}</span>
                                            </div>
                                            <div className="btn btn-ghost btn-sm p-0 group-hover:text-dr-blue">
                                                Ver perfil <ChevronRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Pricing / Join Section */}
            <section className="py-24 bg-white overflow-hidden relative">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <span className="badge badge-blue mb-6">Impulsa tu negocio</span>
                            <h2 className="section-title mb-6 leading-none">
                                ¿Tienes un negocio <span className="text-dr-red italic">dominicano</span>?
                            </h2>
                            <p className="text-lg text-gray-500 font-medium mb-10 leading-relaxed">
                                Únete al directorio más grande de España y conecta con miles de clientes de nuestra comunidad. Tenemos planes para todos los tamaños.
                            </p>

                            <ul className="space-y-4 mb-10">
                                <li className="flex items-start gap-3">
                                    <div className="size-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5">
                                        <TrendingUp size={14} />
                                    </div>
                                    <div>
                                        <span className="font-black text-sm block">Mayor Visibilidad</span>
                                        <span className="text-xs text-gray-400 font-bold">Aparece en las primeras posiciones de búsqueda.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5">
                                        <Users size={14} />
                                    </div>
                                    <div>
                                        <span className="font-black text-sm block">Clientes Directos</span>
                                        <span className="text-xs text-gray-400 font-bold">Botón directo a WhatsApp para tus clientes.</span>
                                    </div>
                                </li>
                            </ul>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/registro" className="btn btn-primary btn-lg px-12 shadow-2xl shadow-dr-blue/20">Registrarme Ahora</Link>
                                <Link to="/beneficios" className="btn btn-outline btn-lg">Saber más</Link>
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full">
                            <div className="pricing-card featured relative z-10">
                                <div className="absolute top-0 right-0 bg-dr-red text-white py-2 px-6 rounded-bl-3xl font-black text-xs uppercase tracking-widest shadow-lg">
                                    Top Recomendado
                                </div>
                                <div className="mb-8">
                                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Plan Premium</h3>
                                    <p className="text-white/60 font-bold text-sm">Escala tu negocio al máximo</p>
                                </div>
                                <div className="flex items-center justify-center gap-1 mb-8">
                                    <span className="text-5xl font-black">10€</span>
                                    <span className="text-white/60 font-bold">/mes</span>
                                </div>
                                <ul className="space-y-4 text-left mb-10">
                                    <li className="flex items-center gap-3 font-bold text-sm">
                                        <span className="material-symbols-outlined text-dr-gold">check_circle</span>
                                        Perfil Destacado y Badge Gold
                                    </li>
                                    <li className="flex items-center gap-3 font-bold text-sm">
                                        <span className="material-symbols-outlined text-dr-gold">check_circle</span>
                                        Galería de hasta 10 fotos
                                    </li>
                                    <li className="flex items-center gap-3 font-bold text-sm">
                                        <span className="material-symbols-outlined text-dr-gold">check_circle</span>
                                        Video promocional en perfil
                                    </li>
                                    <li className="flex items-center gap-3 font-bold text-sm">
                                        <span className="material-symbols-outlined text-dr-gold">check_circle</span>
                                        Estadísticas detalladas de clics
                                    </li>
                                    <li className="flex items-center gap-3 font-bold text-sm">
                                        <span className="material-symbols-outlined text-dr-gold">check_circle</span>
                                        Sección de Promociones propia
                                    </li>
                                </ul>
                                <Link to="/registro?plan=premium" className="btn btn-gold btn-lg w-full font-black uppercase tracking-widest">
                                    Elegir Premium
                                </Link>
                                <p className="mt-6 text-[10px] text-white/40 font-bold uppercase tracking-widest">Sin compromiso • Cancela cuando quieras</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
