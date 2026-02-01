import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface MarketItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  neighborhood: string;
  contact_info: string;
  image_url?: string;
  created_at: string;
}

const Marketplace: React.FC = () => {
  const { user, addPoints } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('hogar');
  const [itemContact, setItemContact] = useState('');
  const [itemImage, setItemImage] = useState('');

  const categories = [
    { id: 'all', label: 'TODO', icon: 'grid_view' },
    { id: 'hogar', label: 'HOGAR', icon: 'home' },
    { id: 'tech', label: 'TECH', icon: 'devices' },
    { id: 'moda', label: 'MODA', icon: 'apparel' },
    { id: 'ocio', label: 'OCIO', icon: 'sports_soccer' }
  ];

  useEffect(() => {
    fetchItems();
  }, [user?.user_metadata?.neighborhood]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await safeSupabaseFetch('marketplace_items',
        supabase
          .from('marketplace_items')
          .select('*')
          .eq('neighborhood', user?.user_metadata?.neighborhood || 'GENERAL')
          .order('created_at', { ascending: false })
      );

      const mockItems: MarketItem[] = [
        {
          id: 'm-1',
          user_id: 'v1',
          title: 'Bicicleta de Paseo Decathlon',
          description: 'Color negro, poco uso. Perfecta para el paseo de domingo ahora que el viento ha parado.',
          price: '85',
          category: 'ocio',
          neighborhood: 'GENERAL',
          contact_info: '652 11 00 99 (Albert)',
          created_at: new Date().toISOString()
        },
        {
          id: 'm-2',
          user_id: 'v2',
          title: 'Estufa de gas (Butano)',
          description: 'Funciona perfectamente. Ideal para tardes tranquilas de domingo en casa.',
          price: '25',
          category: 'hogar',
          neighborhood: 'GENERAL',
          contact_info: '633 44 55 66 (Laura)',
          created_at: new Date().toISOString()
        },
        {
          id: 'm-3',
          user_id: 'v3',
          title: 'Mesa de Terraza + Sillas',
          description: 'Conjunto ideal para el balcón. Muy resistente. Urge por mudanza este domingo.',
          price: '45',
          category: 'hogar',
          neighborhood: 'GENERAL',
          contact_info: '611 22 33 44 (Pau)',
          created_at: new Date().toISOString()
        }
      ];

      setItems(data && data.length > 0 ? data : mockItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { success } = await safeSupabaseInsert('marketplace_items', {
        user_id: user?.id,
        title: itemTitle,
        description: itemDescription,
        price: itemPrice,
        category: itemCategory,
        contact_info: itemContact,
        image_url: itemImage || null,
        neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
      });

      if (!success) throw new Error('Falló la publicación');
      await addPoints(50, 20); // Puntos por vender/participar
      alert('¡Producto publicado con éxito! +50 XP / +20 ComuniPoints');
      setShowAddForm(false);
      // Reset form
      setItemTitle('');
      setItemDescription('');
      setItemPrice('');
      setItemCategory('hogar');
      setItemContact('');
      setItemImage('');
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('Error al publicar producto');
    }
  };

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      'hogar': 'home',
      'tech': 'devices',
      'moda': 'apparel',
      'ocio': 'sports_soccer'
    };
    return icons[cat] || 'sell';
  };

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(i => i.category === activeCategory);

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto pb-20 font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter uppercase leading-none mb-4">MERCADILLO</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Dale una segunda vida a tus cosas</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-3 px-8 py-5 bg-primary text-white rounded-[30px] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
        >
          <span className="material-symbols-outlined font-black">add_circle</span>
          VENDER ALGO
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${activeCategory === cat.id ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-white dark:bg-surface-dark dark:text-gray-400 border-gray-100 dark:border-gray-800'}`}
          >
            <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Service Ad */}
      <div className="mb-16 bg-white dark:bg-surface-dark rounded-[40px] border-4 border-dashed border-primary/20 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 hover:border-primary/40 transition-all">
        <div className="size-32 md:size-48 bg-gray-100 dark:bg-gray-800 rounded-[35px] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-7xl text-orange-500">chair</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">URGE HOY DOMINGO</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PARTICULAR - PART ALTA</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black dark:text-white mb-4 leading-tight">Mesa de Roble + 6 Sillas 🪑</h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-6 max-w-2xl leading-relaxed">
            Vendo conjunto de comedor por traslado inmediato. Madera maciza en perfecto estado. Hay que venir a recogerlo HOY domingo a la Part Alta. ¡Precio final rebajado!
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="tel:641223456" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-xs font-black hover:scale-105 transition-all">
              <span className="material-symbols-outlined text-sm">call</span>
              641 22 34 56 (Maria)
            </a>
            <span className="px-6 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-xl text-xs font-black">
              120€ TODO EL PACK
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-20 opacity-20">
          <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
          <p className="text-xs font-black uppercase tracking-widest">Cargando productos...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-gradient-to-br from-primary/5 to-emerald-500/5 dark:from-primary/10 dark:to-emerald-500/10 p-12 rounded-[40px] border-2 border-dashed border-primary/20 text-center">
          <span className="material-symbols-outlined text-primary text-6xl mb-4 block">shopping_basket</span>
          <h3 className="text-lg font-black dark:text-white mb-2">
            {activeCategory === 'all' ? 'No hay productos aún' : `No hay productos en ${categories.find(c => c.id === activeCategory)?.label}`}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Sé el primero en publicar algo en {user?.user_metadata?.neighborhood || 'tu barrio'}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
          >
            PUBLICAR PRIMER PRODUCTO
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredItems.map((item, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                key={item.id}
                className="group bg-white dark:bg-surface-dark rounded-[35px] overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-primary/30 transition-all"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={item.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700">
                        {getCategoryIcon(item.category)}
                      </span>
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.category === 'tech' ? 'bg-blue-500' : item.category === 'hogar' ? 'bg-orange-500' : item.category === 'moda' ? 'bg-pink-500' : 'bg-emerald-500'} text-white shadow-lg`}>
                    {item.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-base font-black dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-primary">{item.price}€</p>
                      {item.contact_info && (
                        <p className="text-[10px] font-bold text-gray-400 mt-1">
                          📞 {item.contact_info}
                        </p>
                      )}
                    </div>
                    <button className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all group-hover:scale-110">
                      <span className="material-symbols-outlined font-black">chat</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Publicar Producto</h3>
                <button onClick={() => setShowAddForm(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleItemSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Título</label>
                  <input
                    type="text"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    placeholder="Ej: Bicicleta de montaña"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Precio (€)</label>
                    <input
                      type="text"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Categoría</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    >
                      <option value="hogar">Hogar</option>
                      <option value="tech">Tech</option>
                      <option value="moda">Moda</option>
                      <option value="ocio">Ocio</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                  <textarea
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none resize-none"
                    placeholder="Describe el producto..."
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">URL de Imagen (opcional)</label>
                  <input
                    type="url"
                    value={itemImage}
                    onChange={(e) => setItemImage(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Contacto</label>
                  <input
                    type="text"
                    value={itemContact}
                    onChange={(e) => setItemContact(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    placeholder="Teléfono o email"
                  />
                </div>

                <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                  Publicar Producto
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;
