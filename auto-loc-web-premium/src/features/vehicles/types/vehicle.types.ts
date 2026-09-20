export type VehicleType = 
  | "BERLINE"
  | "SUV"
  | "FOUR_X_FOUR"
  | "PICKUP"
  | "LUXE"
  | "UTILITAIRE";

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
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number | null;
  isFeatured?: boolean;
  scoreGlobal?: number;
  photoUrl?: string;
  photos?: (PhotoVehicule | string)[];
  description?: string;
  tarifsProgressifs?: TarifProgressif[];
  proprietaire?: Proprietaire;
  equipements?: VehiculeEquipement[];
  _count?: {
    reservations?: number;
  };
}

export interface SearchVehiclesParams extends Record<string, string | number | boolean | undefined> {
  marque?: string;
  type?: VehicleType;
  transmission?: TransmissionType;
  carburant?: FuelType;
  prixMin?: number;
  prixMax?: number;
  page?: number;
  limit?: number;
}

export interface SearchVehiclesResponse {
  data: Vehicle[];
  page: number;
  total: number;
}

