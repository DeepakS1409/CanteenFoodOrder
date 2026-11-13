import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-supabase') &&
    supabaseUrl.startsWith('https://')
  );
};

// Create client if configured, otherwise create a mock-safe stub
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

if (!isSupabaseConfigured()) {
  console.info(
    '%c[CampusBite Backend]%c Supabase credentials not detected in .env. Running seamlessly in local fallback mode using mock data and localStorage.',
    'background: #F59E0B; color: #000; font-weight: bold; border-radius: 4px; padding: 2px 6px;',
    'color: #A1A1AA;'
  );
}

