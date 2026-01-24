
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nkdbtwoqjbggawnqxxwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZGJ0d29xamJnZ2F3bnF4eHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTU0MTAsImV4cCI6MjA4MTgzMTQxMH0.QLy7Ek4DBVUxTI8xVLrlb4AtN3u0CTbIvVrEbGR8vFA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countVotes() {
    const { data, error } = await supabase
        .from('poll_votes')
        .select('option_text')
        .eq('poll_id', 'bona-gent-2025');

    if (error) {
        console.error('Error:', error);
    } else {
        const counts = data.reduce((acc, curr) => {
            acc[curr.option_text] = (acc[curr.option_text] || 0) + 1;
            return acc;
        }, {});
        console.log('VOTES_DISTRIBUTION:', JSON.stringify(counts, null, 2));
        console.log('TOTAL_VOTES:', data.length);
    }
}

countVotes();
