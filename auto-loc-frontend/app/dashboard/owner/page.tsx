import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  fetchOwnerReservations,
  fetchOwnerStats,
} from "@/lib/nestjs/reservations";
import { fetchMe } from "@/lib/nestjs/auth";
import { fetchUserReviews } from "@/lib/nestjs/reviews";
import { fetchMyVehicles } from "@/lib/nestjs/vehicles";
import { fetchWallet, fetchPenalties } from "@/lib/nestjs/wallet";
import { OwnerDashboardView } from "@/features/dashboard/components/owner-dashboard-view";
import { CACHE_TAGS, CACHE_DURATIONS, getCacheKey } from "@/lib/cache-config";



// ── Fetchers avec cache optimisé ──────────────────────────────────────────────

async function getCachedStats(token: string) {
  return unstable_cache(
    () => fetchOwnerStats(token),
    getCacheKey(CACHE_TAGS.owner_stats, token),
    {
      revalidate: CACHE_DURATIONS.standard,
      tags: [CACHE_TAGS.owner_stats],
    }
  )();
}

async function getCachedReservations(token: string, limit: number) {
  return unstable_cache(
    () => fetchOwnerReservations(token, { limit }),
    getCacheKey(CACHE_TAGS.owner_reservations, token, limit),
    {
      revalidate: CACHE_DURATIONS.critical,
      tags: [CACHE_TAGS.owner_reservations],
    }
  )();
}

async function getCachedVehicles(token: string) {
  return unstable_cache(
    () => fetchMyVehicles(token),
    getCacheKey(CACHE_TAGS.owner_vehicles, token),
    {
      revalidate: CACHE_DURATIONS.standard,
      tags: [CACHE_TAGS.owner_vehicles],
    }
  )();
}

async function getCachedWallet(token: string) {
  return unstable_cache(
    () => fetchWallet(token),
    getCacheKey(CACHE_TAGS.owner_wallet, token),
    {
      revalidate: CACHE_DURATIONS.critical,
      tags: [CACHE_TAGS.owner_wallet],
    }
  )();
}



// ── Fetcher principal avec données complètes ───────────────────────────────────

async function FullDashboardData({ token }: { token: string }) {
  let reservations: any[] = [];
  let vehicles: any[] = [];
  let wallet: any = null;
  let stats: any = null;
  let reviews: any = null;
  let penalties: any = null;

  try {
    // Batch 1 : Données critiques (parallèle avec cache)
    const [profileResult, statsResult, walletResult, penaltiesResult] = await Promise.allSettled([
      fetchMe(token),
      getCachedStats(token),
      getCachedWallet(token),
      fetchPenalties(token), // Fetch pénalités pour afficher dans wallet snapshot
    ]);

    const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
    if (statsResult.status === "fulfilled") stats = statsResult.value;
    if (walletResult.status === "fulfilled") wallet = walletResult.value;
    if (penaltiesResult.status === "fulfilled") penalties = penaltiesResult.value;

    // Batch 2 : Données secondaires (après avoir le profil)
    const [resResult, vehiclesResult, reviewsResult] = await Promise.allSettled([
      getCachedReservations(token, 10), // Réduit à 10 pour mobile
      getCachedVehicles(token),
      profile ? fetchUserReviews(profile.id, token) : Promise.resolve(null),
    ]);

    if (resResult.status === "fulfilled") {
      reservations = resResult.value.data.filter((r: any) => r.statut !== "INITIEE");
    }
    if (vehiclesResult.status === "fulfilled") vehicles = vehiclesResult.value;
    if (reviewsResult.status === "fulfilled") reviews = reviewsResult.value;
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
      reviews={reviews}
    />
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default async function OwnerDashboardPage() {
  const nestToken = cookies().get("nest_access")?.value ?? null;
  let token: string | null = nestToken;

  if (!token) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  }

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
