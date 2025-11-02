import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import { env } from '../lib/env';

export type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error?: string } | void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error('Failed to load profile', error);
    return null;
  }
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initialise = async () => {
      try {
        setLoading(true);

        // Handle magic-link redirects (?/#access_token=...)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (error) {
            console.error('Magic link exchange failed', error);
          }
          const cleanUrl = window.location.origin + window.location.pathname + window.location.search;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        const {
          data: { session }
        } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(session ?? null);
        if (session?.user?.id) {
          const profileData = await fetchProfile(session.user.id);
          if (!mounted) return;
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialise();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user?.id) {
        const profileData = await fetchProfile(newSession.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    profile,
    loading,
    refreshProfile: async () => {
      if (session?.user?.id) {
        const data = await fetchProfile(session.user.id);
        setProfile(data);
      }
    },
    signInWithEmail: async (email: string) => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${env.appUrl}/auth`
        }
      });
      if (error) {
        console.error('Magic link error', error);
        return { error: error.message };
      }
    },
    signOut: async () => {
      await supabase.auth.signOut();
      setProfile(null);
    }
  }), [session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
