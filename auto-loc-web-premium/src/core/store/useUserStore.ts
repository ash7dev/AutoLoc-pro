import { create } from 'zustand';
import { UserProfile, UserCapabilities, PendingIntent } from '../../types/user';
import { computeUserCapabilities } from '../auth/capabilities';
import { broadcastAuthEvent } from '../auth/crossTabSync';

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
      isAuthenticated: Boolean(userProfile),
      isGuestMode: !userProfile,
      user: userProfile,
      capabilities: computeUserCapabilities(userProfile),
    });
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
    broadcastAuthEvent({
      type: 'USER_UPDATED',
      payload: updated,
    });
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
    if (!get().isAuthenticated) return null;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        if (res.status === 401) {
          get().logout();
        }
        return null;
      }
      const rawUser = await res.json();
      const updatedUser: UserProfile = {
        id: rawUser.id || rawUser.userId,
        prenom: rawUser.prenom || '',
        nom: rawUser.nom || '',
        email: rawUser.email || '',
        telephone: rawUser.telephone || rawUser.phone,
        phoneVerified: rawUser.phoneVerified ?? false,
        dateNaissance: rawUser.dateNaissance,
        avatarUrl: rawUser.avatarUrl || rawUser.photoUrl,
        permisUrl: rawUser.permisUrl,
        role: rawUser.role || 'LOCATAIRE',
        statutKyc: rawUser.statutKyc || rawUser.kycStatus || 'NON_VERIFIE',
        kycRejectionReason: rawUser.kycRejectionReason,
        createdAt: rawUser.createdAt,
      };

      set({
        user: updatedUser,
        capabilities: computeUserCapabilities(updatedUser),
      });

      return updatedUser;
    } catch (error) {
      console.warn('[useUserStore] Silent revalidation failed:', error);
      return null;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {
      // Ignorer erreur si hors ligne
    } finally {
      set({
        isAuthenticated: false,
        isGuestMode: true,
        user: null,
        capabilities: computeUserCapabilities(null),
        pendingIntent: null,
        guestAuthModalVisible: false,
      });
      broadcastAuthEvent({ type: 'LOGOUT' });
    }
  },
}));
