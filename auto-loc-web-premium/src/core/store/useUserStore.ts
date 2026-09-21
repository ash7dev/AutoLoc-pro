import { create } from 'zustand';
import { UserProfile, UserCapabilities, PendingIntent } from '../../types/user';
import { computeUserCapabilities } from '../auth/capabilities';
import { broadcastAuthEvent } from '../auth/crossTabSync';
import { AuthService } from '../../features/auth/services/authService';

interface UserState {
  // État d'initialisation et session
  isInitialized: boolean;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  user: UserProfile | null;
  capabilities: UserCapabilities;

  // Interception d'Intentions & Modales Invités
  pendingIntent: PendingIntent | null;
  guestAuthModalVisible: boolean;
  guestAuthModalReason: string | null;

  // Actions d'État
  initializeFromSession: (user: UserProfile | null) => void;
  setUser: (user: UserProfile | null) => void;
  updateProfilePartial: (partial: Partial<UserProfile>) => void;
  switchRole: (newRole: UserProfile['role']) => Promise<UserProfile | null>;
  setPendingIntent: (intent: PendingIntent | null) => void;
  clearPendingIntent: () => void;
  openGuestModal: (reason: string, intent?: PendingIntent) => void;
  closeGuestModal: () => void;
  
  // Revalidation & Logout
  refreshProfileSilently: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  isInitialized: false,
  isAuthenticated: false,
  isGuestMode: true,
  user: null,
  capabilities: computeUserCapabilities(null),

  pendingIntent: null,
  guestAuthModalVisible: false,
  guestAuthModalReason: null,

  initializeFromSession: (userProfile) => {
    set({
      isInitialized: true,
      isAuthenticated: Boolean(userProfile),
      isGuestMode: !userProfile,
      user: userProfile,
      capabilities: computeUserCapabilities(userProfile),
    });
  },

  setUser: (userProfile) => {
    set({
      isInitialized: true,
      isAuthenticated: Boolean(userProfile),
      isGuestMode: !userProfile,
      user: userProfile,
      capabilities: computeUserCapabilities(userProfile),
    });
    if (typeof window !== 'undefined') {
      if (userProfile) {
        localStorage.setItem('autoloc_user', JSON.stringify(userProfile));
      } else {
        localStorage.removeItem('autoloc_user');
      }
    }
    if (userProfile) {
      broadcastAuthEvent({
        type: 'USER_UPDATED',
        payload: userProfile,
      });
    } else {
      broadcastAuthEvent({ type: 'LOGOUT' });
    }
  },

  updateProfilePartial: (partial) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, ...partial };
    set({
      user: updated,
      capabilities: computeUserCapabilities(updated),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoloc_user', JSON.stringify(updated));
    }
    broadcastAuthEvent({
      type: 'USER_UPDATED',
      payload: updated,
    });
  },

  switchRole: async (newRole) => {
    try {
      const res = await AuthService.switchRole(newRole as 'PROPRIETAIRE' | 'LOCATAIRE');
      if (res.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('autoloc_token', res.accessToken);
        if (res.refreshToken) {
          localStorage.setItem('autoloc_refresh_token', res.refreshToken);
        }
      }
      const updatedUser = AuthService.mapProfileResponseToUserProfile(res.profile);
      set({
        user: updatedUser,
        capabilities: computeUserCapabilities(updatedUser),
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('autoloc_user', JSON.stringify(updatedUser));
      }
      broadcastAuthEvent({
        type: 'USER_UPDATED',
        payload: updatedUser,
      });
      return updatedUser;
    } catch (error) {
      console.warn('[useUserStore] switchRole backend call failed, fallback to local update:', error);
      get().updateProfilePartial({ role: newRole });
      return get().user;
    }
  },

  setPendingIntent: (intent) => {
    set({ pendingIntent: intent });
  },

  clearPendingIntent: () => {
    set({ pendingIntent: null });
  },

  openGuestModal: (reason, intent) => {
    set({
      guestAuthModalVisible: true,
      guestAuthModalReason: reason,
      pendingIntent: intent || get().pendingIntent,
    });
  },

  closeGuestModal: () => {
    set({
      guestAuthModalVisible: false,
      guestAuthModalReason: null,
    });
  },

  refreshProfileSilently: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('autoloc_token') : null;
    if (!token && !get().isAuthenticated) {
      set({ isInitialized: true, isAuthenticated: false, isGuestMode: true, user: null, capabilities: computeUserCapabilities(null) });
      return null;
    }

    try {
      const profile = await AuthService.getMe();
      const updatedUser = AuthService.mapProfileResponseToUserProfile(profile);

      set({
        isInitialized: true,
        isAuthenticated: true,
        isGuestMode: false,
        user: updatedUser,
        capabilities: computeUserCapabilities(updatedUser),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('autoloc_user', JSON.stringify(updatedUser));
      }

      return updatedUser;
    } catch (error: any) {
      console.warn('[useUserStore] Silent revalidation failed:', error);
      if (error?.status === 401 || error?.statusCode === 401 || error?.message?.includes('401')) {
        get().logout();
      } else {
        set({ isInitialized: true });
      }
      return null;
    }
  },

  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('autoloc_token');
      localStorage.removeItem('autoloc_user');
    }
    set({
      isInitialized: true,
      isAuthenticated: false,
      isGuestMode: true,
      user: null,
      capabilities: computeUserCapabilities(null),
      pendingIntent: null,
      guestAuthModalVisible: false,
    });
    broadcastAuthEvent({ type: 'LOGOUT' });
  },
}));
