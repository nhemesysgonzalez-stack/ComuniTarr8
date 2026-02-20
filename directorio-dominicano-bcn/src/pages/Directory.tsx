import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Filter, Star, Crown, ChevronRight, Grid, Map as MapIcon } from 'lucide-react';
import { CATEGORIES, CITIES, type Business } from '../types';
import { supabase } from '../lib/supabase';

const Directory: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const city = searchParams.get('city') || 'Barcelona';

    useEffect(() => {
        fetchBusinesses();
    }, [search, category, city]);

    const fetchBusinesses = async () => {
        setLoading(true);
        // Mock data for initial development
        const mockBusinesses: Business[] = [
            {
                id: '1',
                owner_id: 'owner1',
                name: 'Restaurante El Criollo',
                slug: 'restaurante-el-criollo',
                category: 'Restaurantes',
                description: 'El auténtico sabor dominicano en el corazón de Barcelona.',
                address: 'Carrer de Trafalgar, 45, Barcelona',
                city: 'Barcelona',
                phone: '934 12 34 56',
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
                description: 'Todos los productos de nuestra tierra.',
                address: 'Carrer de la Unió, 12, Barcelona',
                city: 'Barcelona',
                phone: '931 22 33 44',
                images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop'],
                is_premium: false,
                is_approved: true,
                is_featured: false,
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
                description: 'Especialistas en cortes dominicanos.',
                address: 'Avinguda del Paral·lel, 120, Barcelona',
                city: 'Barcelona',
                phone: '933 44 55 66',
                images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop'],
                is_premium: true,
                is_approved: true,
                is_featured: false,
                views: 740,
                clicks: 180,
                rating_avg: 4.9,
                rating_count: 45,
                created_at: new Date().toISOString()
            },
            {
                id: '4',
                owner_id: 'owner4',
                name: 'Gestoría Dominicana Barna',
                slug: 'gestoria-dominicana-barna',
                category: 'Servicios Pro',
                description: 'Trámites de extranjería y renovación de pasaportes.',
                address: 'Gran Via de les Corts Catalanes, 600, Barcelona',
                city: 'Barcelona',
                phone: '932 11 22 33',
                images: ['https://images.unsplash.com/photo-1454165833767-027ffea7028c?q=80&w=800&auto=format&fit=crop'],
                is_premium: false,
                is_approved: true,
                is_featured: false,
                views: 320,
                clicks: 85,
                rating_avg: 4.2,
                rating_count: 12,
                created_at: new Date().toISOString()
            }
        ];

        try {
            let query = supabase
                .from('dd_businesses')
                .select('*')
                .eq('is_approved', true);

            if (category) query = query.eq('category', category);
            if (city) query = query.eq('city', city);
            // search logic would be more complex on Supabase (ilike or full-text)

            const { data } = await query.order('is_premium', { ascending: false });

            if (data && data.length > 0) {
                setBusinesses(data);
            } else {
                // Simple local filter for mock data
                let filtered = [...mockBusinesses];
                if (category) filtered = filtered.filter(b => b.category.toLowerCase() === category.toLowerCase());
                if (search) filtered = filtered.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.description.toLowerCase().includes(search.toLowerCase()));
                setBusinesses(filtered);
            }
        } catch (e) {
            console.error(e);
            setBusinesses(mockBusinesses);
        } finally {
            setLoading(false);
        }
    };

    const updateParam = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        setSearchParams(newParams);
    };

    return (
        <div className="bg-surface-2 min-h-screen pb-20">
            {/* Search Bar Header */}
            <div className="bg-white border-b border-gray-200 py-8 sticky top-20 z-10 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="w-full md:flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o servicio..."
                                className="form-input pl-12 h-14 font-semibold text-lg"
                                value={search}
                                onChange={(e) => updateParam('search', e.target.value)}
                            />
                        </div>

                        <div className="flex w-full md:w-auto gap-4">
                            <div className="relative flex-1 md:w-48">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    className="form-input pl-12 h-14 font-bold"
                                    value={city}
                                    onChange={(e) => updateParam('city', e.target.value)}
                                >
                                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`btn h-14 px-6 gap-3 font-bold ${showFilters ? 'btn-primary' : 'btn-outline border-2'}`}
                            >
                                <Filter size={18} /> Filtros
                            </button>
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2 animate-in">
                            <button
                                onClick={() => updateParam('category', '')}
                                className={`pill ${category === '' ? 'pill-active' : 'pill-inactive'}`}
                            >
                                Todas
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => updateParam('category', cat.slug)}
                                    className={`pill ${category === cat.slug ? 'pill-active' : 'pill-inactive'}`}
                                >
                                    <span className="mr-1">{cat.icon}</span> {cat.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black dark:text-gray-900 uppercase tracking-tight">
                            {businesses.length} Resultados encontrados
                        </h1>
                        <p className="text-sm text-gray-500 font-bold mt-1">Explorando {category || 'todas las categorías'} en {city}</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-xl border border-gray-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-dr-blue text-white shadow-lg' : 'text-gray-400 hover:text-dr-blue'}`}
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-dr-blue text-white shadow-lg' : 'text-gray-400 hover:text-dr-blue'}`}
                        >
                            <MapIcon size={20} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <div className="spinner"></div>
                        <span className="text-xs font-black uppercase tracking-widest text-dr-blue">Buscando negocios...</span>
                    </div>
                ) : businesses.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-200">
                        <div className="size-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-black mb-2">No encontramos nada</h2>
                        <p className="text-gray-500 font-medium mb-8">Intenta cambiar los filtros o buscar términos más generales.</p>
                        <button
                            onClick={() => setSearchParams({ city: 'Barcelona' })}
                            className="btn btn-primary"
                        >
                            Limpiar Búsqueda
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="business-grid">
                        {businesses.map((biz) => (
                            <Link
                                key={biz.id}
                                to={`/negocio/${biz.slug}`}
                                className={`card group flex flex-col h-full ${biz.is_premium ? 'card-premium' : ''}`}
                            >
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={biz.images[0] || 'https://via.placeholder.com/800x450'}
                                        alt={biz.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {biz.is_premium && (
                                        <div className="absolute top-4 right-4 bg-dr-blue text-white p-2 rounded-xl shadow-lg">
                                            <Crown size={18} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                        <Star size={14} className="text-dr-gold fill-dr-gold" />
                                        <span className="font-black text-xs text-dr-blue">{biz.rating_avg || '5.0'}</span>
                                    </div>
                                </div>

                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-dr-blue mb-2">{biz.category}</div>
                                    <h3 className="text-xl font-black mb-3 group-hover:text-dr-blue transition-colors line-clamp-1">{biz.name}</h3>
                                    <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed font-medium">{biz.description}</p>

                                    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MapPin size={14} />
                                            <span className="text-xs font-bold leading-none">{biz.address.split(',')[0]}</span>
                                        </div>
                                        <div className="btn btn-ghost btn-sm p-0 group-hover:text-dr-blue">
                                            Ver perfil <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="map-container flex items-center justify-center bg-gray-200 text-gray-500 font-bold">
                        <div className="text-center">
                            <MapIcon size={48} className="mx-auto mb-4 opacity-20" />
                            Vista de Mapa (Próximamente con Leaflet)
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Directory;
