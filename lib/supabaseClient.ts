import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL not found. Please set NEXT_PUBLIC_SUPABASE_URL in your .env.local file.");
}

if (!supabaseAnonKey) {
  throw new Error("Supabase anonymous key not found. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.");
}

// Create and export the Supabase client
// The generic type arguments are optional but can provide better type safety
// You might define these types based on your database schema later on
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
