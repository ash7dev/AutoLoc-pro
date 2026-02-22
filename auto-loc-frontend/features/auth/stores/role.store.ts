'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProfileResponse } from '../../../lib/nestjs/auth';

type Role = ProfileResponse['role'];

interface RoleState {
  accessToken: string | null;
  refreshToken: string | null;
  activeRole: Role | null;
  setSession: (input: { accessToken: string; refreshToken: string; activeRole: Role }) => void;
  setActiveRole: (role: Role) => void;
  clearRole: () => void;
}

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => sessionStorage)
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
      setSession: ({ accessToken, refreshToken, activeRole }) =>
        set({ accessToken, refreshToken, activeRole }),
      setActiveRole: (activeRole) => set({ activeRole }),
      clearRole: () => set({ accessToken: null, refreshToken: null, activeRole: null }),
    }),
    {
      name: 'autoloc-nest-session',
      storage,
    },
  ),
);
