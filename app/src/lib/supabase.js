import { createClient } from '@supabase/supabase-js';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

let client = null;

export function getSupabase() {
  if (client) return client;
  const { siteConfig } = useDocusaurusContext();
  const url = siteConfig.customFields?.supabaseUrl;
  const anonKey = siteConfig.customFields?.supabaseAnonKey;
  if (!url || !anonKey) return null;
  client = createClient(url, anonKey);
  return client;
}

export async function getServerClient() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  client = createClient(url, anonKey);
  return client;
}
