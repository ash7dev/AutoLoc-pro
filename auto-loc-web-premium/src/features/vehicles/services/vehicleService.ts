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
    try {
      if (typeof file === 'string') {
        return { url: file, publicId: 'url_media' };
      }

      const formData = new FormData();
      formData.append('file', file);
      if (isPdf) {
        formData.append('resource_type', 'raw');
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('autoloc_token') : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/owner/vehicles/media`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Échec du téléversement');
      }

      const data = await res.json();
      return {
        url: data.url || data.secure_url || '',
        publicId: data.publicId || data.public_id || 'uploaded_doc',
      };
    } catch {
      // Fallback local ou mock URL si endpoint de dev hors ligne
      return {
        url: typeof file === 'string' ? file : URL.createObjectURL(file),
        publicId: `fallback_${Date.now()}`,
      };
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

