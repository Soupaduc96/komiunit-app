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
  clearError: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultValue);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await AuthService.getSession();
        if (session?.user) {
          // Fetch user profile from database
          const profile = await DatabaseService.getUserProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: profile?.full_name,
            avatarUrl: profile?.avatar_url,
            phone: profile?.phone,
            createdAt: profile?.created_at,
            updatedAt: profile?.updated_at,
          });
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize auth');
      } finally {
        setInitialized(true);
      }
    };

    initAuth();

    // Listen to auth state changes
    const { data } = AuthService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await DatabaseService.getUserProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: profile?.full_name,
            avatarUrl: profile?.avatar_url,
            phone: profile?.phone,
            createdAt: profile?.created_at,
            updatedAt: profile?.updated_at,
          });
        } catch (err) {
          console.error('Error fetching user profile:', err);
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
    try {
      setLoading(true);
      setError(null);
      await AuthService.signIn(email, password);
      // User will be set by onAuthStateChange listener
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.signUp(email, password, fullName);

      // Create user profile in database
      if (result.user) {
        await DatabaseService.createUserProfile(result.user.id, {
          email: result.user.email,
          full_name: fullName,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign up';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
    try {
      setLoading(true);
      setError(null);
      await AuthService.resetPassword(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
      clearError,
    }),
    [user, loading, initialized, error, signIn, signUp, signOut, resetPassword, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
