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

  const validReservations = reservations.filter((r) => {
    const start = new Date(r.dateDebut);
    const end = new Date(r.dateFin);
    return !isNaN(start.getTime()) && !isNaN(end.getTime());
  });

  // Filter current month reservations
  const currentMonthReservations = validReservations.filter((r) => {
    const startDate = new Date(r.dateDebut);
    return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
  });

  // Filter previous month reservations
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthReservations = validReservations.filter((r) => {
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

      const photos = Array.isArray(vehicle.photos) ? vehicle.photos : [];

      return {
        id: vehicle.id,
        name: `${vehicle.marque} ${vehicle.modele}`,
        photoUrl: photos.find(p => p.estPrincipale)?.url || photos[0]?.url,
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
      const start = r.dateDebut?.split("T")[0];
      const end = r.dateFin?.split("T")[0];
      if (!start || !end) return false;
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
      tags: getOwnerCacheTags(CACHE_TAGS.owner_analytics, token)
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
    vehicles = vehiclesResult?.data ?? [];
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

      {/* Vehicle Performance Table with Legend */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <VehiclePerformanceTable vehicles={analytics.vehiclePerformance} />

        {/* Metrics Legend */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-950/[0.06] bg-gradient-to-br from-white via-slate-50/30 to-white shadow-xl shadow-slate-950/[0.04]">
          {/* Top accent border */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          {/* Gradient mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.02),transparent_50%)]" />

          <div className="relative p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
                <span className="text-xs font-black uppercase tracking-wide text-blue-700">Guide des métriques</span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Comprendre chaque indicateur
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-900/10 to-transparent" />

            {/* Metrics */}
            <div className="space-y-5">
              {/* Revenue */}
              <div className="group space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                    <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Revenue</h4>
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  Revenus totaux générés par le véhicule ce mois
                </p>
              </div>

              {/* Locations */}
              <div className="group space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Locations</h4>
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  Nombre total de réservations terminées
                </p>
              </div>

              {/* Occupation */}
              <div className="group space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                    <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Occupation</h4>
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  % de jours loués sur total de jours disponibles
                </p>
                <div className="rounded-xl bg-slate-50/80 border border-slate-200/50 p-3">
                  <p className="text-[11px] font-mono font-semibold text-slate-700">
                    (Jours loués ÷ Jours mois) × 100
                  </p>
                </div>
              </div>

              {/* Note */}
              <div className="group space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                    <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Note</h4>
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  Note moyenne des locataires (sur 5 étoiles)
                </p>
              </div>

              {/* RevPAD */}
              <div className="group space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
                    <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">RevPAD</h4>
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  Revenue Per Available Day : revenu moyen par jour disponible
                </p>
                <div className="rounded-xl bg-slate-50/80 border border-slate-200/50 p-3">
                  <p className="text-[11px] font-mono font-semibold text-slate-700">
                    Revenue total ÷ Jours dispo.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom tip */}
            <div className="pt-4 border-t border-slate-950/[0.06]">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-200/50 p-4">
                <p className="text-[11px] font-bold text-blue-900 leading-relaxed">
                  💡 <span className="font-black">Astuce :</span> Cliquez sur les en-têtes pour trier le tableau
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Heatmap + Funnel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <OccupancyHeatmap data={analytics.occupancyDays} />
        <BookingFunnel {...analytics.funnel} />
      </div>
    </div>
  );
}
