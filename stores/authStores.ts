import { create } from "zustand";
import { AuthState, User } from "../types/auth";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user: User | null) => set({ user, error: null }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  logout: () => set({ user: null, error: null }),
}));
