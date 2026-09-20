import { create } from 'zustand';
import { authApi, AuthSuccessResponse, UserProfileResponse } from '../api/authApi';
import { secureStorage } from '../../../core/storage/secureStore';
import { useAppStore } from '../../../core/store/useAppStore';

interface AuthState {
  user: UserProfileResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  sendPhoneOtp: (phone: string, channel?: 'whatsapp' | 'sms' | 'auto') => Promise<number>;
  verifyPhoneOtp: (phone: string, code: string) => Promise<void>;
  loginWithGoogleOrSupabase: (supabaseAccessToken: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerProfile: (data: { prenom: string; nom: string; telephone: string; email: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  // Connexion Email & Mot de passe
  loginWithEmail: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authApi.loginWithEmail(email, password);

      await secureStorage.setToken(res.accessToken);
      if (res.refreshToken) {
        await secureStorage.setRefreshToken(res.refreshToken);
      }
      await secureStorage.setUser(res.profile);

      set({
        token: res.accessToken,
        user: res.profile,
        isAuthenticated: true,
        isLoading: false,
      });

      await useAppStore.getState().setAuth(res.accessToken, {
        id: res.profile.userId,
        prenom: res.profile.prenom || '',
        nom: res.profile.nom || '',
        email: res.profile.email || email,
        telephone: res.profile.phone || res.profile.telephone,
        phoneVerified: res.profile.phoneVerified,
        statutKyc: res.profile.statutKyc || res.profile.kycStatus,
        permisUrl: res.profile.permisUrl || (res.profile.hasPermis ? 'HAS_PERMIS' : null),
        avatarUrl: res.profile.avatarUrl,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Échec de la connexion. Vérifiez vos identifiants.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  // Demander un code OTP par téléphone (WhatsApp ou SMS direct)
  sendPhoneOtp: async (phone: string, channel?: 'whatsapp' | 'sms' | 'auto') => {
    try {
      set({ isLoading: true, error: null });
      const res = await authApi.sendPhoneLoginOtp(phone, channel);
      set({ isLoading: false });
      return res.expiresIn;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Impossible d’envoyer le code SMS/WhatsApp.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  // Valider le code OTP et authentifier l'utilisateur
  verifyPhoneOtp: async (phone: string, code: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authApi.verifyPhoneLoginOtp(phone, code);
      
      // Stockage sécurisé
      await secureStorage.setToken(res.accessToken);
      if (res.refreshToken) {
        await secureStorage.setRefreshToken(res.refreshToken);
      }
      await secureStorage.setUser(res.profile);

      set({
        token: res.accessToken,
        user: res.profile,
        isAuthenticated: true,
        isLoading: false,
      });

      // Synchronisation avec useAppStore global
      await useAppStore.getState().setAuth(res.accessToken, {
        id: res.profile.userId,
        prenom: res.profile.prenom || '',
        nom: res.profile.nom || '',
        email: res.profile.email || '',
        telephone: res.profile.phone || res.profile.telephone || phone,
        phoneVerified: true,
        statutKyc: res.profile.statutKyc || res.profile.kycStatus,
        permisUrl: res.profile.permisUrl || (res.profile.hasPermis ? 'HAS_PERMIS' : null),
        avatarUrl: res.profile.avatarUrl,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Code OTP invalide ou expiré.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  // Connexion Google OAuth / Supabase Token
  loginWithGoogleOrSupabase: async (supabaseAccessToken: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authApi.loginWithSupabaseToken(supabaseAccessToken);

      await secureStorage.setToken(res.accessToken);
      if (res.refreshToken) {
        await secureStorage.setRefreshToken(res.refreshToken);
      }
      await secureStorage.setUser(res.profile);

      set({
        token: res.accessToken,
        user: res.profile,
        isAuthenticated: true,
        isLoading: false,
      });

      await useAppStore.getState().setAuth(res.accessToken, {
        id: res.profile.userId,
        prenom: res.profile.prenom || '',
        nom: res.profile.nom || '',
        email: res.profile.email || '',
        telephone: res.profile.phone || res.profile.telephone,
        phoneVerified: res.profile.phoneVerified,
        statutKyc: res.profile.statutKyc || res.profile.kycStatus,
        permisUrl: res.profile.permisUrl || (res.profile.hasPermis ? 'HAS_PERMIS' : null),
        avatarUrl: res.profile.avatarUrl,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de la connexion Google/Supabase.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  // Inscription / Enregistrement du profil
  registerProfile: async (data) => {
    try {
      set({ isLoading: true, error: null });
      // 1. Vérifier la disponibilité
      const check = await authApi.checkAvailability(data.email, data.telephone);
      if (!check.available) {
        throw new Error(check.message || 'Email ou téléphone déjà utilisé.');
      }

      // 2. Déclencher la demande d'OTP téléphone
      await authApi.sendPhoneLoginOtp(data.telephone);
      set({ isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Erreur lors de l'inscription.";
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await authApi.logout().catch(() => {});
    } finally {
      await secureStorage.clearSession();
      set({ user: null, token: null, isAuthenticated: false });
      await useAppStore.getState().logout();
    }
  },
}));
