import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchOwnerReservations, type Reservation } from "@/lib/nestjs/reservations";
import { fetchMyVehicles, type Vehicle } from "@/lib/nestjs/vehicles";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { RevenueAnalyticsCard } from "@/features/analytics/components/revenue-analytics-card";
import { TopKPIsRow } from "@/features/analytics/components/top-kpis-row";
import { VehiclePerformanceTable, type VehiclePerformance } from "@/features/analytics/components/vehicle-performance-table";
import { OccupancyHeatmap } from "@/features/analytics/components/occupancy-heatmap";
import { BookingFunnel } from "@/features/analytics/components/booking-funnel";
import { CACHE_TAGS, getCacheKey, getOwnerCacheTags } from "@/lib/cache-config";

// ✅ Cache des réservations
const getCachedReservations = (token: string) => unstable_cache(
  async () => fetchOwnerReservations(token),
  getCacheKey(CACHE_TAGS.owner_reservations, token),
  { revalidate: 15, tags: getOwnerCacheTags(CACHE_TAGS.owner_reservations, token) }
)();

// ✅ Cache des véhicules
const getCachedVehicles = (token: string) => unstable_cache(
  async () => fetchMyVehicles(token),
  getCacheKey(CACHE_TAGS.owner_vehicles, token),
  { revalidate: 30, tags: getOwnerCacheTags(CACHE_TAGS.owner_vehicles, token) }
)();

/**
 * Calculate analytics from reservations and vehicles
 * ⚡ PERFORMANCE: This function does heavy computations, results should be cached
 */
function calculateAnalytics(reservations: Reservation[], vehicles: Vehicle[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter current month reservations
  const currentMonthReservations = reservations.filter((r) => {
    const startDate = new Date(r.dateDebut);
    return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
  });

  // Filter previous month reservations
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthReservations = reservations.filter((r) => {
    const startDate = new Date(r.dateDebut);
    return startDate.getMonth() === prevMonth && startDate.getFullYear() === prevYear;
  });

  // Revenue calculations
  const totalRevenue = currentMonthReservations
    .filter((r) => ["TERMINEE", "EN_COURS", "CONFIRMEE", "PAYEE"].includes(r.statut))
    .reduce((sum, r) => sum + parseFloat(r.montantProprietaire || "0"), 0);

  const previousMonthRevenue = previousMonthReservations
    .filter((r) => ["TERMINEE", "EN_COURS", "CONFIRMEE", "PAYEE"].includes(r.statut))
    .reduce((sum, r) => sum + parseFloat(r.montantProprietaire || "0"), 0);

  const totalBookings = currentMonthReservations.filter((r) =>
    ["TERMINEE", "EN_COURS", "CONFIRMEE", "PAYEE"].includes(r.statut)
  ).length;

  const averagePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysPassed = now.getDate();
  const averagePerDay = daysPassed > 0 ? totalRevenue / daysPassed : 0;

  const daysRemaining = daysInMonth - daysPassed;
  const monthlyProjection = totalRevenue + (averagePerDay * daysRemaining);

  // Occupancy calculations
  const totalVehicles = vehicles.filter((v) => v.statut === "VERIFIE").length;
  const totalAvailableDays = totalVehicles * daysInMonth;

  const occupiedDays = currentMonthReservations
    .filter((r) => ["TERMINEE", "EN_COURS", "CONFIRMEE", "PAYEE"].includes(r.statut))
    .reduce((sum, r) => sum + (r.nbJours || 0), 0);

  const occupancyRate = totalAvailableDays > 0 ? (occupiedDays / totalAvailableDays) * 100 : 0;

  const revPAD = totalAvailableDays > 0 ? totalRevenue / totalAvailableDays : 0;

  // Vehicle performance
  const vehiclePerformance: VehiclePerformance[] = vehicles
    .filter((v) => v.statut === "VERIFIE")
    .map((vehicle) => {
      const vehicleReservations = currentMonthReservations.filter(
        (r) => r.vehicule?.id === vehicle.id && ["TERMINEE", "EN_COURS", "CONFIRMEE", "PAYEE"].includes(r.statut)
      );

      const revenue = vehicleReservations.reduce(
        (sum, r) => sum + parseFloat(r.montantProprietaire || "0"),
        0
      );

      const bookingsCount = vehicleReservations.length;

      const vehicleOccupiedDays = vehicleReservations.reduce((sum, r) => sum + (r.nbJours || 0), 0);
      const vehicleOccupancyRate = daysInMonth > 0 ? (vehicleOccupiedDays / daysInMonth) * 100 : 0;

      // Mock rating - you'll need real rating data
      const averageRating = 0; // TODO: Integrate real ratings

      const vehicleRevPAD = daysInMonth > 0 ? revenue / daysInMonth : 0;

      return {
        id: vehicle.id,
        name: `${vehicle.marque} ${vehicle.modele}`,
        photoUrl: vehicle.photos?.find(p => p.estPrincipale)?.url || vehicle.photos?.[0]?.url,
        revenue,
        bookingsCount,
        occupancyRate: vehicleOccupancyRate,
        averageRating,
        revPAD: vehicleRevPAD,
      };
    });

  // Occupancy heatmap data
  const occupancyDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().split("T")[0];

    const dayReservations = currentMonthReservations.filter((r) => {
      const start = r.dateDebut.split("T")[0];
      const end = r.dateFin.split("T")[0];
      return dateStr >= start && dateStr <= end && ["TERMINEE", "EN_COURS", "CONFIRMEE", "PAYEE"].includes(r.statut);
    });

    return {
      date: dateStr,
      isOccupied: dayReservations.length > 0,
      bookingsCount: dayReservations.length,
    };
  });

  // Booking funnel
  const allReservations = reservations;
  const totalRequests = allReservations.length;
  const accepted = allReservations.filter((r) => !["INITIEE"].includes(r.statut)).length;
  const paid = allReservations.filter((r) => ["PAYEE", "CONFIRMEE", "EN_COURS", "TERMINEE"].includes(r.statut)).length;
  const confirmed = allReservations.filter((r) => ["CONFIRMEE", "EN_COURS", "TERMINEE"].includes(r.statut)).length;
  const completed = allReservations.filter((r) => r.statut === "TERMINEE").length;

  return {
    revenue: {
      totalRevenue,
      averagePerBooking,
      averagePerDay,
      monthlyProjection,
      previousMonthRevenue,
    },
    kpis: {
      occupancyRate,
      totalBookings,
      revPAD,
    },
    vehiclePerformance,
    occupancyDays,
    funnel: {
      totalRequests,
      accepted,
      paid,
      confirmed,
      completed,
    },
  };
}

