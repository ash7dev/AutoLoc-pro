import { cache } from 'react';
import { apiFetch } from './api-client';

// ── Enums / Unions ────────────────────────────────────────────────────────────

export type VehicleType =
  | 'BERLINE'
  | 'SUV'
  | 'PICKUP'
  | 'MINIVAN'
  | 'UTILITAIRE'
  | 'CITADINE'
  | 'MONOSPACE'
  | 'MINIBUS'
  | 'LUXE'
  | 'FOUR_X_FOUR';
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
  proprietaire?: {
    prenom: string;
    nom: string;
    avatarUrl: string | null;
  } | null;
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
  carburantCondition: string | null;
  reglesSpecifiques: string | null;
  fraisLivraison: number | null;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number | null;
  statut: VehicleStatus;
  estVerrouille?: boolean;
  note: number;
  totalAvis: number;
  totalLocations: number;
  creeLe: string;
  misAJourLe: string;
  photos: VehiclePhoto[];
  tarifsProgressifs: TarifTier[];
  equipements?: { equipement: { id: string; nom: string } }[] | string[];
  carteGriseUrl?: string | null;
  assuranceDocUrl?: string | null;
  isFeatured?: boolean;
  featuredUntil?: string | null;
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
  carburantCondition?: string;
  reglesSpecifiques?: string;
  fraisLivraison?: number;
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
  totalAvis?: number;
  totalLocations: number;
  photoUrl: string | null;
  statut?: VehicleStatus;
  tarifsProgressifs?: TarifTier[];
  carburant?: FuelType | null;
  transmission?: Transmission | null;
  nombrePlaces?: number | null;
  isFeatured?: boolean;
}

export interface SearchVehiclesParams {
  ville?: string;
  dateDebut?: string;
  dateFin?: string;
  type?: VehicleType;
  prixMin?: number;
  prixMax?: number;
  page?: number;
  carburant?: FuelType;
  transmission?: Transmission;
  placesMin?: number;
  noteMin?: number;
  sortBy?: 'totalLocations' | 'note' | 'prixParJour' | 'annee';
  sortOrder?: 'asc' | 'desc';
  latitude?: number;
  longitude?: number;
  rayon?: number;
  equipements?: string[];
  excludeIds?: string[];
  q?: string;
}

export interface SearchVehiclesResponse {
  data: VehicleSearchResult[];
  page: number;
  total: number;
}

export interface HomeFeedResponse {
  premium: VehicleSearchResult[];
  nouveautes: VehicleSearchResult[];
  recommended: {
    items: VehicleSearchResult[];
    excludedIds: string[];
  };
}

// ── Client cache (public search) ──────────────────────────────────────────────

const SEARCH_CACHE_TTL_MS = 60_000; // 60 seconds cache for better performance
const searchCache: Map<string, { ts: number; data: SearchVehiclesResponse }> =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  (globalThis as any).__AUTOLOC_SEARCH_CACHE__ ?? new Map();
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
(globalThis as any).__AUTOLOC_SEARCH_CACHE__ = searchCache;

// ── Path constants (shared between RSC functions and client hooks) ─────────────

export const VEHICLE_PATHS = {
  create: '/vehicles',
  search: '/vehicles/search',
  feed: '/vehicles/feed',
  me: '/vehicles/me',
  detail: (id: string) => `/vehicles/${id}`,
  update: (id: string) => `/vehicles/${id}`,
  archive: (id: string) => `/vehicles/${id}`,
  addPhoto: (id: string) => `/vehicles/${id}/photos`,
  deletePhoto: (vehicleId: string, photoId: string) =>
    `/vehicles/${vehicleId}/photos/${photoId}`,
  indisponibilites: (id: string) => `/vehicles/${id}/indisponibilites`,
  deleteIndisponibilite: (vehicleId: string, indispoId: string) =>
    `/vehicles/${vehicleId}/indisponibilites/${indispoId}`,
  blockedDates: (id: string) => `/vehicles/${id}/blocked-dates`,
  uploadSignature: '/vehicles/upload-signature',
  linkPhoto: (id: string) => `/vehicles/${id}/photos/link`,
  purgeDraft: (id: string) => `/vehicles/${id}/purge`,
  documentUploadSignature: (id: string, docType: 'carte-grise' | 'assurance') =>
    `/vehicles/${id}/documents/upload-signature?docType=${docType}`,
  linkCarteGrise: (id: string) => `/vehicles/${id}/documents/carte-grise/link`,
  linkAssurance: (id: string) => `/vehicles/${id}/documents/assurance/link`,
} as const;

