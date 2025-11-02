import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import { env } from '../lib/env';

type Profile = Database['public']['Tables']['profiles']['Row'];

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error?: string } | void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const MAGIC_EMAIL_STORAGE_KEY = 'smartprospect:pending-magic-email';

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

        const hasWindow = typeof window !== 'undefined';
        if (hasWindow) {
          const url = new URL(window.location.href);

          // Magic link via hash fragment
          if (url.hash.includes('access_token')) {
            const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
            if (error) {
              console.error('Magic link exchange failed', error);
            } else {
              window.localStorage.removeItem(MAGIC_EMAIL_STORAGE_KEY);
            }
            url.hash = '';
            window.history.replaceState({}, document.title, url.toString());
          } else {
            // Magic link via verify endpoint (?token=...&type=magiclink)
            const token = url.searchParams.get('token');
            const type = url.searchParams.get('type');
            if (token && type === 'magiclink') {
              const pendingEmail = window.localStorage.getItem(MAGIC_EMAIL_STORAGE_KEY);
              if (pendingEmail) {
                const { data, error } = await supabase.auth.verifyOtp({
                  email: pendingEmail,
                  token,
                  type: 'magiclink'
                });
                if (error) {
                  console.error('Magic link verification failed', error);
                } else if (data?.session) {
                  setSession(data.session);
                  const profileData = await fetchProfile(data.session.user.id);
                  setProfile(profileData);
                }
                window.localStorage.removeItem(MAGIC_EMAIL_STORAGE_KEY);
              } else {
                console.warn('Magic link token received but no pending email stored.');
              }

              url.searchParams.delete('token');
              url.searchParams.delete('type');
              window.history.replaceState({}, document.title, url.toString());
            }
          }
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
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(MAGIC_EMAIL_STORAGE_KEY, email.toLowerCase());
      }
      const redirectBase = env.appUrl.replace(/\/+$/, '');
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${redirectBase}/auth`
        }
      });
      if (error) {
        console.error('Magic link error', error);
        return { error: error.message };
      }
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout failed', error);
        return;
      }
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(MAGIC_EMAIL_STORAGE_KEY);
      }
      setSession(null);
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

export type { Profile };
