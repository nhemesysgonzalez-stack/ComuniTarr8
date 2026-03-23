
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectVotes() {
    const { data: votes, error } = await supabase
        .from('poll_votes')
        .select('*');

    if (error) console.error(error);
    console.log('--- Poll Votes Analysis ---');
    (votes || []).forEach(v => {
        console.log(`[${v.created_at}] User ${v.user_id} voted for: ${v.option_text} in poll ${v.poll_id}`);
    });
}

inspectVotes();
