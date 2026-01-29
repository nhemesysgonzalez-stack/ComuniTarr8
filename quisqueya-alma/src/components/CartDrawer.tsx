import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Send } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const CartDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, total } = useCart();
    const [step, setStep] = useState<'cart' | 'checkout'>('cart');
    const [customerData, setCustomerData] = useState({
        name: '',
        address: '',
        city: '',
    });

    const handleCheckout = () => {
        const phone = "34600000000"; // AQUÍ IRÁ TU NÚMERO DE TELÉFONO DE EMPRESA
        const itemsList = cart.map(item => `- ${item.quantity}x ${item.name} (${item.price}€)`).join('%0A');
        const text = `🌴 *NUEVO PEDIDO - QUISQUEYA ALMA*%0A%0A*Cliente:* ${customerData.name}%0A*Dirección:* ${customerData.address}, ${customerData.city}%0A%0A*Productos:*%0A${itemsList}%0A%0A*TOTAL:* ${total}€%0A%0A---%0A¿Me confirmas los datos para realizar el Bizum? ✨`;

        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-quisqueya-terracota/20 backdrop-blur-sm z-[100]"
                    />

                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col font-sans"
                    >
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-serif text-2xl text-quisqueya-terracota">
                                {step === 'cart' ? 'Tu Bolsa' : 'Datos de Envío'}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar text-quisqueya-tierra">
                            {step === 'cart' ? (
                                cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <ShoppingBag size={64} className="mb-4" />
                                        <p className="font-black uppercase tracking-widest text-xs">Aún no hay nada del Caribe aquí</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex gap-4 group animate-in fade-in slide-in-from-right-4">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xs font-black uppercase truncate tracking-tighter">{item.name}</h3>
                                                    <p className="text-[10px] font-bold text-quisqueya-terracota mt-1">{item.price}€</p>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="mt-2 text-red-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nombre Completo</label>
                                        <input
                                            value={customerData.name}
                                            onChange={e => setCustomerData({ ...customerData, name: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-quisqueya-terracota"
                                            placeholder="Tu nombre..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dirección de Entrega (España)</label>
                                        <textarea
                                            value={customerData.address}
                                            onChange={e => setCustomerData({ ...customerData, address: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-quisqueya-terracota h-24"
                                            placeholder="Calle, número, piso..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ciudad / Código Postal</label>
                                        <input
                                            value={customerData.city}
                                            onChange={e => setCustomerData({ ...customerData, city: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-quisqueya-terracota"
                                            placeholder="Ej: Madrid, 28001"
                                        />
                                    </div>
                                    <div className="bg-quisqueya-sol/10 p-4 rounded-2xl flex gap-3 items-start border border-quisqueya-sol/20">
                                        <span className="text-lg">ℹ️</span>
                                        <p className="text-[10px] font-bold leading-relaxed opacity-70">
                                            Al confirmar, te contactaremos por WhatsApp para enviarte el número de Bizum y confirmar el stock antes del pago.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-8 bg-quisqueya-crema border-t border-quisqueya-terracota/10">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Total estimada</span>
                                    <span className="text-3xl font-black text-quisqueya-terracota">{total}€</span>
                                </div>

                                {step === 'cart' ? (
                                    <button
                                        onClick={() => setStep('checkout')}
                                        className="w-full bg-quisqueya-palma text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Continuar Pedido
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <button
                                            disabled={!customerData.name || !customerData.address}
                                            onClick={handleCheckout}
                                            className="w-full bg-[#25D366] text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            <Send size={18} /> Confirmar vía WhatsApp
                                        </button>
                                        <button
                                            onClick={() => setStep('cart')}
                                            className="text-[10px] font-black uppercase tracking-widest text-quisqueya-tierra/50"
                                        >
                                            Volver al Carrito
                                        </button>
                                    </div>
                                )}
                                <p className="text-[8px] text-center mt-6 text-gray-400 font-bold uppercase tracking-widest">
                                    Pedido seguro sin comisiones bancarias 🇪🇸
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
