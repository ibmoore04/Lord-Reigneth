// ============================================================
// useAuth — authentication state hook.
// Provides the current user, profile, role and auth actions
// to any component that needs them.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '../types/database';
import * as authService from '../services/authService';

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    role: 'customer',
    loading: true,
    isAdmin: false,
    isStaff: false,
    isAuthenticated: false,
  });

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const profile = await authService.getProfile(userId);
      setState((prev) => ({
        ...prev,
        profile,
        role: profile?.role ?? 'customer',
        isAdmin: profile?.role === 'admin',
        isStaff: profile?.role === 'staff' || profile?.role === 'admin',
        loading: false,
      }));
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
      }));
      if (session?.user) {
        void loadProfile(session.user.id);
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
        }));
        if (session?.user) {
          void loadProfile(session.user.id);
        } else {
          setState((prev) => ({
            ...prev,
            profile: null,
            role: 'customer',
            isAdmin: false,
            isStaff: false,
            loading: false,
          }));
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authService.signIn({ email, password });
      return result;
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, phone?: string) => {
      const result = await authService.signUp({ email, password, fullName, phone });
      return result;
    },
    [],
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
  }, []);

  const updateProfile = useCallback(
    async (updates: Parameters<typeof authService.updateProfile>[1]) => {
      if (!state.user) throw new Error('Not authenticated');
      const updated = await authService.updateProfile(state.user.id, updates);
      setState((prev) => ({ ...prev, profile: updated }));
      return updated;
    },
    [state.user],
  );

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}
