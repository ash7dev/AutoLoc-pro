'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProfileResponse } from '../../../lib/nestjs/auth';

type Role = ProfileResponse['role'];

interface RoleState {
  // Préférence UI non-sensible : persiste en localStorage pour survivre au refresh.
  activeRole: Role | null;
  hasVehicles: boolean | null;
  setSession: (input: { activeRole: Role }) => void;
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
      activeRole: null,
      hasVehicles: null,
      setSession: ({ activeRole }) => set({ activeRole }),
      setActiveRole: (activeRole) => set({ activeRole }),
      setHasVehicles: (hasVehicles) => set({ hasVehicles }),
      clearRole: () => set({ activeRole: null, hasVehicles: null }),
    }),
    {
      name: 'autoloc-role',
      storage: localStore,
      partialize: (state) => ({ activeRole: state.activeRole, hasVehicles: state.hasVehicles }),
    },
  ),
);
