import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Provide safe fallbacks for initialization to prevent top-level script crashes.
// Actual requests will fail, but the app will at least mount and can show an error message.
const fallbackUrl = 'https://placeholder-project.supabase.co'
const fallbackKey = 'placeholder-key'

export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey
)
