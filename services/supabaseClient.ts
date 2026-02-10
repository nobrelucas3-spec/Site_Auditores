import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase vars missing!');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
