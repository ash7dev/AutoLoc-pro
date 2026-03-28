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
  carteGriseUrl: string | null;
  assuranceDocUrl: string | null;
  fraisLivraison: number | null;
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
  lastSeenAt?: string | null;
  isBanned: boolean;
  banRaison: string | null;
  kycStatus: KycStatus;
  /** Présent si le backend joint la table Kyc */
  kyc?: {
    documentUrl: string | null;
    selfieUrl: string | null;
    permisUrl: string | null;
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

// ── Admin Withdrawals ─────────────────────────────────────────────────────────

export type StatutRetrait = 'EN_ATTENTE' | 'VALIDE' | 'EFFECTUE' | 'REJETE';

export interface AdminWithdrawal {
  id: string;
  ownerName: string;
  amount: number;
  method: 'WAVE' | 'ORANGE_MONEY' | 'VIREMENT';
  bankInfo: string;
  statut: StatutRetrait;
  raisonRejet: string | null;
  demandeeLe: string;
  traiteLe: string | null;
}

// ── Admin Disputes ────────────────────────────────────────────────────────────

export type StatutLitige = 'EN_ATTENTE' | 'FONDE' | 'NON_FONDE';

export interface AdminDispute {
  id: string;
  reservationId: string;
  renterName: string;
  ownerName: string;
  vehicle: string;
  description: string;
  amount: number | null;
  statut: StatutLitige;
  openedAt: string;
}

// ── Path helpers ──────────────────────────────────────────────────────────────

export const ADMIN_PATHS = {
  stats: '/admin/stats',
  activity: '/admin/activity',
  vehicles: (statut?: AdminVehicleStatus) =>
    statut ? `/admin/vehicles?statut=${statut}` : '/admin/vehicles',
  validateVehicle: (id: string) => `/admin/vehicles/${id}/validate`,
  suspendVehicle: (id: string) => `/admin/vehicles/${id}/suspend`,
  users: (kycStatus?: KycStatus) =>
    kycStatus ? `/admin/users?kycStatus=${kycStatus}` : '/admin/users',
  banUser: (id: string) => `/admin/users/${id}/status`,
  approveKyc: (id: string) => `/admin/users/${id}/kyc/approve`,
  rejectKyc: (id: string) => `/admin/users/${id}/kyc/reject`,
  withdrawals: '/admin/withdrawals',
  validateWithdrawal: (id: string) => `/admin/withdrawals/${id}/validate`,
  rejectWithdrawal: (id: string) => `/admin/withdrawals/${id}/reject`,
  disputes: '/admin/disputes',
  updateDisputeStatus: (id: string) => `/admin/disputes/${id}/resolve`,
  notificationsCount: '/admin/notifications/count',
} as const;

// ── Server-side fetch functions (RSC / layouts) ────────────────────────────────

export type AdminVehicleStatus = VehicleStatus | 'PENDING';

export async function fetchAdminVehicles(
  accessToken: string,
  statut?: AdminVehicleStatus,
): Promise<AdminVehicle[]> {
  const res = await apiFetch<AdminVehicle[] | { data: AdminVehicle[] } | { vehicles: AdminVehicle[] } | { items: AdminVehicle[] }>(
    ADMIN_PATHS.vehicles(statut),
    { accessToken },
  );
  if (Array.isArray(res)) return res;
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>;
    const inner = obj.data ?? obj.vehicles ?? obj.items;
    if (Array.isArray(inner)) return inner as AdminVehicle[];
  }
  return [];
}

export async function fetchAdminUsers(
  accessToken: string,
  kycStatus?: KycStatus,
): Promise<AdminUser[]> {
  const res = await apiFetch<AdminUser[] | { data: AdminUser[] } | { users: AdminUser[] } | { items: AdminUser[] }>(
    ADMIN_PATHS.users(kycStatus),
    { accessToken },
  );
  if (Array.isArray(res)) return res;
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>;
    const inner = obj.data ?? obj.users ?? obj.items;
    if (Array.isArray(inner)) return inner as AdminUser[];
  }
  return [];
}

export async function fetchAdminStats(accessToken: string): Promise<AdminStats> {
  return apiFetch<AdminStats>(ADMIN_PATHS.stats, { accessToken });
}

export async function fetchAdminActivity(accessToken: string): Promise<AdminActivityItem[]> {
  const res = await apiFetch<unknown>(ADMIN_PATHS.activity, { accessToken });
  if (Array.isArray(res)) return res as AdminActivityItem[];
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>;
    const inner = obj.data ?? obj.items ?? obj.activity;
    if (Array.isArray(inner)) return inner as AdminActivityItem[];
  }
  return [];
}

export async function fetchAdminWithdrawals(accessToken: string): Promise<AdminWithdrawal[]> {
  const res = await apiFetch<unknown>(ADMIN_PATHS.withdrawals, { accessToken });
  if (Array.isArray(res)) return res as AdminWithdrawal[];
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>;
    const inner = obj.data ?? obj.items ?? obj.withdrawals;
    if (Array.isArray(inner)) return inner as AdminWithdrawal[];
  }
  return [];
}

export async function fetchAdminDisputes(accessToken: string): Promise<AdminDispute[]> {
  const res = await apiFetch<unknown>(ADMIN_PATHS.disputes, { accessToken });
  if (Array.isArray(res)) return res as AdminDispute[];
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>;
    const inner = obj.data ?? obj.items ?? obj.disputes;
    if (Array.isArray(inner)) return inner as AdminDispute[];
  }
  return [];
}

export async function fetchAdminDisputeDetail(accessToken: string, id: string): Promise<any> {
  return await apiFetch(`/admin/disputes/${id}`, { accessToken });
}

export interface AdminNotificationsCount {
  pendingKyc: number;
  pendingVehicles: number;
  pendingWithdrawals: number;
  pendingLitiges: number;
  total: number;
}
