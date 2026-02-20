import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User as AppUser } from '../types';

interface AuthContextType {
    user: AppUser | null;
    session: any;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: any }>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) fetchProfile(session.user.id);
            else setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session);
                if (session?.user) fetchProfile(session.user.id);
                else { setUser(null); setLoading(false); }
            });
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data } = await supabase.from('dd_users').select('*').eq('id', userId).single();
            if (data) setUser(data);
        } catch (e) {
            console.error('Error fetching profile', e);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, fullName: string, role = 'cliente') => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, role } }
        });
        if (!error && data.user) {
            await supabase.from('dd_users').insert({
                id: data.user.id,
                email,
                full_name: fullName,
                role,
                created_at: new Date().toISOString()
            });
        }
        return { error };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';
    const isPremium = user?.role === 'negocio_premium';

    return (
        <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, isAdmin, isPremium }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
