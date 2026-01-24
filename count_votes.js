
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nkdbtwoqjbggawnqxxwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZGJ0d29xamJnZ2F3bnF4eHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTU0MTAsImV4cCI6MjA4MTgzMTQxMH0.QLy7Ek4DBVUxTI8xVLrlb4AtN3u0CTbIvVrEbGR8vFA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countVotes() {
    const { count, error } = await supabase
        .from('poll_votes')
        .select('*', { count: 'exact', head: true })
        .eq('poll_id', 'bona-gent-2025');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('VOTES_COUNT:', count);
    }
}

countVotes();
