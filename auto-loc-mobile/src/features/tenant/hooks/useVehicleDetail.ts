import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../core/api/apiClient';

export interface VehiclePhotoDetail {
  id: string;
  vehiculeId: string;
  url: string;
  publicId?: string | null;
  position: number;
  estPrincipale: boolean;
  creeLe: string;
}

export interface TarifTierDetail {
  id: string;
  vehiculeId: string;
  joursMin: number;
  joursMax: number | null;
  prix: number | string;
  position: number;
}

export interface EquipementDetail {
  id: string;
  vehiculeId: string;
  equipementId: string;
  equipement: {
    id: string;
    nom: string;
  };
}

export interface ProprietaireDetail {
  id?: string;
  prenom: string;
  nom: string;
  avatarUrl: string | null;
  noteProprietaire?: number | null;
  totalAvis?: number | null;
}

export interface VehicleDetailResponse {
  id: string;
  proprietaireId: string;
  marque: string;
  modele: string;
  annee: number;
  type: string;
  types?: string[];
  carburant: string | null;
  transmission: string | null;
  nombrePlaces: number | null;
  immatriculation?: string;
  prixParJour: number;
  ville: string;
  adresse?: string;
  latitude?: number | null;
  longitude?: number | null;
  joursMinimum: number;
  ageMinimum?: number;
  zoneConduite?: string | null;
  assurance?: string | null;
  carburantCondition?: string | null;
  reglesSpecifiques?: string | null;
  fraisLivraison?: number | null;
  proposeLivraisonDakar?: boolean;
  fraisLivraisonDakar?: number | null;
  proposeLivraisonAibd?: boolean;
  fraisLivraisonAibd?: number | null;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number | null;
  statut: string;
  note: number;
  totalAvis: number;
  totalLocations: number;
  isFeatured?: boolean;
  creeLe: string;
  misAJourLe: string;

  photos: VehiclePhotoDetail[];
  tarifsProgressifs: TarifTierDetail[];
  equipements: EquipementDetail[];
  proprietaire: ProprietaireDetail | null;
  _count?: {
    reservations: number;
  };
}

export function useVehicleDetail(vehicleId?: string) {
  const [data, setData] = useState<VehicleDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<VehicleDetailResponse>(`/vehicles/${vehicleId}`);
      setData(response.data);
    } catch (err: any) {
      console.warn(`Erreur lors du chargement du détail véhicule ${vehicleId}:`, err?.message || err);
      setError(err?.response?.data?.message || 'Impossible de charger la fiche véhicule.');
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    data,
    loading,
    error,
    refetch: fetchDetail,
  };
}
