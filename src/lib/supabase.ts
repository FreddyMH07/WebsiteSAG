import { createClient } from '@supabase/supabase-js';

// PUBLIC_* fallback: transitional support while Vercel env vars are being renamed to VITE_*
const url = (import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL) as string;
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY) as string;

if (!url || !key) {
  throw new Error('Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(url, key);
