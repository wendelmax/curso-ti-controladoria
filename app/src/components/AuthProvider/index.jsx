import React, { createContext, useContext, useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createSupabaseClient, getSupabaseClient } from '../../lib/supabase';

const AuthContext = createContext({ user: null, session: null, loading: true, supabase: null });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const { siteConfig } = useDocusaurusContext();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    const url = siteConfig.customFields?.supabaseUrl;
    const anonKey = siteConfig.customFields?.supabaseAnonKey;
    const sb = createSupabaseClient(url, anonKey);
    setSupabase(sb);

    if (!sb) {
      setLoading(false);
      return;
    }

    sb.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [siteConfig.customFields?.supabaseUrl, siteConfig.customFields?.supabaseAnonKey]);

  return (
    <AuthContext.Provider value={{ user, session, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}
