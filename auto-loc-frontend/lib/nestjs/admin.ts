import { apiFetch } from './api-client';
import type { VehicleStatus } from './vehicles';

// ── Shared types ──────────────────────────────────────────────────────────────

export type KycStatus = 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE';

// ── Admin Vehicles ────────────────────────────────────────────────────────────

export interface AdminVehicle {
  id: string;
  marque: string;
  modele: string;
  annee: number;
  type: string;
  transmission: string | null;
  immatriculation: string;
  carburant: string | null;
  nombrePlaces: number | null;
  prixParJour: number;
  ville: string;
  adresse: string;
  joursMinimum: number;
  ageMinimum: number;
  zoneConduite: string | null;
  assurance: string | null;
  reglesSpecifiques: string | null;
  note: number;
  totalAvis: number;
  totalLocations: number;
  statut: VehicleStatus;
  creeLe: string;
  photos: Array<{ id: string; url: string; estPrincipale: boolean }>;
  equipements: string[];
  proprietaire: {
    id: string;
    prenom: string | null;
    nom: string | null;
    email: string | null;
    telephone: string | null;
  } | null;
}

// ── Admin Users ───────────────────────────────────────────────────────────────

export interface AdminUserVehicle {
  id: string;
  marque: string;
  modele: string;
  annee: number;
  type: string;
  transmission: string | null;
  immatriculation: string;
  carburant: string | null;
  nombrePlaces: number | null;
  prixParJour: number;
  ville: string;
  adresse: string;
  joursMinimum: number;
  ageMinimum: number;
  zoneConduite: string | null;
  assurance: string | null;
  reglesSpecifiques: string | null;
  note: number;
  totalAvis: number;
  totalLocations: number;
  statut: VehicleStatus;
  creeLe: string;
  photos: Array<{ url: string; estPrincipale: boolean }>;
  equipements: string[];
}

export interface AdminUser {
  id: string;
  userId: string;
  email: string | null;
  role: 'LOCATAIRE' | 'PROPRIETAIRE' | 'ADMIN' | 'SUPPORT';
  createdAt: string;
  isBanned: boolean;
  banRaison: string | null;
  kycStatus: KycStatus;
  /** Présent si le backend joint la table Kyc */
  kyc?: {
    documentUrl: string | null;
    selfieUrl: string | null;
    soumisLe: string;
  };
  utilisateur: {
    prenom: string;
    nom: string;
    telephone: string | null;
    avatarUrl: string | null;
  } | null;
  /** Inclus si le backend fait un include vehicles */
  vehicles?: AdminUserVehicle[];
  _count: {
    vehicles: number;
  };
}

// ── Admin Activity ────────────────────────────────────────────────────────────

export interface AdminActivityItem {
  id: string;
  type: 'kyc' | 'vehicle' | 'withdrawal' | 'dispute' | 'user' | 'reservation';
  action: string;
  detail: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

// ── Admin Stats ───────────────────────────────────────────────────────────────

export interface AdminStats {
  utilisateursActifs: number;
  locationsCeMois: number;
  revenuCeMois: number;
  tauxSatisfaction: number | null;
  pending: {
    kycEnAttente: number;
    vehiculesAValider: number;
    retraitsEnAttente: number;
    litigesOuverts: number;
  };
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface BanUserDto {
  banni: boolean;
  raison?: string;
}

export interface SuspendVehicleDto {
  raison: string;
}

// ── Path helpers ──────────────────────────────────────────────────────────────

export const ADMIN_PATHS = {
  stats:    '/admin/stats',
  activity: '/admin/activity',
  vehicles: (statut?: AdminVehicleStatus) =>
    statut ? `/admin/vehicles?statut=${statut}` : '/admin/vehicles',
  validateVehicle: (id: string) => `/admin/vehicles/${id}/validate`,
  suspendVehicle:  (id: string) => `/admin/vehicles/${id}/suspend`,
  users: (kycStatus?: KycStatus) =>
    kycStatus ? `/admin/users?kycStatus=${kycStatus}` : '/admin/users',
  banUser:    (id: string) => `/admin/users/${id}/status`,
  approveKyc: (id: string) => `/admin/users/${id}/kyc/approve`,
  rejectKyc:  (id: string) => `/admin/users/${id}/kyc/reject`,
} as const;

// ── Server-side fetch functions (RSC / layouts) ────────────────────────────────

export type AdminVehicleStatus = VehicleStatus | 'PENDING';

export async function fetchAdminVehicles(
  accessToken: string,
  statut?: AdminVehicleStatus,
): Promise<AdminVehicle[]> {
  return apiFetch<AdminVehicle[]>(ADMIN_PATHS.vehicles(statut), { accessToken });
}

export async function fetchAdminUsers(
  accessToken: string,
  kycStatus?: KycStatus,
): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>(ADMIN_PATHS.users(kycStatus), { accessToken });
}

export async function fetchAdminStats(accessToken: string): Promise<AdminStats> {
  return apiFetch<AdminStats>(ADMIN_PATHS.stats, { accessToken });
}

export async function fetchAdminActivity(accessToken: string): Promise<AdminActivityItem[]> {
  return apiFetch<AdminActivityItem[]>(ADMIN_PATHS.activity, { accessToken });
}
