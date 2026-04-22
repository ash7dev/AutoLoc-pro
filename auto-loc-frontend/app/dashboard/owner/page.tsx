import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  fetchOwnerReservations,
  fetchOwnerStats,
  type Reservation,
  type OwnerStats,
} from "@/lib/nestjs/reservations";
import { fetchMe } from "@/lib/nestjs/auth";
import { fetchUserReviews, type ReviewsResponse } from "@/lib/nestjs/reviews";
import { fetchMyVehicles, type Vehicle } from "@/lib/nestjs/vehicles";
import { fetchWallet, type WalletData } from "@/lib/nestjs/wallet";
import { OwnerDashboardView } from "@/features/dashboard/components/owner-dashboard-view";

export default async function OwnerDashboardPage() {
  const nestToken = cookies().get("nest_access")?.value ?? null;
  let token: string | null = nestToken;
  if (!token) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  }
  if (!token) redirect("/login");

  // Parallel fetches
  let reservations: Reservation[] = [];
  let vehicles: Vehicle[] = [];
  let wallet: WalletData | null = null;
  let stats: OwnerStats | null = null;
  let reviews: ReviewsResponse | null = null;

  try {
    // Étape 1 : Récupérer le profil d'abord car l'ID est nécessaire pour les avis
    const profile = await fetchMe(token).catch(() => null);

    // Étape 2 : Lancer TOUT le reste en parallèle
    const [resResult, vehiclesResult, walletResult, statsResult, reviewsResult] =
      await Promise.allSettled([
        fetchOwnerReservations(token),
        fetchMyVehicles(token),
        fetchWallet(token),
        fetchOwnerStats(token),
        profile ? fetchUserReviews(token, profile.id) : Promise.resolve(null),
      ]);

    if (resResult.status === "fulfilled") reservations = resResult.value.data;
    if (vehiclesResult.status === "fulfilled") vehicles = vehiclesResult.value;
    if (walletResult.status === "fulfilled") wallet = walletResult.value;
    if (statsResult.status === "fulfilled") stats = statsResult.value;
    if (reviewsResult.status === "fulfilled") reviews = reviewsResult.value;

  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login?expired=1");
  }

  return (
    <OwnerDashboardView
      reservations={reservations}
      vehicles={vehicles}
      wallet={wallet}
      stats={stats}
      reviews={reviews}
    />
  );
}
