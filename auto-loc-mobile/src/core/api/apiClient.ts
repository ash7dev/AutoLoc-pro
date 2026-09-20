import axios from 'axios';
import { secureStorage } from '../storage/secureStore';

// Nettoyer l'URL de base pour s'assurer qu'aucun préfixe '/api' superflu ne vienne casser les routes NestJS
const rawUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.autoloc.sn';
export const API_BASE_URL = rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Inserer automatiquement le Bearer token s'il existe
apiClient.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// File d'attente pour éviter les requêtes de rafraîchissement concurrentes
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Rafraîchissement silencieux de jeton sur 401 (Silent Refresh)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Éviter une boucle infinie de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Mettre les requêtes en attente le temps que le refresh se termine
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await secureStorage.getRefreshToken();
        if (!refreshToken) {
          isRefreshing = false;
          delete apiClient.defaults.headers.common.Authorization;
          return Promise.reject(error);
        }

        // Tenter le rafraîchissement silencieux auprès du serveur NestJS
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = refreshResponse.data.accessToken;
        const newRefreshToken = refreshResponse.data.refreshToken;

        if (newAccessToken) {
          await secureStorage.setToken(newAccessToken);
          if (newRefreshToken) {
            await secureStorage.setRefreshToken(newRefreshToken);
          }

          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Rejouer la requête d'origine de manière totalement transparente pour l'utilisateur
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;

        delete apiClient.defaults.headers.common.Authorization;
        await secureStorage.clearSession();
      }
    }

    return Promise.reject(error);
  }
);
