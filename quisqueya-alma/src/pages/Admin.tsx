import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Product } from '../types';
import { Plus, Trash2, Edit, Package, Euro, Type, Tag, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';

const Admin: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Bolsos',
        materials: '',
        measurements: '',
        cultural_context: '',
        image_url: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('id', { ascending: false });

            if (data) setProducts(data);
        } catch (e) {
            console.error("Error fetching products:", e);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) {
                setStatus({ type: 'error', msg: 'Error al subir imagen' });
            } else {
                const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
                setFormData({ ...formData, image_url: data.publicUrl });
                setStatus({ type: 'success', msg: 'Imagen lista' });
            }
        } catch (e) {
            setStatus({ type: 'error', msg: 'Error de conexión con Supabase' });
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('products').insert([{
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                materials: formData.materials,
                measurements: formData.measurements,
                cultural_context: formData.cultural_context,
                image: formData.image_url,
                stock: true
            }]);

            if (error) {
                setStatus({ type: 'error', msg: 'Error al guardar producto' });
            } else {
                setStatus({ type: 'success', msg: '¡Producto publicado con éxito!' });
                setIsAdding(false);
                setFormData({ name: '', description: '', price: '', category: 'Bolsos', materials: '', measurements: '', cultural_context: '', image_url: '' });
                fetchProducts();
            }
        } catch (e) {
            setStatus({ type: 'error', msg: 'Error de red al publicar' });
        }
        setLoading(false);
    };

    const deleteProduct = async (id: number) => {
        if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
        try {
            await supabase.from('products').delete().eq('id', id);
            fetchProducts();
        } catch (e) {
            console.error("Error deleting product:", e);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-40">
                <div>
                    <h1 className="text-2xl font-black text-quisqueya-terracota uppercase tracking-tighter">Panel de Gestión</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tienda Quisqueya Alma</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-quisqueya-terracota text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-quisqueya-terracota/20"
                >
                    {isAdding ? 'Cerrar Panel' : <><Plus size={16} /> Añadir Producto</>}
                </button>
            </header>

            <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
                {isAdding && (
                    <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                        <h2 className="font-serif text-3xl text-quisqueya-tierra mb-8">Nuevas <span className="italic">Existencias</span></h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><Type size={12} /> Nombre del Producto</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-quisqueya-terracota" placeholder="Ej: Bolso Taíno Cognac" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><Tag size={12} /> Categoría</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-quisqueya-terracota">
                                        <option>Bolsos</option>
                                        <option>Neceseres</option>
                                        <option>Mochilas</option>
                                        <option>Platos</option>
                                        <option>Velas</option>
                                        <option>Tazas</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><Euro size={12} /> Precio (€)</label>
                                        <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-quisqueya-terracota" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><Package size={12} /> Medidas</label>
                                        <input value={formData.measurements} onChange={e => setFormData({ ...formData, measurements: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-quisqueya-terracota" placeholder="30x20 cm" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Descripción del Producto</label>
                                    <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-quisqueya-terracota h-32" placeholder="Describe la artesanía..."></textarea>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden relative border-2 border-dashed border-gray-200 flex flex-col items-center justify-center group hover:border-quisqueya-terracota transition-colors">
                                    {formData.image_url ? (
                                        <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="text-center p-8">
                                            <ImageIcon size={48} className="mx-auto text-gray-300 mb-4 group-hover:text-quisqueya-terracota" />
                                            <p className="text-xs font-black uppercase text-gray-400">Sube la foto real</p>
                                        </div>
                                    )}
                                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Inspiración Cultural (Opcional)</label>
                                    <input value={formData.cultural_context} onChange={e => setFormData({ ...formData, cultural_context: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-quisqueya-terracota" placeholder="Ej: Basado en el arte de Samaná" />
                                </div>
                                <button
                                    disabled={loading || !formData.image_url}
                                    type="submit"
                                    className="w-full bg-quisqueya-palma text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-quisqueya-tierra transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Publicando...' : 'Publicar Producto Ahora'}
                                </button>
                                {status && (
                                    <p className={`text-[10px] font-black uppercase text-center ${status.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{status.msg}</p>
                                )}
                            </div>
                        </form>
                    </section>
                )}

                <h3 className="font-serif text-2xl text-quisqueya-tierra mb-6">Inventario <span className="italic">Actual</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-3xl flex gap-4 items-center border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <img src={p.image} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black text-quisqueya-tierra uppercase truncate">{p.name}</h4>
                                <p className="text-lg font-black text-quisqueya-terracota">{p.price}€</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase">{p.category}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16} /></button>
                                <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <p className="text-gray-400 text-sm italic col-span-full py-10 text-center uppercase tracking-widest font-black opacity-50">No hay productos en la base de datos todavía.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Admin;
