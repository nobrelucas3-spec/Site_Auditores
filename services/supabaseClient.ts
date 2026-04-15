import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase vars missing!');
}

// Fallback prevents the entire React app from crashing (White Screen) if GitHub Action secrets are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storage: window.sessionStorage, // Login expira ao fechar a aba/navegador (mais rígido)
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
