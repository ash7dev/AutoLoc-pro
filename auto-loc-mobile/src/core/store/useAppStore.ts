import { create } from 'zustand';
import { secureStorage } from '../storage/secureStore';
import { CurrencyCode } from '../../shared/components/CurrencyPickerModal';
import { apiClient } from '../api/apiClient';
import { queryClient } from '../api/queryClient';
import { authApi } from '../../features/auth/api/authApi';

export type PendingIntentAction =
  | 'BOOK_VEHICLE'
  | 'ADD_FAVORITE'
  | 'VIEW_PROFILE'
  | 'VIEW_BOOKINGS'
  | 'CONTACT_HOST'
  | 'ADD_VEHICLE';

export interface PendingIntent {
  action: PendingIntentAction;
  vehicleId?: string;
  payload?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  phoneVerified?: boolean;
  dateNaissance?: string;
  permisUrl?: string | null;
  statutKyc?: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE' | string;
  kycRejectionReason?: string | null;
  avatarUrl?: string;
  role?: string;
}

export interface SearchFilters {
  zone: string;
  type: string;
  dateDebut?: string;
  dateFin?: string;
  prixMin?: number;
  prixMax?: number;
  carburant?: string;
  transmission?: string;
  sort?: 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING';
  bbox?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

interface AppState {
  // Flag d'initialisation du Splash Screen
  isInitialized: boolean;
  
  // État de l'Onboarding
  hasSeenOnboarding: boolean;
  
  // Authentification & Session
  isAuthenticated: boolean;
  isGuestMode: boolean;
  token: string | null;
  user: UserProfile | null;

  // Devise sélectionnée globale (XOF, EUR, USD)
  selectedCurrency: CurrencyCode;

  // Filtres de Recherche Actifs
  searchFilters: SearchFilters;

  // Gestion du "Gatekeeping Invité" (Action interceptée)
  pendingIntent: PendingIntent | null;
  guestAuthModalVisible: boolean;
  guestAuthModalReason: string | null;

  // Actions
  initialize: () => Promise<void>;
  markOnboardingSeen: () => Promise<void>;
  enterGuestMode: () => void;
  setAuth: (token: string, user: UserProfile) => Promise<void>;
  updateUserProfile: (partial: Partial<UserProfile>) => Promise<void>;
  refreshProfileSilently: () => Promise<void>;
  logout: () => Promise<void>;
  setSelectedCurrency: (currency: CurrencyCode) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  
  // Actions Modal Invité & Intentions
  setPendingIntent: (intent: PendingIntent | null) => void;
  clearPendingIntent: () => void;
  triggerGuestAuthGuard: (reason: string, intent?: PendingIntent) => boolean;
  closeGuestAuthModal: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isInitialized: false,
  hasSeenOnboarding: false,
  isAuthenticated: false,
  isGuestMode: true, // Par défaut en mode invité tant que pas connecté
  token: null,
  user: null,
  selectedCurrency: 'XOF',
  searchFilters: {
    zone: '',
    type: '',
  },

  pendingIntent: null,
  guestAuthModalVisible: false,
  guestAuthModalReason: null,

  setSelectedCurrency: (currency) => {
    set({ selectedCurrency: currency });
  },

  setSearchFilters: (filters) => {
    set({ searchFilters: filters });
  },

  initialize: async () => {
    try {
      // 1. Charger l'état de l'onboarding
      const hasSeenOnboarding = await secureStorage.getHasSeenOnboarding();

      // 2. Charger le jeton et l'utilisateur
      const token = await secureStorage.getToken();
      const user = await secureStorage.getUser<UserProfile>();

      if (token && user) {
        set({
          isInitialized: true,
          hasSeenOnboarding,
          isAuthenticated: true,
          isGuestMode: false,
          token,
          user,
        });
      } else {
        set({
          isInitialized: true,
          hasSeenOnboarding,
          isAuthenticated: false,
          isGuestMode: true,
          token: null,
          user: null,
        });
      }
    } catch (error) {
      console.warn('Erreur lors de l’initialisation de useAppStore:', error);
      set({
        isInitialized: true,
        hasSeenOnboarding: false,
        isAuthenticated: false,
        isGuestMode: true,
      });
    }
  },

  markOnboardingSeen: async () => {
    set({ hasSeenOnboarding: true });
    await secureStorage.setHasSeenOnboarding();
  },

  enterGuestMode: () => {
    set({ isGuestMode: true });
  },

  setAuth: async (token: string, user: UserProfile) => {
    await secureStorage.setToken(token);
    await secureStorage.setUser(user);
    set({
      isAuthenticated: true,
      isGuestMode: false,
      token,
      user,
      guestAuthModalVisible: false,
      guestAuthModalReason: null,
    });
  },

  updateUserProfile: async (partial: Partial<UserProfile>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, ...partial };
    set({ user: updated });
    await secureStorage.setUser(updated);
  },

  refreshProfileSilently: async () => {
    const { isAuthenticated } = get();
    if (!isAuthenticated) return;
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data) {
        const raw = response.data;
        const updatedUser: UserProfile = {
          id: raw.id || raw.userId || get().user?.id || '',
          prenom: raw.prenom || get().user?.prenom || '',
          nom: raw.nom || get().user?.nom || '',
          email: raw.email || get().user?.email || '',
          telephone: raw.telephone || raw.phone || get().user?.telephone || '',
          phoneVerified: raw.phoneVerified ?? get().user?.phoneVerified ?? false,
          dateNaissance: raw.dateNaissance || get().user?.dateNaissance,
          permisUrl: raw.permisUrl ?? get().user?.permisUrl ?? null,
          statutKyc: raw.statutKyc || raw.kycStatus || get().user?.statutKyc || 'NON_VERIFIE',
          kycRejectionReason: raw.kycRejectionReason || get().user?.kycRejectionReason || null,
          avatarUrl: raw.avatarUrl || raw.photoUrl || get().user?.avatarUrl,
          role: raw.role || get().user?.role || 'LOCATAIRE',
        };
        set({ user: updatedUser });
        await secureStorage.setUser(updatedUser);
      }
    } catch (error) {
      console.warn('Revalidation silencieuse du profil échouée:', error);
    }
  },

  logout: async () => {
    try {
      await authApi.logout().catch(() => {});
    } catch {
      // Silent catch if offline
    } finally {
      await secureStorage.clearSession();
      queryClient.clear();
      set({
        isAuthenticated: false,
        isGuestMode: true,
        token: null,
        user: null,
        pendingIntent: null,
      });
    }
  },

  setPendingIntent: (intent) => {
    set({ pendingIntent: intent });
  },

  clearPendingIntent: () => {
    set({ pendingIntent: null });
  },

  triggerGuestAuthGuard: (reason: string, intent?: PendingIntent) => {
    const { isAuthenticated } = get();
    if (isAuthenticated) {
      // Si l'utilisateur est déjà connecté, l'action est immédiatement permise
      return true;
    }

    // Sinon, on intercepte l'action et on ouvre la modal invité
    set({
      guestAuthModalVisible: true,
      guestAuthModalReason: reason,
      pendingIntent: intent || null,
    });
    return false;
  },

  closeGuestAuthModal: () => {
    set({
      guestAuthModalVisible: false,
      guestAuthModalReason: null,
    });
  },
}));
