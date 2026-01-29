import React from 'react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { Plus, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-quisqueya-terracota/5"
        >
            <div className="aspect-[4/5] overflow-hidden relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button className="bg-white/90 backdrop-blur-md p-3 rounded-full text-quisqueya-terracota hover:bg-quisqueya-terracota hover:text-white transition-all shadow-lg">
                        <Info size={18} />
                    </button>
                </div>
                <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-quisqueya-palma text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl"
                    >
                        <Plus size={16} /> Añadir al Carrito
                    </button>
                </div>
                <div className="absolute top-4 left-4 bg-quisqueya-sol text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {product.category}
                </div>
            </div>

            <div className="p-6">
                <p className="text-[10px] font-black text-quisqueya-terracota uppercase tracking-[0.2em] mb-2 opacity-60">
                    Edición Limitada
                </p>
                <h3 className="font-serif text-xl text-quisqueya-tierra mb-2 group-hover:text-quisqueya-terracota transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between mt-4 pb-2 border-b border-gray-50">
                    <span className="text-2xl font-black text-quisqueya-terracota">
                        {product.price}€
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 line-through">
                        {(product.price * 1.2).toFixed(0)}€
                    </span>
                </div>
                <p className="mt-4 text-[11px] text-gray-500 font-medium line-clamp-2 leading-relaxed">
                    {product.description}
                </p>
            </div>
        </motion.div>
    );
};

export default ProductCard;
