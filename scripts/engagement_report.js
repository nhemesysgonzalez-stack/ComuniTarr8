
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDetailedEngagement() {
    console.log('--- ComuniTarr Detailed Engagement Report ---');

    // 1. User count
    const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    if (userError) console.error('User Error:', userError);
    console.log(`Total Profiles: ${userCount || 0}`);

    // 2. Forum Participation
    const { data: messages, error: msgError } = await supabase
        .from('forum_messages')
        .select('user_id, content, created_at');

    if (msgError) console.error('Message Error:', msgError);
    console.log(`Total Forum Messages: ${messages?.length || 0}`);

    const forumUsers = new Set((messages || []).map(m => m.user_id));
    console.log(`Unique Users Posting in Forum: ${forumUsers.size}`);

    const userMsgCount = {};
    const userDaysMsg = {};
    (messages || []).forEach(m => {
        userMsgCount[m.user_id] = (userMsgCount[m.user_id] || 0) + 1;
        const day = new Date(m.created_at).toISOString().split('T')[0];
        if (!userDaysMsg[m.user_id]) userDaysMsg[m.user_id] = new Set();
        userDaysMsg[m.user_id].add(day);
    });

    const frequentPosters = Object.values(userMsgCount).filter(count => count > 1).length;
    console.log(`Users with > 1 Message: ${frequentPosters}`);

    const retainedForumUsersArr = Object.values(userDaysMsg).filter(set => set.size > 1);
    console.log(`Retained Forum Users (Active on > 1 Day): ${retainedForumUsersArr.length}`);

    // 3. Poll Votes
    const { data: votes, error: voteError } = await supabase
        .from('poll_votes')
        .select('user_id, created_at');

    if (voteError) console.error('Vote Error:', voteError);
    console.log(`Total Poll Votes: ${votes?.length || 0}`);
    const voters = new Set((votes || []).map(v => v.user_id));
    console.log(`Unique Voters: ${voters.size}`);

    // 4. Global Combined Activity
    const allActiveUsers = new Set([...forumUsers, ...voters]);
    console.log(`Total Unique 'Real' Active Users (Forum + Votes): ${allActiveUsers.size}`);

    // 5. Activity Logs (just in case they are populated now)
    const { data: activities } = await supabase.from('activity_logs').select('user_id, created_at');
    console.log(`Total Items in activity_logs table: ${activities?.length || 0}`);

    const lastMsgDate = messages?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at;
    console.log(`Latest Message Date: ${lastMsgDate || 'N/A'}`);

    console.log('------------------------------------');
}

checkDetailedEngagement();
