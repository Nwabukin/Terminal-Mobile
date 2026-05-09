import { create } from 'zustand';
import { getItem, setItem, deleteItem } from '../utils/storage';
import type { User, AuthTokens } from '../api/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true }),

  setTokens: async (tokens) => {
    await setItem('access_token', tokens.access);
    await setItem('refresh_token', tokens.refresh);
  },

  clearAuth: async () => {
    await deleteItem('access_token');
    await deleteItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const token = await getItem('access_token');
      if (token) {
        set({ isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
