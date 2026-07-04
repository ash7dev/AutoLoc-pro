import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  fetchOwnerReservations,
  fetchOwnerStats,
} from "@/lib/nestjs/reservations";
import { fetchMyVehicles } from "@/lib/nestjs/vehicles";
import { fetchWallet } from "@/lib/nestjs/wallet";
import { OwnerDashboardView } from "@/features/dashboard/components/owner-dashboard-view";
import DashboardLoading from "./loading";

// ── Components ────────────────────────────────────────────────────────────────

async function DashboardDataFetcher({ token }: { token: string }) {
  // We fetch all data here but we can also split this into multiple Suspense boundaries
  // if some requests are significantly slower than others.
  
  let reservations: any[] = [];
  let vehicles: any[] = [];
  let wallet: any = null;
  let stats: any = null;

  try {
    // OPTIMISATION MOBILE: Réduire la limite à 15 réservations pour le dashboard
    // Les réservations complètes sont disponibles sur /dashboard/owner/reservations
    const [resResult, vehiclesResult, walletResult, statsResult] =
      await Promise.allSettled([
        fetchOwnerReservations(token, { limit: 15 }), // Réduit de 200 → 15 pour performance mobile
        fetchMyVehicles(token),
        fetchWallet(token),
        fetchOwnerStats(token),
      ]);

    if (resResult.status === "fulfilled") {
      reservations = resResult.value.data.filter((r: any) => r.statut !== "INITIEE");
    }
    if (vehiclesResult.status === "fulfilled") vehicles = vehiclesResult.value;
    if (walletResult.status === "fulfilled") wallet = walletResult.value;
    if (statsResult.status === "fulfilled") stats = statsResult.value;

  } catch (err) {
    // Error handling
  }

  return (
    <OwnerDashboardView
      reservations={reservations}
      vehicles={vehicles}
      wallet={wallet}
      stats={stats}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
    <Suspense fallback={<DashboardLoading />}>
      <DashboardDataFetcher token={token} />
    </Suspense>
  );
}
