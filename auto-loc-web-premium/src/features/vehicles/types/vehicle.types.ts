export type VehicleType = 
  | "BERLINE"
  | "SUV"
  | "FOUR_X_FOUR"
  | "PICKUP"
  | "LUXE"
  | "UTILITAIRE"
  | "CITADINE"
  | "MINIVAN"
  | "MONOSPACE"
  | "MINIBUS";

export type FuelType = "ESSENCE" | "DIESEL" | "HYBRIDE" | "ELECTRIQUE";
export type TransmissionType = "AUTOMATIQUE" | "MANUELLE";
export type VehicleStatus = "DISPONIBLE" | "LOUE" | "VERIFIE" | "EN_MAINTENANCE" | "EN_ATTENTE_VALIDATION" | "BROUILLON" | "ARCHIVE";

export interface PhotoVehicule {
  id?: string;
  url: string;
  publicId?: string | null;
  position?: number;
  estPrincipale?: boolean;
}

export interface Equipement {
  id?: string;
  nom: string;
}

export interface VehiculeEquipement {
  id?: string;
  vehiculeId?: string;
  equipementId?: string;
  equipement: Equipement;
}

export interface Proprietaire {
  id?: string;
  prenom: string;
  nom: string;
  avatarUrl?: string | null;
  noteProprietaire?: number | null;
  totalAvis?: number;
}

export interface TarifProgressif {
  id: string;
  joursMin: number;
  joursMax: number | null;
  prix: string | number;
  position: number;
}

export interface Vehicle {
  id: string;
  marque: string;
  modele: string;
  annee: number;
  type: VehicleType;
  prixParJour: number;
  immatriculation?: string;
  ville: string;
  adresse?: string;
  latitude?: number | null;
  longitude?: number | null;
  note: number;
  totalAvis: number;
  statut: VehicleStatus;
  totalLocations: number;
  carburant: FuelType;
  transmission: TransmissionType;
  nombrePlaces: number;
  joursMinimum?: number;
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
  isFeatured?: boolean;
  scoreGlobal?: number;
  photoUrl?: string;
  photos?: (PhotoVehicule | string)[];
  description?: string;
  tarifsProgressifs?: TarifProgressif[];
  proprietaireId?: string;
  proprietaire?: Proprietaire;
  equipements?: VehiculeEquipement[];
  _count?: {
    reservations?: number;
  };
}

export type VehicleSortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export interface SearchVehiclesParams extends Record<string, string | number | boolean | undefined> {
  q?: string;
  marque?: string;
  ville?: string;
  type?: VehicleType | '';
  transmission?: TransmissionType | '';
  carburant?: FuelType | '';
  prixMin?: number;
  prixMax?: number;
  placesMin?: number;
  noteMin?: number;
  sortBy?: VehicleSortOption;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  cursorId?: string;
}

export interface SearchVehiclesResponse {
  data: Vehicle[];
  page: number;
  total: number;
  hasMore?: boolean;
  nextCursor?: string;
}

