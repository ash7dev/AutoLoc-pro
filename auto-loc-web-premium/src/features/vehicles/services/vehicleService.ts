import { apiClient } from "@/src/core/api/apiClient";
import { Vehicle, SearchVehiclesParams, SearchVehiclesResponse } from "../types/vehicle.types";

/**
 * Compresse une image côté navigateur via HTMLCanvasElement (max 1920x1080, qualité 0.8)
 * Réduit le poids des photos de 15 Mo à ~300-500 Ko pour un upload rapide et ultra-fiable.
 */
async function compressImageWeb(file: File | Blob | string, maxWidth = 1920, maxHeight = 1080, quality = 0.8): Promise<Blob> {
  if (typeof window === 'undefined') {
    if (typeof file !== 'string') return file as Blob;
    const r = await fetch(file as string);
    return r.blob();
  }

  let srcUrl = '';
  let shouldRevoke = false;

  if (typeof file !== 'string') {
    srcUrl = URL.createObjectURL(file as Blob);
    shouldRevoke = true;
  } else {
    srcUrl = file;
  }

  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (shouldRevoke) URL.revokeObjectURL(srcUrl);
          return resolve(typeof file !== 'string' ? (file as Blob) : fetch(srcUrl).then((r) => r.blob()));
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (shouldRevoke) URL.revokeObjectURL(srcUrl);
            if (blob) resolve(blob);
            else resolve(typeof file !== 'string' ? (file as Blob) : fetch(srcUrl).then((r) => r.blob()));
          },
          'image/jpeg',
          quality
        );
      } catch (e) {
        if (shouldRevoke) URL.revokeObjectURL(srcUrl);
        reject(e);
      }
    };
    img.onerror = (err) => {
      if (shouldRevoke) URL.revokeObjectURL(srcUrl);
      reject(err);
    };
    img.src = srcUrl;
  });
}

