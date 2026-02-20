export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'cliente' | 'negocio_gratis' | 'negocio_premium' | 'admin';
    phone?: string;
    city?: string;
    avatar_url?: string;
    created_at: string;
}

export interface Business {
    id: string;
    owner_id: string;
    name: string;
    slug: string;
    category: string;
    description: string;
    long_description?: string;
    address: string;
    city: string;
    lat?: number;
    lng?: number;
    phone: string;
    whatsapp?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    email?: string;
    logo_url?: string;
    images: string[];
    video_url?: string;
    schedule?: string;
    is_premium: boolean;
    is_approved: boolean;
    is_featured: boolean;
    subscription_expiry?: string;
    views: number;
    clicks: number;
    rating_avg?: number;
    rating_count?: number;
    created_at: string;
}

export interface Review {
    id: string;
    user_id: string;
    business_id: string;
    rating: number;
    comment: string;
    user_name?: string;
    user_avatar?: string;
    created_at: string;
}

export interface Promotion {
    id: string;
    business_id: string;
    title: string;
    description: string;
    discount?: string;
    expiry_date: string;
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    slug: string;
    color: string;
}

export const CATEGORIES: Category[] = [
    { id: '1', name: 'Restaurantes', icon: '🍽️', slug: 'restaurantes', color: '#ef4444' },
    { id: '2', name: 'Colmados', icon: '🛒', slug: 'colmados', color: '#f97316' },
    { id: '3', name: 'Fruterías', icon: '🍊', slug: 'fruterias', color: '#eab308' },
    { id: '4', name: 'Ropa y Moda', icon: '👗', slug: 'ropa', color: '#a855f7' },
    { id: '5', name: 'Cosméticos', icon: '💄', slug: 'cosmeticos', color: '#ec4899' },
    { id: '6', name: 'Hogar', icon: '🏠', slug: 'hogar', color: '#06b6d4' },
    { id: '7', name: 'Envíos', icon: '📦', slug: 'envios', color: '#3b82f6' },
    { id: '8', name: 'Belleza', icon: '💇', slug: 'belleza', color: '#f43f5e' },
    { id: '9', name: 'Servicios Pro', icon: '💼', slug: 'servicios', color: '#10b981' },
    { id: '10', name: 'Asociaciones', icon: '🤝', slug: 'asociaciones', color: '#002D62' },
    { id: '11', name: 'Negocios Online', icon: '🌐', slug: 'online', color: '#8b5cf6' },
    { id: '12', name: 'Otros', icon: '✨', slug: 'otros', color: '#6b7280' },
];

export const CITIES = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Zaragoza', 'Digital / Toda España'];
