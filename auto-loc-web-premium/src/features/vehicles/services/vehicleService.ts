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
};
