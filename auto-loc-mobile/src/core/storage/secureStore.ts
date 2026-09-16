import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'autoloc_jwt_token';
const REFRESH_TOKEN_KEY = 'autoloc_refresh_token';
const USER_KEY = 'autoloc_user_data';
const ONBOARDING_KEY = 'autoloc_has_seen_onboarding';
const FAVORITE_VEHICLES_KEY = 'autoloc_favorite_vehicle_ids';
const VEHICLE_WIZARD_DRAFT_KEY = 'autoloc_vehicle_wizard_draft';

export const secureStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore getToken error:', e);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (e) {
      console.error('SecureStore setToken error:', e);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore removeToken error:', e);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore getRefreshToken error:', e);
      return null;
    }
  },

  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (e) {
      console.error('SecureStore setRefreshToken error:', e);
    }
  },

  async removeRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore removeRefreshToken error:', e);
    }
  },

  async getUser<T>(): Promise<T | null> {
    try {
      const json = await SecureStore.getItemAsync(USER_KEY);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      console.warn('SecureStore getUser error:', e);
      return null;
    }
  },

  async setUser<T>(user: T): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('SecureStore setUser error:', e);
    }
  },

  async removeUser(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (e) {
      console.warn('SecureStore removeUser error:', e);
    }
  },

  async getHasSeenOnboarding(): Promise<boolean> {
    try {
      const val = await SecureStore.getItemAsync(ONBOARDING_KEY);
      return val === 'true';
    } catch (e) {
      return false;
    }
  },

  async setHasSeenOnboarding(): Promise<void> {
    try {
      await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    } catch (e) {
      console.error('SecureStore setHasSeenOnboarding error:', e);
    }
  },

  async getFavoriteVehicleIds(): Promise<string[]> {
    try {
      const json = await SecureStore.getItemAsync(FAVORITE_VEHICLES_KEY);
      const ids: unknown = json ? JSON.parse(json) : [];
      return Array.isArray(ids) && ids.every((id) => typeof id === 'string') ? ids : [];
    } catch (e) {
      console.warn('SecureStore getFavoriteVehicleIds error:', e);
      return [];
    }
  },

  async setFavoriteVehicleIds(ids: string[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(FAVORITE_VEHICLES_KEY, JSON.stringify(ids));
    } catch (e) {
      console.error('SecureStore setFavoriteVehicleIds error:', e);
    }
  },

  async getVehicleDraft<T>(): Promise<T | null> {
    try {
      const json = await SecureStore.getItemAsync(VEHICLE_WIZARD_DRAFT_KEY);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      console.warn('SecureStore getVehicleDraft error:', e);
      return null;
    }
  },

  async setVehicleDraft<T>(draft: T): Promise<void> {
    try {
      await SecureStore.setItemAsync(VEHICLE_WIZARD_DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error('SecureStore setVehicleDraft error:', e);
    }
  },

  async removeVehicleDraft(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(VEHICLE_WIZARD_DRAFT_KEY);
    } catch (e) {
      console.warn('SecureStore removeVehicleDraft error:', e);
    }
  },

  async clearSession(): Promise<void> {
    await Promise.all([
      this.removeToken(),
      this.removeRefreshToken(),
      this.removeUser(),
    ]);
  },
};
