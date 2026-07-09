import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { ApiError } from "@/lib/nestjs/api-client";
import { fetchMyVehicles, type Vehicle } from "@/lib/nestjs/vehicles";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { OwnerFleet } from "@/features/vehicles/owner/OwnerFleet";
import { CACHE_TAGS, getCacheKey, getOwnerCacheTags } from "@/lib/cache-config";

// ✅ OPTIMISATION: Cache des véhicules pour 30 secondes
const getCachedVehicles = (token: string) => unstable_cache(
  async () => fetchMyVehicles(token, { limit: 10 }),
  getCacheKey(CACHE_TAGS.owner_vehicles, token, 10),
  { revalidate: 30, tags: getOwnerCacheTags(CACHE_TAGS.owner_vehicles, token) }
)();

export default async function OwnerVehiclesPage() {
  const token = cookies().get("nest_access")?.value ?? null;
  if (!token) redirect("/login");

  let vehicles: Vehicle[];
  try {
    vehicles = await getCachedVehicles(token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login?expired=1");
    vehicles = [];
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <OwnerHeader
        title="Gestion véhicules"
        subtitle="Vue d'ensemble de votre flotte et des statuts en cours."
        showFleetStats={true}
        fleetStats={{
          total: vehicles.length,
          pending: vehicles.filter((v) => v.statut === "EN_ATTENTE_VALIDATION" || v.statut === "BROUILLON").length,
          active: vehicles.filter((v) => v.statut === "VERIFIE").length,
          drafts: 0,
        }}
      />
      <OwnerFleet initialVehicles={vehicles} />
    </div>
  );
}
