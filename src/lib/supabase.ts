import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