// ✅ OPTIMISATION: Cache du calcul des analytics pour 60 secondes
// Évite de recalculer à chaque refresh si les données n'ont pas changé
const getCachedAnalytics = (token: string, reservations: Reservation[], vehicles: Vehicle[]) => {
  const cacheKey = `analytics-${token}-${reservations.length}-${vehicles.length}`;
  return unstable_cache(
    async () => calculateAnalytics(reservations, vehicles),
    [cacheKey],
    {
      revalidate: 60, // Cache pendant 60 secondes
      tags: [`analytics-${token}`]
    }
  )();
};

export default async function OwnerAnalyticsPage() {
  const nestToken = cookies().get("nest_access")?.value ?? null;
  let token: string | null = nestToken;

  if (!token) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  }

  if (!token) redirect("/login");

  let reservations: Reservation[] = [];
  let vehicles: Vehicle[] = [];

  try {
    const [reservationsResult, vehiclesResult] = await Promise.all([
      getCachedReservations(token),
      getCachedVehicles(token),
    ]);

    reservations = reservationsResult?.data ?? [];
    vehicles = vehiclesResult ?? [];
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login?expired=1");
    }
    console.error("[owner/analytics] Error fetching data", err);
  }

  // ⚡ OPTIMISATION: Utilise le cache pour éviter de recalculer les analytics
  const analytics = await getCachedAnalytics(token, reservations, vehicles);

  return (
    <div className="hidden lg:flex flex-col gap-6 p-6">
      <OwnerHeader
        title="Analytics"
        subtitle="Analyses et statistiques détaillées de votre activité"
      />

      {/* Revenue card */}
      <RevenueAnalyticsCard {...analytics.revenue} />

      {/* Top KPIs */}
      <TopKPIsRow {...analytics.kpis} />

      {/* Vehicle Performance Table */}
      <VehiclePerformanceTable vehicles={analytics.vehiclePerformance} />

      {/* Bottom row: Heatmap + Funnel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <OccupancyHeatmap data={analytics.occupancyDays} />
        <BookingFunnel {...analytics.funnel} />
      </div>
    </div>
  );
}
