import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import {
  fetchOwnerReservations,
  fetchOwnerStats,
} from "@/lib/nestjs/reservations";
import { fetchMyVehiclesSummary } from "@/lib/nestjs/vehicles";
import { fetchWallet, fetchPenalties } from "@/lib/nestjs/wallet";
import { fetchUserProfile } from "@/lib/nestjs/auth";
import { OwnerDashboardView } from "@/features/dashboard/components/owner-dashboard-view";
import { CACHE_TAGS, CACHE_DURATIONS, getCacheKey, getOwnerCacheTags } from "@/lib/cache-config";



// ── Fetchers avec cache optimisé ──────────────────────────────────────────────

async function getCachedStats(token: string) {
  return unstable_cache(
    () => fetchOwnerStats(token),
    getCacheKey(CACHE_TAGS.owner_stats, token),
    {
      revalidate: CACHE_DURATIONS.standard,
      tags: getOwnerCacheTags(CACHE_TAGS.owner_stats, token),
    }
  )();
}

async function getCachedReservations(token: string, limit: number) {
  return unstable_cache(
    () => fetchOwnerReservations(token, { limit }),
    getCacheKey(CACHE_TAGS.owner_reservations, token, limit),
    {
      revalidate: CACHE_DURATIONS.critical,
      tags: getOwnerCacheTags(CACHE_TAGS.owner_reservations, token),
    }
  )();
}

async function getCachedVehiclesSummary(token: string) {
  return unstable_cache(
    () => fetchMyVehiclesSummary(token),
    getCacheKey(CACHE_TAGS.owner_vehicles, token, 'summary'),
    {
      revalidate: CACHE_DURATIONS.standard,
      tags: getOwnerCacheTags(CACHE_TAGS.owner_vehicles, token),
    }
  )();
}

async function getCachedWallet(token: string) {
  return unstable_cache(
    () => fetchWallet(token),
    getCacheKey(CACHE_TAGS.owner_wallet, token),
    {
      revalidate: CACHE_DURATIONS.critical,
      tags: getOwnerCacheTags(CACHE_TAGS.owner_wallet, token),
    }
  )();
}

async function getCachedPenalties(token: string) {
  return unstable_cache(
    () => fetchPenalties(token),
    getCacheKey(CACHE_TAGS.owner_penalties, token),
    {
      revalidate: CACHE_DURATIONS.standard,
      tags: getOwnerCacheTags(CACHE_TAGS.owner_penalties, token),
    }
  )();
}



// ── Fetcher principal avec chargement optimisé par tiers ──────────────────────
// ✅ OPTIMISATION: Charger en 3 vagues pour affichage progressif (streaming)
// Tier 1 (critical): Stats + Profil → Affichage header/banner immédiat
// Tier 2 (important): Wallet + Réservations → Actions urgentes visibles vite
// Tier 3 (secondary): Véhicules + Pénalités → Détails complémentaires

async function FullDashboardData({ token }: { token: string }) {
  let reservations: any[] = [];
  let vehicles: any[] = [];
  let wallet: any = null;
  let stats: any = null;
  let penalties: any = null;
  let profile: any = null;

  try {
    // ✅ Tier 1: Données critiques pour l'affichage initial (header, banner)
    const [statsResult, profileResult] = await Promise.all([
      getCachedStats(token),
      fetchUserProfile(token),
    ]);

    if (statsResult) stats = statsResult;
    if (profileResult) profile = profileResult;

    // ✅ Tier 2: Données importantes pour actions (wallet, réservations urgentes)
    const [walletResult, resResult] = await Promise.allSettled([
      getCachedWallet(token),
      getCachedReservations(token, 5),
    ]);

    if (walletResult.status === "fulfilled") wallet = walletResult.value;
    if (resResult.status === "fulfilled") {
      reservations = resResult.value.data.filter((r: any) => r.statut !== "INITIEE");
    }

    // ✅ Tier 3: Données secondaires (véhicules, pénalités)
    const [vehiclesResult, penaltiesResult] = await Promise.allSettled([
      getCachedVehiclesSummary(token),
      getCachedPenalties(token),
    ]);

    if (vehiclesResult.status === "fulfilled") vehicles = vehiclesResult.value;
    if (penaltiesResult.status === "fulfilled") penalties = penaltiesResult.value;
  } catch (err) {
    console.error("Dashboard data fetch error:", err);
  }

  return (
    <OwnerDashboardView
      reservations={reservations}
      vehicles={vehicles}
      wallet={wallet}
      penalties={penalties}
      stats={stats}
      profile={profile}
    />
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default async function OwnerDashboardPage() {
  const token = cookies().get("nest_access")?.value ?? null;

  if (!token) redirect("/login");

  return (
    <div className="min-h-screen">

      {/* ÉTAPE 2 : Dashboard complet - Streaming progressif */}
      <Suspense
        fallback={
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-slate-100 rounded-2xl" />
              <div className="h-48 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        }
      >
        <FullDashboardData token={token} />
      </Suspense>
    </div>
  );
}
