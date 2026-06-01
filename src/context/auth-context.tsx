import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { AuthService } from '@/services/supabase/auth';
import { DatabaseService } from '@/services/supabase/database';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
}

const defaultValue: AuthContextType = {
  user: null,
  loading: false,
  initialized: false,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfile: () => {},
  clearError: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultValue);

interface AuthProviderProps {
  children: React.ReactNode;
}

function profileFromRow(id: string, email: string, row: any): User {
  return {
    id,
    email,
    fullName: row?.full_name ?? undefined,
    avatarUrl: row?.avatar_url ?? undefined,
    phone: row?.phone ?? undefined,
    createdAt: row?.created_at ?? undefined,
    updatedAt: row?.updated_at ?? undefined,
  };
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await AuthService.getSession();
        if (session?.user) {
          try {
            const profile = await DatabaseService.getUserProfile(session.user.id);
            setUser(profileFromRow(session.user.id, session.user.email ?? '', profile));
          } catch (err) {
            console.error('[AuthContext] getUserProfile failed on init:', err);
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              fullName: session.user.user_metadata?.full_name ?? undefined,
            });
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setInitialized(true);
      }
    };

    initAuth();

    const { data } = AuthService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await DatabaseService.getUserProfile(session.user.id);
          setUser(profileFromRow(session.user.id, session.user.email ?? '', profile));
        } catch (err) {
          console.error('[AuthContext] getUserProfile failed on', event, ':', err);
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            fullName: session.user.user_metadata?.full_name ?? undefined,
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.signIn(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setLoading(true);
    setError(null);
    try {
      // supabase.auth.signUp creates the row in auth.users.
      // A SECURITY DEFINER trigger (handle_new_user) automatically creates
      // the matching row in public.users using raw_user_meta_data.full_name.
      // We must NOT insert into public.users here because:
      //   - When email confirmation is enabled, signUp() returns session=null.
      //   - Without a session, the Supabase client runs as the anon role.
      //   - auth.uid() is null under anon, so all RLS INSERT policies fail.
      // The trigger runs as the function owner (superuser), bypassing RLS.
      await AuthService.signUp(email, password, fullName);
      // Navigation / user state are handled by the onAuthStateChange listener.
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign up';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.signOut();
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.resetPassword(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Merge partial updates into the in-memory user without re-fetching from DB.
  // Called by useProfile after a successful DB update to keep UI in sync.
  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      initialized,
      error,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      clearError,
    }),
    [user, loading, initialized, error, signIn, signUp, signOut, resetPassword, updateProfile, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
