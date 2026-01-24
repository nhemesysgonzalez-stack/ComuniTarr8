import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NEIGHBORHOODS = [
    { id: 'part-alta', name: 'Part Alta', description: 'El corazón histórico y antiguo, con calles medievales.', image: 'https://picsum.photos/seed/partalta/800/600' },
    { id: 'eixample', name: 'Eixample', description: 'El centro moderno, la Rambla Nova y zona comercial.', image: 'https://picsum.photos/seed/eixample/800/600' },
    { id: 'nou-eixample', name: 'Nou Eixample', description: 'Zonas residenciales consolidadas y nuevos servicios.', image: 'https://picsum.photos/seed/noueixample/800/600' },
    { id: 'serrallo', name: 'El Serrallo', description: 'Barrio de pescadores, gastronomía y brisa marina.', image: 'https://picsum.photos/seed/serrallo/800/600' },
    { id: 'sp-sp', name: 'Sant Pere i Sant Pau', description: 'Gran zona residencial rodeada de naturaleza.', image: 'https://picsum.photos/seed/spsp/800/600' },
    { id: 'torreforta', name: 'Torreforta', description: 'Barrio popular, extenso y con gran vida comunitaria.', image: 'https://picsum.photos/seed/torreforta/800/600' },
    { id: 'campclar', name: 'Campclar', description: 'Zona deportiva, familiar y con mucha actividad.', image: 'https://picsum.photos/seed/campclar/800/600' },
    { id: 'bonavista', name: 'Bonavista', description: 'Barrio vibrante, con identidad propia y gran mercado.', image: 'https://picsum.photos/seed/bonavista/800/600' },
    { id: 'sant-salvador', name: 'Sant Salvador', description: 'Ambiente tranquilo de pueblo integrado en la ciudad.', image: 'https://picsum.photos/seed/santsalvador/800/600' },
    { id: 'llevant', name: 'Llevant / La Móra', description: 'Urbanizaciones costeras, chalets y playas.', image: 'https://picsum.photos/seed/llevant/800/600' },
    { id: 'arrabassada', name: 'Vall de l\'Arrabassada', description: 'Residencial moderno junto a la playa.', image: 'https://picsum.photos/seed/arrabassada/800/600' },
];

const NeighborhoodSelection: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selected, setSelected] = useState<string | null>(user?.user_metadata?.neighborhood || null);
    const [loading, setLoading] = useState(false);

    const handleSelect = async (neighborhood: string) => {
        setSelected(neighborhood);
    };

    const handleConfirm = async () => {
        if (!selected) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { neighborhood: selected }
            });
            if (error) throw error;
            // Force reload to update context and UI
            window.location.href = '/';
        } catch (error) {
            console.error(error);
            alert('Error al guardar el barrio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Elige tu Barrio</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">Únete a tu comunidad local para ver eventos y noticias relevantes cerca de ti.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {NEIGHBORHOODS.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => handleSelect(n.name)}
                            className={`
                                relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 border-2
                                ${selected === n.name
                                    ? 'border-primary ring-4 ring-primary/20 scale-105 shadow-2xl'
                                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700 shadow-lg hover:shadow-xl scale-100'}
                            `}
                        >
                            <div className="aspect-[4/3] relative">
                                <img src={n.image} alt={n.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 transition-opacity ${selected === n.name ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                                    <h3 className="text-white text-2xl font-bold mb-1">{n.name}</h3>
                                    <p className="text-white/80 text-sm leading-snug">{n.description}</p>
                                </div>
                                {selected === n.name && (
                                    <div className="absolute top-4 right-4 size-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                                        <span className="material-symbols-outlined text-white text-lg font-bold">check</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleConfirm}
                        disabled={!selected || loading}
                        className="bg-primary hover:bg-primary-hover text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
                    >
                        {loading ? 'Uniéndote...' : 'Confirmar y Entrar'}
                        {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NeighborhoodSelection;
