import { supabase } from './supabaseClient';

export const logActivity = async (action: string, details: any = {}) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return; // Only log if user is authenticated

        await supabase.from('activity_logs').insert({
            user_id: user.id,
            action,
            details
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};
