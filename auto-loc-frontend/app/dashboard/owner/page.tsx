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



// ── Fetcher principal avec données complètes ───────────────────────────────────

async function FullDashboardData({ token }: { token: string }) {
  let reservations: any[] = [];
  let vehicles: any[] = [];
  let wallet: any = null;
  let stats: any = null;
  let penalties: any = null;
  let profile: any = null;

  try {
    const [statsResult, walletResult, penaltiesResult, resResult, vehiclesResult, profileResult] = await Promise.allSettled([
      getCachedStats(token),
      getCachedWallet(token),
      getCachedPenalties(token), // ✅ Pénalités en cache
      getCachedReservations(token, 5), // ✅ Réduit à 5 (on affiche que 3)
      getCachedVehiclesSummary(token), // ✅ Résumé léger au lieu de tout charger
      fetchUserProfile(token), // ✅ Profil pour le banner de complétion
    ]);

    if (statsResult.status === "fulfilled") stats = statsResult.value;
    if (walletResult.status === "fulfilled") wallet = walletResult.value;
    if (penaltiesResult.status === "fulfilled") penalties = penaltiesResult.value;
    if (profileResult.status === "fulfilled") profile = profileResult.value;

    if (resResult.status === "fulfilled") {
      reservations = resResult.value.data.filter((r: any) => r.statut !== "INITIEE");
    }
    if (vehiclesResult.status === "fulfilled") vehicles = vehiclesResult.value;
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
