'use client';

import { create } from 'zustand';
import type { ProfileResponse } from '../../../lib/nestjs/auth';

interface ProfileState {
  profile: ProfileResponse | null;
  setProfile: (profile: ProfileResponse) => void;
  clearProfile: () => void;
}

// In-memory uniquement — pas de persist localStorage.
// Données sensibles (phone, KYC, dateNaissance) qui n'ont pas à survivre à un refresh.
// GlobalRoleSync re-fetch et re-peuple à chaque session active.
export const useProfileStore = create<ProfileState>()((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}));