// ── Cloudinary direct upload ──────────────────────────────────────────────────

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export async function fetchUploadSignature(): Promise<CloudinarySignature> {
  return apiFetch<CloudinarySignature>('/vehicles/upload-signature');
}

/** Helper to compress image client-side before upload */
export async function compressImage(file: File, maxSize = 1600): Promise<File> {
    if (typeof window === 'undefined') return file;
    // Skip if not an image or already small
    if (!file.type.startsWith('image/') || file.size < 512 * 1024) return file;

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
                } else {
                    resolve(file);
                }
            }, 'image/jpeg', 0.85);
        };
        img.src = URL.createObjectURL(file);
    });
}

/** Upload a file directly to Cloudinary using a pre-signed signature. */
export async function uploadToCloudinary(
  file: File,
  sig: CloudinarySignature,
): Promise<{ url: string; publicId: string }> {
  const TRANSFORM = 'w_800,h_600,c_fill,f_webp,q_auto';
  
  // ── Optimization: Compress client-side if it's an image ──
  const optimizedFile = await compressImage(file);

  const form = new FormData();
  form.append('file', optimizedFile);
  form.append('timestamp', String(sig.timestamp));
  form.append('api_key', sig.apiKey);
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: 'POST', body: form },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }
  const data = await res.json() as { secure_url: string; public_id: string };
  const url = data.secure_url.replace('/upload/', `/upload/${TRANSFORM}/`);
  return { url, publicId: data.public_id };
}

