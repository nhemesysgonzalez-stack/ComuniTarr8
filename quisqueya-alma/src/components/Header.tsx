import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

interface Props {
    onCartClick: () => void;
}

const Header: React.FC<Props> = ({ onCartClick }) => {
    const { cart } = useCart();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50 bg-quisqueya-crema/80 backdrop-blur-md border-b border-quisqueya-terracota/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Mobile Menu */}
                    <div className="flex lg:hidden">
                        <button className="text-quisqueya-terracota p-2">
                            <Menu size={24} />
                        </button>
                    </div>

                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer no-underline">
                        <h1 className="font-serif text-2xl md:text-3xl font-black text-quisqueya-terracota tracking-tight">
                            QUISQUEYA<span className="italic font-normal">ALMA</span>
                        </h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex space-x-8">
                        {['Bolsos', 'Mochilas', 'Hogar', 'Velas'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-quisqueya-tierra font-medium hover:text-quisqueya-terracota transition-colors text-sm uppercase tracking-widest"
                            >
                                {item}
                            </a>
                        ))}
                        <Link to="/sobre-nosotros" className="text-quisqueya-tierra font-medium hover:text-quisqueya-terracota transition-colors text-sm uppercase tracking-widest no-underline">
                            Nuestra Historia
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        <button className="text-quisqueya-tierra hover:text-quisqueya-terracota transition-colors">
                            <Search size={22} />
                        </button>
                        <Link to="/admin" className="hidden sm:block text-quisqueya-tierra hover:text-quisqueya-terracota transition-colors">
                            <User size={22} />
                        </Link>
                        <button
                            onClick={onCartClick}
                            className="relative text-quisqueya-tierra hover:text-quisqueya-terracota transition-colors p-2"
                        >
                            <ShoppingBag size={24} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-quisqueya-sol text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-quisqueya-crema">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            {/* Announcement Bar */}
            <div className="bg-quisqueya-palma text-quisqueya-crema py-1 text-center text-[10px] font-bold uppercase tracking-[0.3em]">
                Envío gratuito en España por compras superiores a 60€ 🌴
            </div>
        </header>
    );
};

export default Header;
