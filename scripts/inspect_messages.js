
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectLastMessages() {
    const { data: messages, error } = await supabase
        .from('forum_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) console.error(error);
    console.log('--- Last 10 Forum Messages ---');
    (messages || []).forEach(m => {
        console.log(`[${m.created_at}] User ${m.user_id}: ${m.content}`);
    });
}

inspectLastMessages();
