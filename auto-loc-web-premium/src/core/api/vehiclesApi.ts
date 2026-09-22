import { apiClient } from './apiClient';

export interface OwnerVehicleItem {
  id: string;
  marque: string;
  modele: string;
  annee: number;
  type: string;
  statut: string;
  immatriculation: string;
  prixParJour: number;
  ville: string;
  adresse: string;
  joursMinimum: number;
  note: number;
  totalAvis: number;
  totalLocations: number;
  photos: { id: string; url: string; estPrincipale: boolean }[];
  creeLe: string;
}

export interface OwnerVehiclesResponse {
  data: OwnerVehicleItem[];
  total: number;
}

export interface OwnerVehicleSummaryItem {
  id: string;
  marque: string;
  modele: string;
  immatriculation: string;
  photoUrl: string | null;
  statut: string;
}

export interface VehicleIndisponibilite {
  id: string;
  vehiculeId: string;
  dateDebut: string;
  dateFin: string;
  motif?: string;
}

export const vehiclesApi = {
  /**
   * GET /vehicles/me — Liste complète des véhicules du propriétaire
   */
  getMyVehicles: (limit?: number, offset?: number): Promise<OwnerVehiclesResponse> => {
    return apiClient.get<OwnerVehiclesResponse>('/vehicles/me', {
      params: { limit, offset },
    });
  },

  /**
   * GET /vehicles/me/summary — Résumé léger des véhicules du propriétaire
   */
  getMyVehiclesSummary: (): Promise<OwnerVehicleSummaryItem[]> => {
    return apiClient.get<OwnerVehicleSummaryItem[]>('/vehicles/me/summary');
  },

  /**
   * GET /vehicles/:id — Détails complets d'un véhicule
   */
  getVehicleById: (id: string): Promise<OwnerVehicleItem> => {
    return apiClient.get<OwnerVehicleItem>(`/vehicles/${id}`);
  },

  /**
   * GET /vehicles/:id/indisponibilites — Périodes indisponibles bloquées
   */
  getIndisponibilites: (vehicleId: string): Promise<VehicleIndisponibilite[]> => {
    return apiClient.get<VehicleIndisponibilite[]>(`/vehicles/${vehicleId}/indisponibilites`);
  },

  /**
   * POST /vehicles/:id/indisponibilites — Bloquer une période
   */
  createIndisponibilite: (
    vehicleId: string,
    body: { dateDebut: string; dateFin: string; motif?: string },
  ): Promise<VehicleIndisponibilite> => {
    return apiClient.post<VehicleIndisponibilite>(`/vehicles/${vehicleId}/indisponibilites`, body);
  },

  /**
   * DELETE /vehicles/:id/indisponibilites/:indispoId — Débloquer une période
   */
  deleteIndisponibilite: (vehicleId: string, indispoId: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/vehicles/${vehicleId}/indisponibilites/${indispoId}`);
  },
};
