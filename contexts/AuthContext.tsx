import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, metadata: any, avatarFile?: File | null) => Promise<void>;
    signOut: () => Promise<void>;
    updateMetadata: (metadata: any) => Promise<void>;
    updateEmail: (email: string) => Promise<void>;
    updateAvatar: (file: File) => Promise<string | null>;
    addPoints: (xp: number, coins: number) => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signUp = async (email: string, password: string, metadata: any, avatarFile?: File | null) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });

        if (error) throw error;

        if (avatarFile && data.user) {
            try {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${data.user.id}-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                await supabase.storage.from('avatars').upload(filePath, avatarFile);
                const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

                if (publicUrlData) {
                    await supabase.auth.updateUser({
                        data: { ...metadata, avatar_url: publicUrlData.publicUrl }
                    });
                }
            } catch (err) {
                console.error('Error uploading avatar during signup:', err);
                // We don't throw here so it doesn't "impede entry" as requested
            }
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const updateMetadata = async (metadata: any) => {
        const { error } = await supabase.auth.updateUser({
            data: metadata
        });
        if (error) throw error;
    };

    const updateEmail = async (email: string) => {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
    };

    const updateAvatar = async (file: File): Promise<string | null> => {
        if (!user) return null;
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

            if (publicUrlData) {
                const publicUrl = publicUrlData.publicUrl;
                await updateMetadata({ avatar_url: publicUrl });
                return publicUrl;
            }
            return null;
        } catch (error) {
            console.error('Error updating avatar:', error);
            throw error;
        }
    };

    const addPoints = async (xp: number, coins: number) => {
        if (!user) return;

        const currentKarma = user.user_metadata?.karma || 0;
        const currentCoins = user.user_metadata?.comuni_points || 0;

        const newKarma = currentKarma + xp;
        const newCoins = currentCoins + coins;

        // 1. Update Auth Metadata
        await updateMetadata({
            karma: newKarma,
            comuni_points: newCoins
        });

        // 2. Sync with profiles table
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    karma: newKarma,
                    comuni_points: newCoins
                })
                .eq('id', user.id);

            if (error) {
                console.warn('Could not sync points to profiles table:', error);
            }
        } catch (e) {
            console.error('Error syncing points:', e);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, signIn, signUp, signOut, updateMetadata, updateEmail, updateAvatar, addPoints, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
