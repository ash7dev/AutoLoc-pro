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
    const [resResult, vehiclesResult, walletResult, statsResult, profileResult] =
      await Promise.allSettled([
        fetchOwnerReservations(token),
        fetchMyVehicles(token),
        fetchWallet(token),
        fetchOwnerStats(token),
        fetchMe(token),
      ]);

    if (resResult.status === "fulfilled") reservations = resResult.value.data;
    if (vehiclesResult.status === "fulfilled") vehicles = vehiclesResult.value;
    if (walletResult.status === "fulfilled") wallet = walletResult.value;
    if (statsResult.status === "fulfilled") stats = statsResult.value;

    // Fetch reviews if profile is available
    if (profileResult.status === "fulfilled") {
      try {
        reviews = await fetchUserReviews(token, profileResult.value.id);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    }
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
