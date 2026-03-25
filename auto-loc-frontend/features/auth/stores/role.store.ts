'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProfileResponse } from '../../../lib/nestjs/auth';

type Role = ProfileResponse['role'];

interface RoleState {
  // Tokens conservés en mémoire uniquement — jamais persistés en storage.
  // L'auth réelle est gérée par les cookies httpOnly via /api/nest/*.
  accessToken: string | null;
  refreshToken: string | null;
  // Préférence UI non-sensible : persiste en localStorage pour survivre au refresh.
  activeRole: Role | null;
  hasVehicles: boolean | null;
  setSession: (input: { accessToken: string; refreshToken: string; activeRole: Role }) => void;
  setActiveRole: (role: Role) => void;
  setHasVehicles: (hasVehicles: boolean) => void;
  clearRole: () => void;
}

const localStore =
  typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => ({
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }));

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      activeRole: null,
      hasVehicles: null,
      setSession: ({ accessToken, refreshToken, activeRole }) =>
        set({ accessToken, refreshToken, activeRole }),
      setActiveRole: (activeRole) => set({ activeRole }),
      setHasVehicles: (hasVehicles) => set({ hasVehicles }),
      clearRole: () => set({ accessToken: null, refreshToken: null, activeRole: null, hasVehicles: null }),
    }),
    {
      name: 'autoloc-role',
      storage: localStore,
      // Seul activeRole et hasVehicles sont persistés — les tokens restent en mémoire uniquement.
      partialize: (state) => ({ activeRole: state.activeRole, hasVehicles: state.hasVehicles }),
    },
  ),
);