/** Upload un document (image ou PDF) directement vers Cloudinary via l'endpoint auto. */
export async function uploadDocumentToCloudinary(
  file: File,
  sig: CloudinarySignature,
): Promise<{ url: string; publicId: string }> {
  // ── Optimization: Compress client-side if it's an image ──
  // Documents are often scanned in high res but don't need to be huge.
  const optimizedFile = await compressImage(file);

  const form = new FormData();
  form.append('file', optimizedFile);
  form.append('timestamp', String(sig.timestamp));
  form.append('api_key', sig.apiKey);
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  // /auto/upload détecte automatiquement image vs raw (PDF)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
    { method: 'POST', body: form },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Cloudinary document upload failed: ${res.status} ${text}`);
  }
  const data = await res.json() as { secure_url: string; public_id: string };
  return { url: data.secure_url, publicId: data.public_id };
}

// ── Blocked dates (public, client-side) ──────────────────────────────────────

export interface BlockedRange {
  from: string;
  to: string;
  type: 'reservation' | 'indisponibilite';
}

export async function fetchBlockedDates(
  vehicleId: string,
): Promise<{ blockedRanges: BlockedRange[] }> {
  return apiFetch(VEHICLE_PATHS.blockedDates(vehicleId));
}

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
 * Wrappé avec React.cache pour déduplication au sein d'un même render pass
 * (generateMetadata + page body appellent la même URL sans double fetch réseau).
 */
export const fetchVehicle = cache(async (
  id: string,
  accessToken?: string,
): Promise<Vehicle> => {
  return apiFetch<Vehicle>(VEHICLE_PATHS.detail(id), {
    accessToken,
    next: { revalidate: 60 },
  });
});

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
  if (params.prixMin != null) qs.set('prixMin', String(params.prixMin));
  if (params.prixMax != null) qs.set('prixMax', String(params.prixMax));
  if (params.page != null) qs.set('page', String(params.page));
  if (params.carburant) qs.set('carburant', params.carburant);
  if (params.transmission) qs.set('transmission', params.transmission);
  if (params.placesMin != null) qs.set('placesMin', String(params.placesMin));
  if (params.noteMin != null) qs.set('noteMin', String(params.noteMin));
  if (params.sortBy) qs.set('sortBy', params.sortBy);
  if (params.sortOrder) qs.set('sortOrder', params.sortOrder);
  if (params.latitude != null) qs.set('latitude', String(params.latitude));
  if (params.longitude != null) qs.set('longitude', String(params.longitude));
  if (params.rayon != null) qs.set('rayon', String(params.rayon));
  if (params.equipements?.length) params.equipements.forEach(e => qs.append('equipements', e));
  if (params.excludeIds?.length) params.excludeIds.forEach(id => qs.append('excludeIds', id));
  if (params.q) qs.set('q', params.q);

  const key = qs.toString() || 'all';
  if (typeof window !== 'undefined') {
    const cached = searchCache.get(key);
    if (cached && Date.now() - cached.ts < SEARCH_CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const data = await apiFetch<SearchVehiclesResponse>(
    `${VEHICLE_PATHS.search}?${qs.toString()}`,
    { 
      next: { revalidate: 60 } 
    }
  );

  if (typeof window !== 'undefined') {
    searchCache.set(key, { ts: Date.now(), data });
  }

  return data;
}

/**
 * Récupère le feed accueil (recommandés, premium, nouveautés) en un seul appel.
 */
export async function fetchHomeFeed(): Promise<HomeFeedResponse> {
  return apiFetch<HomeFeedResponse>(VEHICLE_PATHS.feed, {
    next: { revalidate: 60 },
  });
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
    // On n'utilise pas revalidate:0 ici pour permettre au sitemap de se générer au build
    const res = await apiFetch<SearchVehiclesResponse>(`${VEHICLE_PATHS.search}?page=${page}`);
    const data = Array.isArray(res?.data) ? res.data : [];
    all.push(...data);
    if (data.length === 0) break;
    page++;
  }

  return all;
}

// ── Pricing preview ───────────────────────────────────────────────────────────

export interface PricingResponse {
  nbJours: number;
  autoriseHorsDakar?: boolean;
  supplementHorsDakar?: number;
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
  horsDakar?: boolean,
): Promise<PricingResponse> {
  const qs = new URLSearchParams({ days: String(days) });
  if (horsDakar) qs.set('horsDakar', '1');
  return apiFetch<PricingResponse>(
    `/vehicles/${vehicleId}/pricing?${qs.toString()}`,
  );
}

// ── Availability (Indisponibilités) ───────────────────────────────────

export interface Indisponibilite {
  id: string;
  vehiculeId: string;
  dateDebut: string;
  dateFin: string;
  motif: string | null;
  creeLe: string;
}

export async function fetchIndisponibilites(
  vehicleId: string,
  accessToken: string,
): Promise<{ data: Indisponibilite[]; total: number }> {
  return apiFetch(VEHICLE_PATHS.indisponibilites(vehicleId), { accessToken });
}

export async function createIndisponibilite(
  vehicleId: string,
  body: { dateDebut: string; dateFin: string; motif?: string },
  accessToken: string,
): Promise<Indisponibilite> {
  return apiFetch(VEHICLE_PATHS.indisponibilites(vehicleId), {
    method: 'POST',
    body,
    accessToken,
  });
}

export async function deleteIndisponibilite(
  vehicleId: string,
  indispoId: string,
  accessToken: string,
): Promise<{ deleted: boolean }> {
  return apiFetch(VEHICLE_PATHS.deleteIndisponibilite(vehicleId, indispoId), {
    method: 'DELETE',
    accessToken,
  });
}
