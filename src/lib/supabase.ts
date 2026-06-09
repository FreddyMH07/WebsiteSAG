import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.PUBLIC_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL) as string;
const key = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string;

if (!url || !key) {
  throw new Error('Missing Supabase env vars. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(url, key);
