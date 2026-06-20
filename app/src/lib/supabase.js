import { createClient } from '@supabase/supabase-js';

let client = null;

export function createSupabaseClient(url, anonKey) {
  if (client) return client;
  if (!url || !anonKey) return null;
  client = createClient(url, anonKey);
  return client;
}

export function getSupabaseClient() {
  return client;
}
