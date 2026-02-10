
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env manually because we are running with ts-node/node, not vite
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActivity() {
    console.log('Checking message counts by neighborhood...');

    const { data, error } = await supabase
        .from('forum_messages')
        .select('neighborhood');

    if (error) {
        console.error('Error fetching messages:', error);
        return;
    }

    const counts = {};
    data.forEach(msg => {
        const hood = msg.neighborhood || 'UNKNOWN';
        counts[hood] = (counts[hood] || 0) + 1;
    });

    console.log('--- Activity Report ---');
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([hood, count]) => {
        console.log(`${hood}: ${count} messages`);
    });
    console.log('-----------------------');

    if (sorted.length > 0) {
        console.log(`Most active neighborhood: ${sorted[0][0]}`);
    } else {
        console.log('No messages found from real users.');
    }
}

checkActivity();
