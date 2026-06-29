import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  // Make the failure mode explicit instead of letting @supabase/supabase-js throw
  throw new Error(
    'Missing environment variable VITE_SUPABASE_URL. Create frontend/.env (or set it in your hosting environment) and restart the dev server.'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing environment variable VITE_SUPABASE_ANON_KEY. Create frontend/.env (or set it in your hosting environment) and restart the dev server.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

