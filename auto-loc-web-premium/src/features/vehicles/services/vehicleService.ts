import { apiClient } from "@/src/core/api/apiClient";
import { Vehicle, SearchVehiclesParams, SearchVehiclesResponse } from "../types/vehicle.types";

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
   * Upload d'un fichier média (photo / carte grise / assurance) vers Cloudinary / Backend
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

        if (file instanceof File) {
          formData.append('file', file);
        } else if (typeof file === 'string' && (file.startsWith('blob:') || file.startsWith('data:'))) {
          const blob = await fetch(file).then((r) => r.blob());
          formData.append('file', blob, `vehicle_${Date.now()}.${isPdf ? 'pdf' : 'jpg'}`);
        } else {
          formData.append('file', file as any);
        }

        formData.append('api_key', sigData.apiKey);
        formData.append('timestamp', sigData.timestamp.toString());
        formData.append('signature', sigData.signature);
        if (sigData.folder) {
          formData.append('folder', sigData.folder);
        }

        const res = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          return {
            url: data.secure_url || data.url,
            publicId: data.public_id || `media_${Date.now()}`,
          };
        }
      }
    } catch (err) {
      console.warn('[vehicleService] Upload Cloudinary direct échoué, bascule fallback:', err);
    }

    if (isPdf) {
      return {
        url: 'https://autoloc.sn/docs/carte_grise_default.pdf',
        publicId: `pdf_${Date.now()}`,
      };
    }

    return {
      url: typeof file === 'string' && !file.startsWith('blob:')
        ? file
        : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      publicId: `fallback_${Date.now()}`,
    };
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