/**
 * Effectue un fetch avec re-tentatives automatiques (Retries avec backoff exponentiel)
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  let lastError: any = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return res;
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        return res; // Ne pas réessayer en cas d'erreur client définitive (ex: 400 bad request)
      }
    } catch (err) {
      lastError = err;
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, delay * attempt));
    }
  }
  throw lastError || new Error('Échec du réseau après plusieurs tentatives.');
}

export const vehicleService = {
  /**
   * Effectue une recherche filtrée de véhicules disponibles dans le catalogue
   */
  async searchVehicles(params: SearchVehiclesParams = {}): Promise<SearchVehiclesResponse> {
    return apiClient.get<SearchVehiclesResponse>("/vehicles/search", { params });
  },

  /**
   * Récupère la liste des véhicules populaires / mis en avant (Featured) depuis l'API.
   * Interroge GET /vehicles/search?limit=N, puis retombe sur GET /vehicles/feed
   */
  async getFeaturedVehicles(limit = 4): Promise<Vehicle[]> {
    try {
      const searchRes = await apiClient.get<SearchVehiclesResponse>("/vehicles/search", { params: { limit } });
      if (searchRes?.data && Array.isArray(searchRes.data) && searchRes.data.length > 0) {
        return searchRes.data.slice(0, limit);
      }
    } catch (err) {
      console.warn("[vehicleService] /vehicles/search error:", err);
    }

    try {
      const feed = await apiClient.get<any>("/vehicles/feed");
      const list = feed?.premium || feed?.data?.premium;
      if (Array.isArray(list) && list.length > 0) {
        return list.slice(0, limit);
      }
    } catch (err) {
      console.warn("[vehicleService] /vehicles/feed error:", err);
    }

    return [];
  },

  /**
   * Récupère les détails d'un véhicule spécifique par son ID
   */
  async getVehicleById(id: string): Promise<Vehicle> {
    return apiClient.get<Vehicle>(`/vehicles/${id}`);
  },

  /**
   * Récupère les véhicules du propriétaire connecté
   */
  async getMyVehicles(limit = 50, offset = 0): Promise<{ data: Vehicle[]; total: number; limit: number; offset: number }> {
    return apiClient.get<{ data: Vehicle[]; total: number; limit: number; offset: number }>("/vehicles/me", { params: { limit, offset } });
  },

  /**
   * Crée un nouveau véhicule (Propriétaire)
   */
  async createVehicle(payload: any): Promise<Vehicle> {
    return apiClient.post<Vehicle>("/vehicles", payload);
  },

  /**
   * Met à jour un véhicule existant (Propriétaire)
   */
  async updateVehicle(id: string, payload: any): Promise<Vehicle> {
    return apiClient.patch<Vehicle>(`/vehicles/${id}`, payload);
  },

  /**
   * Upload d'un fichier média (photo / carte grise / assurance) vers Cloudinary avec compression & auto-retry
   */
  async uploadVehicleMedia(file: File | string, isPdf = false): Promise<{ url: string; publicId: string }> {
    if (typeof file === 'string' && (file.startsWith('http://') || file.startsWith('https://'))) {
      return {
        url: file,
        publicId: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };
    }

    try {
      const sigRes: any = await apiClient.get('/vehicles/upload-signature');
      const sigData = sigRes?.data || sigRes;

      if (sigData && sigData.signature && sigData.cloudName) {
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${isPdf ? 'raw' : 'image'}/upload`;
        const formData = new FormData();

        if (isPdf) {
          if (file instanceof File) {
            formData.append('file', file);
          } else if (typeof file === 'string' && (file.startsWith('blob:') || file.startsWith('data:'))) {
            const blob = await fetch(file).then((r) => r.blob());
            formData.append('file', blob, `doc_${Date.now()}.pdf`);
          } else {
            formData.append('file', file as any);
          }
        } else {
          // Compression web ultra-rapide avant téléversement
          const compressedBlob = await compressImageWeb(file as any);
          formData.append('file', compressedBlob, `photo_${Date.now()}.jpg`);
        }

        formData.append('api_key', sigData.apiKey);
        formData.append('timestamp', sigData.timestamp.toString());
        formData.append('signature', sigData.signature);
        if (sigData.folder) {
          formData.append('folder', sigData.folder);
        }

        // Auto-retry jusqu'à 3 tentatives en cas de baisse de débit réseau
        const res = await fetchWithRetry(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        }, 3, 1200);

        if (res.ok) {
          const data = await res.json();
          return {
            url: data.secure_url || data.url,
            publicId: data.public_id || `media_${Date.now()}`,
          };
        } else {
          const errorText = await res.text().catch(() => '');
          throw new Error(`Cloudinary ${res.status}: ${errorText || 'Erreur lors du téléversement'}`);
        }
      } else {
        throw new Error('Impossible d’obtenir la signature d’upload du serveur.');
      }
    } catch (err: any) {
      console.error('[vehicleService] Upload média échoué après retentatives:', err);
      throw new Error(
        err?.message || "L'envoi de la photo ou du document a échoué. Veuillez vérifier votre connexion et ré-essayer."
      );
    }
  },

  /**
   * Indisponibilités & Dates bloquées
   */
  async getIndisponibilites(id: string): Promise<any[]> {
    return apiClient.get<any[]>(`/vehicles/${id}/indisponibilites`);
  },

  async createIndisponibilite(id: string, payload: { dateDebut: string; dateFin: string; motif?: string; type?: string }): Promise<any> {
    return apiClient.post<any>(`/vehicles/${id}/indisponibilites`, payload);
  },

  async deleteIndisponibilite(id: string, indispoId: string): Promise<any> {
    return apiClient.delete<any>(`/vehicles/${id}/indisponibilites/${indispoId}`);
  },

  /**
   * Réservations d'un véhicule spécifique
   */
  async getVehicleReservations(id: string): Promise<any[]> {
    return apiClient.get<any[]>(`/vehicles/${id}/reservations`);
  },

  /**
   * Archiver ou Supprimer un véhicule
   */
  async archiveVehicle(id: string): Promise<any> {
    return apiClient.delete<any>(`/vehicles/${id}`);
  },

  async purgeVehicle(id: string): Promise<any> {
    return apiClient.delete<any>(`/vehicles/${id}/purge`);
  },
};

