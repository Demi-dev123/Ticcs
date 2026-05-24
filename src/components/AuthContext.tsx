import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, HAS_REAL_SUPABASE } from '../lib/supabaseClient';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isRealSupabase: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (HAS_REAL_SUPABASE && supabase) {
      // 1. Fetch current session from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      // 2. Listen to real authentication changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 3. Fallback Local Storage Persistence
      const savedUser = localStorage.getItem('ticss_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('ticss_user');
        }
      }
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (HAS_REAL_SUPABASE && supabase) {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error ? new Error(error.message) : null };
    } else {
      // Simulate/Implement SignUp
      const simulatedUser = { id: 'sim-' + Math.random().toString(36).substr(2, 9), email };
      localStorage.setItem('ticss_user', JSON.stringify(simulatedUser));
      setUser(simulatedUser);
      return { error: null };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (HAS_REAL_SUPABASE && supabase) {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (data?.user) {
        setUser({ id: data.user.id, email: data.user.email || '' });
      }
      return { error: error ? new Error(error.message) : null };
    } else {
      // Simulate Sign In
      const simulatedUser = { id: 'sim-user-88', email };
      localStorage.setItem('ticss_user', JSON.stringify(simulatedUser));
      setUser(simulatedUser);
      return { error: null };
    }
  };

  const signOut = async () => {
    if (HAS_REAL_SUPABASE && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('ticss_user');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isRealSupabase: HAS_REAL_SUPABASE, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
