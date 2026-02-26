import { apiFetch } from './api-client';

// ── Enums / Unions ────────────────────────────────────────────────────────────

export type VehicleType = 'BERLINE' | 'SUV' | 'CITADINE' | '4X4' | 'PICKUP' | 'MONOSPACE' | 'MINIBUS' | 'UTILITAIRE' | 'LUXE';
export type VehicleStatus =
  | 'BROUILLON'
  | 'EN_ATTENTE_VALIDATION'
  | 'VERIFIE'
  | 'SUSPENDU'
  | 'ARCHIVE';
export type FuelType = 'ESSENCE' | 'DIESEL' | 'HYBRIDE' | 'ELECTRIQUE';
export type Transmission = 'MANUELLE' | 'AUTOMATIQUE';

// ── Domain types ──────────────────────────────────────────────────────────────

export interface VehiclePhoto {
  id: string;
  vehiculeId: string;
  url: string;
  position: number;
  estPrincipale: boolean;
  creeLe: string;
}

export interface TarifTier {
  id: string;
  vehiculeId: string;
  joursMin: number;
  joursMax: number | null;
  prix: number;
  position: number;
}

export interface Vehicle {
  id: string;
  proprietaireId: string;
  marque: string;
  modele: string;
  annee: number;
  type: VehicleType;
  carburant: FuelType | null;
  transmission: Transmission | null;
  nombrePlaces: number | null;
  immatriculation: string;
  prixParJour: number;
  ville: string;
  adresse: string;
  latitude: number | null;
  longitude: number | null;
  joursMinimum: number;
  ageMinimum: number;
  zoneConduite: string | null;
  assurance: string | null;
  reglesSpecifiques: string | null;
  statut: VehicleStatus;
  estVerrouille?: boolean;
  note: number;
  totalAvis: number;
  totalLocations: number;
  creeLe: string;
  misAJourLe: string;
  photos: VehiclePhoto[];
  tarifsProgressifs: TarifTier[];
  _count?: { reservations: number };
}

// ── Input types ───────────────────────────────────────────────────────────────

export interface CreateVehicleInput {
  marque: string;
  modele: string;
  annee: number;
  type: VehicleType;
  carburant?: FuelType;
  transmission?: Transmission;
  nombrePlaces?: number;
  immatriculation: string;
  prixParJour: number;
  ville: string;
  adresse: string;
  latitude?: number;
  longitude?: number;
  joursMinimum?: number;
  ageMinimum?: number;
  zoneConduite?: string;
  assurance?: string;
  reglesSpecifiques?: string;
  tiers?: Array<{
    joursMin: number;
    joursMax?: number;
    prix: number;
  }>;
}

export type UpdateVehicleInput = Partial<CreateVehicleInput>;

// ── Search types ──────────────────────────────────────────────────────────────

export interface VehicleSearchResult {
  id: string;
  marque: string;
  modele: string;
  annee: number;
  type: string;
  prixParJour: number;
  ville: string;
  note: number;
  totalLocations: number;
  photoUrl: string | null;
}

export interface SearchVehiclesParams {
  ville?: string;
  dateDebut?: string;
  dateFin?: string;
  type?: VehicleType;
  prixMax?: number;
  page?: number;
}

export interface SearchVehiclesResponse {
  data: VehicleSearchResult[];
  page: number;
}

// ── Path constants (shared between RSC functions and client hooks) ─────────────

export const VEHICLE_PATHS = {
  create: '/vehicles',
  search: '/vehicles/search',
  me: '/vehicles/me',
  detail: (id: string) => `/vehicles/${id}`,
  update: (id: string) => `/vehicles/${id}`,
  archive: (id: string) => `/vehicles/${id}`,
  addPhoto: (id: string) => `/vehicles/${id}/photos`,
  deletePhoto: (vehicleId: string, photoId: string) =>
    `/vehicles/${vehicleId}/photos/${photoId}`,
} as const;

// ── Server-side functions (RSC, layouts, API routes) ─────────────────────────

/**
 * Récupère les véhicules du propriétaire connecté (RSC).
 * Passe le token explicitement pour l'appel serveur→NestJS.
 */
export async function fetchMyVehicles(accessToken: string): Promise<Vehicle[]> {
  return apiFetch<Vehicle[]>(VEHICLE_PATHS.me, { accessToken });
}

/**
 * Récupère le détail d'un véhicule (RSC ou public).
 */
export async function fetchVehicle(
  id: string,
  accessToken?: string,
): Promise<Vehicle> {
  return apiFetch<Vehicle>(VEHICLE_PATHS.detail(id), { accessToken });
}

/**
 * Recherche publique de véhicules disponibles (RSC ou client sans auth).
 */
export async function searchVehicles(
  params: SearchVehiclesParams,
): Promise<SearchVehiclesResponse> {
  const qs = new URLSearchParams();
  if (params.ville) qs.set('ville', params.ville);
  if (params.dateDebut) qs.set('dateDebut', params.dateDebut);
  if (params.dateFin) qs.set('dateFin', params.dateFin);
  if (params.type) qs.set('type', params.type);
  if (params.prixMax != null) qs.set('prixMax', String(params.prixMax));
  if (params.page != null) qs.set('page', String(params.page));

  return apiFetch<SearchVehiclesResponse>(
    `${VEHICLE_PATHS.search}?${qs.toString()}`,
  );
}

/**
 * Récupère TOUS les véhicules vérifiés (pagination automatique).
 * Utilisé côté serveur pour le sitemap dynamique.
 */
export async function fetchAllVerifiedVehicles(): Promise<VehicleSearchResult[]> {
  const all: VehicleSearchResult[] = [];
  let page = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await searchVehicles({ page });
    all.push(...res.data);
    if (res.data.length === 0) break;
    page++;
  }

  return all;
}

// ── Pricing preview ───────────────────────────────────────────────────────────

export interface PricingResponse {
  nbJours: number;
  prixParJour: number;
  totalBase: number;
  tauxCommission: number;
  montantCommission: number;
  totalLocataire: number;
  netProprietaire: number;
}

/**
 * Prévisualisation du tarif dynamique pour N jours (public, pas d'auth).
 */
export async function fetchVehiclePricing(
  vehicleId: string,
  days: number,
): Promise<PricingResponse> {
  return apiFetch<PricingResponse>(
    `/vehicles/${vehicleId}/pricing?days=${days}`,
  );
}
