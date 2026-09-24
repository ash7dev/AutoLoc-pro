import { create } from 'zustand';
import { UserProfile, UserCapabilities, PendingIntent } from '../../types/user';
import { computeUserCapabilities } from '../auth/capabilities';
import { broadcastAuthEvent } from '../auth/crossTabSync';
import { AuthService } from '../../features/auth/services/authService';
import { setAuthCookies, clearAuthCookies, normalizeRole } from '../auth/roleUtils';

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
  setSessionFromAuthResponse: (res: { accessToken: string; refreshToken?: string; profile: any }) => UserProfile;
  updateProfilePartial: (partial: Partial<UserProfile>) => void;
  switchRole: (newRole: UserProfile['role']) => Promise<UserProfile | null>;
  setPendingIntent: (intent: PendingIntent | null) => void;
  clearPendingIntent: () => void;
  openGuestModal: (reason: string, intent?: PendingIntent) => void;
  closeGuestModal: () => void;
  
  // Revalidation & Logout
  lastProfileFetchTime: number;
  refreshProfileSilently: (force?: boolean) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
}

const getInitialStoreState = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('autoloc_token');
    const cachedUserRaw = localStorage.getItem('autoloc_user');
    if (token === 'mock_google_token' || cachedUserRaw?.includes('alexandre.diallo@gmail.com')) {
      localStorage.removeItem('autoloc_token');
      localStorage.removeItem('autoloc_refresh_token');
      localStorage.removeItem('autoloc_user');
      clearAuthCookies();
    } else if (token && cachedUserRaw) {
      try {
        const cachedUser = JSON.parse(cachedUserRaw);
        const normalizedUser = {
          ...cachedUser,
          role: normalizeRole(cachedUser.role),
        };
        // Re-synchroniser les cookies dès le démarrage optimiste
        setAuthCookies(token, normalizedUser.role);
        return {
          isInitialized: true,
          isAuthenticated: true,
          isGuestMode: false,
          user: normalizedUser,
          capabilities: computeUserCapabilities(normalizedUser),
          lastProfileFetchTime: 0,
        };
      } catch {
        // Ignorer si JSON invalide
      }
    }
  }
  return {
    isInitialized: false,
    isAuthenticated: false,
    isGuestMode: true,
    user: null,
    capabilities: computeUserCapabilities(null),
    lastProfileFetchTime: 0,
  };
};

const initialState = getInitialStoreState();

export const useUserStore = create<UserState>((set, get) => ({
  ...initialState,

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
      lastProfileFetchTime: userProfile ? Date.now() : 0,
    });
    if (typeof window !== 'undefined') {
      if (userProfile) {
        localStorage.setItem('autoloc_user', JSON.stringify(userProfile));
        const token = localStorage.getItem('autoloc_token');
        if (token) {
          setAuthCookies(token, userProfile.role);
        }
      } else {
        localStorage.removeItem('autoloc_user');
        localStorage.removeItem('autoloc_refresh_token');
        clearAuthCookies();
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

  setSessionFromAuthResponse: (res) => {
    const userProfile = AuthService.mapProfileResponseToUserProfile(res.profile);
    if (typeof window !== 'undefined') {
      if (res.accessToken) {
        localStorage.setItem('autoloc_token', res.accessToken);
      }
      if (res.refreshToken) {
        localStorage.setItem('autoloc_refresh_token', res.refreshToken);
      }
      localStorage.setItem('autoloc_user', JSON.stringify(userProfile));
      if (res.accessToken) {
        setAuthCookies(res.accessToken, userProfile.role);
      }
    }
    set({
      isInitialized: true,
      isAuthenticated: true,
      isGuestMode: false,
      user: userProfile,
      capabilities: computeUserCapabilities(userProfile),
      lastProfileFetchTime: Date.now(),
    });
    broadcastAuthEvent({
      type: 'USER_UPDATED',
      payload: userProfile,
    });
    return userProfile;
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
      const token = localStorage.getItem('autoloc_token');
      if (token) {
        setAuthCookies(token, updated.role);
      }
    }
    broadcastAuthEvent({
      type: 'USER_UPDATED',
      payload: updated,
    });
  },

  switchRole: async (newRole) => {
    try {
      const res = await AuthService.switchRole(newRole as 'PROPRIETAIRE' | 'LOCATAIRE');
      return get().setSessionFromAuthResponse(res);
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

  refreshProfileSilently: async (force = false) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('autoloc_token') : null;
    if (!token && !get().isAuthenticated) {
      set({ isInitialized: true, isAuthenticated: false, isGuestMode: true, user: null, capabilities: computeUserCapabilities(null) });
      clearAuthCookies();
      return null;
    }

    const now = Date.now();
    const lastFetch = get().lastProfileFetchTime || 0;
    // Si la revalidation a eu lieu il y a moins de 5 minutes (300 000 ms) et que l'utilisateur est déjà présent, ignorer l'appel
    if (!force && get().user && (now - lastFetch < 300_000)) {
      if (token && get().user) {
        setAuthCookies(token, get().user!.role);
      }
      return get().user;
    }

    try {
      const profile = await AuthService.getMe();
      const updatedUser = AuthService.mapProfileResponseToUserProfile(profile);

      if (token) {
        setAuthCookies(token, updatedUser.role);
      }

      set({
        isInitialized: true,
        isAuthenticated: true,
        isGuestMode: false,
        user: updatedUser,
        capabilities: computeUserCapabilities(updatedUser),
        lastProfileFetchTime: now,
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
      localStorage.removeItem('autoloc_refresh_token');
      localStorage.removeItem('autoloc_user');
      clearAuthCookies();
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
