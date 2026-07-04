'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProfileResponse } from '../../../lib/nestjs/auth';

type Role = ProfileResponse['role'];

interface RoleState {
  // Préférence UI non-sensible : persiste en localStorage pour survivre au refresh.
  activeRole: Role | null;
  hasVehicles: boolean | null;
  authChecked: boolean;
  sessionValid: boolean;
  setSession: (input: { activeRole: Role }) => void;
  setActiveRole: (role: Role) => void;
  setHasVehicles: (hasVehicles: boolean) => void;
  setAuthStatus: (input: { checked: boolean; valid: boolean }) => void;
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
      authChecked: false,
      sessionValid: false,
      setSession: ({ activeRole }) => set({ activeRole, authChecked: true, sessionValid: true }),
      setActiveRole: (activeRole) => set({ activeRole, authChecked: true, sessionValid: true }),
      setHasVehicles: (hasVehicles) => set({ hasVehicles }),
      setAuthStatus: ({ checked, valid }) => set({ authChecked: checked, sessionValid: valid }),
      clearRole: () => set({ activeRole: null, hasVehicles: null, authChecked: true, sessionValid: false }),
    }),
    {
      name: 'autoloc-role',
      storage: localStore,
      partialize: (state) => ({ activeRole: state.activeRole, hasVehicles: state.hasVehicles }),
    },
  ),
);
