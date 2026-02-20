-- DIRECTORIO DOMINICANO BCN - SQL SCHEMA

-- 1. Tablas de Usuarios (Perfiles extendidos)
CREATE TABLE IF NOT EXISTS public.dd_users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cliente', -- cliente, negocio_gratis, negocio_premium, admin
  phone TEXT,
  city TEXT DEFAULT 'Barcelona',
  avatar_url TEXT,
  subscription_id TEXT,
  subscription_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Negocios
CREATE TABLE IF NOT EXISTS public.dd_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.dd_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Barcelona',
  lat FLOAT,
  lng FLOAT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  email TEXT,
  logo_url TEXT,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  schedule TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  subscription_expiry TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Reseñas
CREATE TABLE IF NOT EXISTS public.dd_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.dd_users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.dd_businesses(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Promociones (Solo para Premium)
CREATE TABLE IF NOT EXISTS public.dd_promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.dd_businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount TEXT,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Habilitar para seguridad
ALTER TABLE public.dd_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_promotions ENABLE ROW LEVEL SECURITY;

-- Políticas de Usuarios
CREATE POLICY "Public profiles are viewable by everyone" ON public.dd_users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.dd_users FOR UPDATE USING (auth.uid() = id);

-- Políticas de Negocios
CREATE POLICY "Approved businesses are viewable by everyone" ON public.dd_businesses FOR SELECT USING (is_approved = true OR auth.uid() = owner_id);
CREATE POLICY "Users can create their own businesses" ON public.dd_businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their own businesses" ON public.dd_businesses FOR UPDATE USING (auth.uid() = owner_id);

-- Políticas de Reseñas
CREATE POLICY "Reviews are viewable by everyone" ON public.dd_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.dd_reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Función para incrementar vistas
CREATE OR REPLACE FUNCTION increment_business_views(target_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.dd_businesses
  SET views = views + 1
  WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
