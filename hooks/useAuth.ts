import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { syncOnLogin } from '../lib/storage';

export interface Profile {
  id:    string;
  name:  string;
  email: string;
}

export function useAuth() {
  const [session,  setSession]  = useState<any>(null);
  const [user,     setUser]     = useState<any>(null);
  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [isGuest,  setIsGuest]  = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsGuest(!data.session?.user);
      if (data.session?.user) {
        fetchProfile(data.session.user);
        syncOnLogin();
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: listener } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsGuest(!session?.user);
      if (session?.user) {
        fetchProfile(session.user);
        syncOnLogin();
      } else {
        setProfile(null);
      }
    });
    return () => { listener?.subscription?.unsubscribe?.(); };
  }, []);

  async function fetchProfile(u: any) {
    try {
      const { data } = await supabase
        .from('noor_profiles')
        .select('id, name, email')
        .eq('id', u.id)
        .single();
      if (data) {
        setProfile({ id: data.id, name: data.name || '', email: data.email || u.email });
      } else {
        setProfile({ id: u.id, name: u.user_metadata?.name || '', email: u.email });
      }
    } catch {
      setProfile({ id: u.id, name: u.user_metadata?.name || '', email: u.email });
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user);
  }

  return { session, user, profile, loading, isGuest, refreshProfile };
}
