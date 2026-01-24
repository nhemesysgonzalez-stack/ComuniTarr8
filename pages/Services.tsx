import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface Service {
  id: string;
  title: string;
  user_name: string;
  location: string;
  image_url: string;
  category: string;
  description: string;
  contact_info: string;
  neighborhood: string;
  created_at: string;
}

const Services: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorías');
  const [services, setServices] = useState<Service[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'offer' | 'request'>('offer'); // Para futuro uso, por ahora simplificado
  const [loading, setLoading] = useState(true);

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Hogar y Reparaciones');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    fetchServices();
  }, [user?.user_metadata?.neighborhood]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await safeSupabaseFetch('services',
        supabase
          .from('services')
          .select('*')
          .eq('neighborhood', user?.user_metadata?.neighborhood || 'GENERAL')
          .order('created_at', { ascending: false })
      );
      setServices(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { success } = await safeSupabaseInsert('services', {
        user_id: user?.id,
        user_name: user?.user_metadata?.full_name || 'Vecino',
        title: title,
        category: category,
        description: description,
        contact_info: contact,
        location: user?.user_metadata?.neighborhood || 'GENERAL',
        neighborhood: user?.user_metadata?.neighborhood || 'GENERAL',
        image_url: `https://picsum.photos/seed/${title}/400/300`, // Placeholder dinámico
        type: createType
      });

      if (!success) throw new Error('Falló la creación');
      alert('¡Servicio publicado con éxito!');
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setContact('');
      fetchServices();
    } catch (e) {
      console.error(e);
      alert('Error al publicar servicio');
    }
  };

  const categories = [
    'Todas las categorías',
    'Hogar y Reparaciones',
    'Clases y Tutorías',
    'Cuidado de Personas',
    'Mascotas',
    'Recados y Compras'
  ];

  const filteredServices = selectedCategory === 'Todas las categorías'
    ? services
    : services.filter(s => s.category === selectedCategory);


  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-sans">
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 py-16 text-center px-4">
        <h1 className="text-5xl font-black text-text-main dark:text-white mb-4">Ayuda Mutua</h1>
        <p className="text-text-secondary dark:text-gray-400 text-xl max-w-2xl mx-auto">Conecta con tus vecinos para ofrecer tus habilidades o solicitar el apoyo que necesitas. Comunidad unida en {user?.user_metadata?.neighborhood}.</p>
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={() => { setCreateType('offer'); setShowCreateModal(true); }} className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-hover transition shadow-lg shadow-primary/20">OFRECER SERVICIO</button>
          <button onClick={() => { setCreateType('request'); setShowCreateModal(true); }} className="bg-white dark:bg-gray-800 border-2 border-primary text-primary px-8 py-4 rounded-2xl font-bold hover:bg-primary/5 transition">PEDIR AYUDA</button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="hidden lg:block space-y-10">
          <div>
            <h3 className="font-bold text-xl dark:text-white mb-6">Categorías</h3>
            <div className="flex flex-col gap-4 text-text-secondary dark:text-gray-300">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left text-sm transition font-medium flex justify-between items-center group ${selectedCategory === cat ? 'text-primary font-bold' : 'hover:text-primary'}`}
                >
                  <span>{cat}</span>
                  <span className={`material-symbols-outlined text-sm transition ${selectedCategory === cat ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}>chevron_right</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/20">
            <h4 className="font-bold text-primary mb-2">¡Suma Puntos!</h4>
            <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed mb-4">Ayudar a los vecinos te otorga "ComuniPoints" canjeables en el Mercado Solidario.</p>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold dark:text-white">{selectedCategory}</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-20 opacity-50">
              <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
              <p className="text-xs font-black uppercase tracking-widest">Cargando servicios...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 dark:bg-surface-dark rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">handshake</span>
              <p className="text-text-secondary font-bold">No hay servicios disponibles en esta categoría actualmente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredServices.map(service => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={service.id}
                  className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={service.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase text-primary tracking-widest">
                      {service.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-2xl dark:text-white mb-2 leading-tight">{service.title}</h3>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
                        {service.user_name ? service.user_name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold dark:text-white">{service.user_name}</p>
                        <p className="text-xs text-text-secondary">{service.neighborhood}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert(`Contacta con ${service.user_name} al: ${service.contact_info}`)}
                        className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-hover transition shadow-md"
                      >
                        CONTACTAR
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">
                  {createType === 'offer' ? 'Ofrecer Servicio' : 'Pedir Ayuda'}
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Título</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-primary/20 focus:ring-2" placeholder="Ej: Clases de Inglés" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Categoría</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-primary/20 focus:ring-2">
                    {categories.filter(c => c !== 'Todas las categorías').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-primary/20 focus:ring-2 resize-none" placeholder="Detalles..." />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Contacto</label>
                  <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white outline-none ring-primary/20 focus:ring-2" placeholder="Teléfono o Email" />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                  PUBLICAR
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
