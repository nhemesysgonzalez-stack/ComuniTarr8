import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function purgeCircles() {
    const { data, error } = await supabase.from('support_circles').delete().neq('neighborhood', 'UNKNOWN_IMPOSSIBLE_VALUE');

    if (error) {
        console.error("Error purging support_circles:", error);
    } else {
        console.log("Purged support_circles from Supabase database.", data);
    }
}

purgeCircles();
