import { supabase } from './supabaseClient';

export const safeSupabaseInsert = async (table: string, data: any) => {
    try {
        // Intentar insertar en Supabase
        const { error } = await supabase.from(table).insert([data]);
        if (error) throw error;
        return { success: true };
    } catch (e) {
        console.warn(`Supabase insert failed for ${table}, falling back to localStorage`, e);

        // Fallback a LocalStorage para demo
        const localKey = `local_${table}`;
        const currentData = JSON.parse(localStorage.getItem(localKey) || '[]');

        // Simular campos de DB
        const newItem = {
            ...data,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
        };

        localStorage.setItem(localKey, JSON.stringify([newItem, ...currentData]));
        return { success: true, isLocal: true };
    }
};

export const safeSupabaseFetch = async (table: string, queryBuilder?: any) => {
    try {
        // Intentar fetch de Supabase
        const { data, error } = await (queryBuilder || supabase.from(table).select('*').order('created_at', { ascending: false }));
        if (error) throw error;

        // Combinar con local si existe (para modo híbrido) o solo devolver remoto
        // Para evitar duplicados complejos, si hay remoto devolvemos remoto.
        // Si falla remoto, devolvemos local.
        return data || [];
    } catch (e) {
        console.warn(`Supabase fetch failed for ${table}, falling back to localStorage`, e);
        const localKey = `local_${table}`;
        return JSON.parse(localStorage.getItem(localKey) || '[]');
    }
};
