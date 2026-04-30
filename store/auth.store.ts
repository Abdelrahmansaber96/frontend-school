'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearFrontendAuthCookie, syncFrontendAuthCookie } from '@/lib/auth-session';
import { User } from '@/types';
import { disconnectSocket } from '@/lib/socket';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user) => {
        syncFrontendAuthCookie(user);
        set({ user, isAuthenticated: true });
      },

      clearAuth: () => {
        disconnectSocket();
        clearFrontendAuthCookie();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'basma-auth',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as { user?: User | null; isAuthenticated?: boolean } | undefined;
        return {
          user: state?.user ?? null,
          isAuthenticated: Boolean(state?.user) && Boolean(state?.isAuthenticated),
        };
      },
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
