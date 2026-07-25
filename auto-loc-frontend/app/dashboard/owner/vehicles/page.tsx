import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { ApiError } from "@/lib/nestjs/api-client";
import { fetchMyVehicles, type Vehicle, type PaginatedVehicles } from "@/lib/nestjs/vehicles";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { OwnerFleet } from "@/features/vehicles/owner/OwnerFleet";
import { CACHE_TAGS, getCacheKey, getOwnerCacheTags } from "@/lib/cache-config";
import { VehiclesPagination } from "@/features/vehicles/owner/VehiclesPagination";

const ITEMS_PER_PAGE = 10;

// ✅ OPTIMISATION: Cache des véhicules pour 30 secondes
const getCachedVehicles = (token: string, page: number) => unstable_cache(
  async () => fetchMyVehicles(token, { limit: ITEMS_PER_PAGE, offset: (page - 1) * ITEMS_PER_PAGE }),
  getCacheKey(CACHE_TAGS.owner_vehicles, token, page),
  { revalidate: 30, tags: getOwnerCacheTags(CACHE_TAGS.owner_vehicles, token) }
)();

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OwnerVehiclesPage({ searchParams }: PageProps) {
  const token = cookies().get("nest_access")?.value ?? null;
  if (!token) redirect("/login");

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));

  let result: PaginatedVehicles;
  try {
    result = await getCachedVehicles(token, currentPage);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login?expired=1");
    result = { data: [], total: 0, limit: ITEMS_PER_PAGE, offset: 0 };
  }

  const totalPages = Math.ceil(result.total / ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-6 p-6">
      <OwnerHeader
        title="Gestion véhicules"
        subtitle="Vue d'ensemble de votre flotte et des statuts en cours."
        showFleetStats={true}
        fleetStats={{
          total: result.total,
          pending: result.data.filter((v) => v.statut === "EN_ATTENTE_VALIDATION" || v.statut === "BROUILLON").length,
          active: result.data.filter((v) => v.statut === "VERIFIE").length,
          drafts: 0,
        }}
      />
      <OwnerFleet initialVehicles={result.data} />
      <VehiclesPagination currentPage={currentPage} totalPages={totalPages} total={result.total} />
    </div>
  );
}
