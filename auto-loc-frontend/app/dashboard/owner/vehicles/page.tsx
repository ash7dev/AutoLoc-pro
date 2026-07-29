import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/nestjs/api-client";
import { fetchMyVehicles, fetchMyVehiclesSummary, type Vehicle, type PaginatedVehicles } from "@/lib/nestjs/vehicles";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { OwnerFleet } from "@/features/vehicles/owner/OwnerFleet";
import { VehiclesPagination } from "@/features/vehicles/owner/VehiclesPagination";

// ✅ Force dynamic rendering — prevents Next.js from caching stale
// search-param variants of this page (the root cause of pagination bugs).
export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OwnerVehiclesPage({ searchParams }: PageProps) {
  const token = cookies().get("nest_access")?.value ?? null;
  if (!token) redirect("/login");

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));

  let result: PaginatedVehicles;
  let allVehicles: Awaited<ReturnType<typeof fetchMyVehiclesSummary>> = [];

  try {
    // Fetch paginated vehicles for display
    result = await fetchMyVehicles(token, { limit: ITEMS_PER_PAGE, offset: (currentPage - 1) * ITEMS_PER_PAGE });
    // Fetch all vehicles summary for accurate statistics
    allVehicles = await fetchMyVehiclesSummary(token);
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
          pending: allVehicles.filter((v) => v.statut === "EN_ATTENTE_VALIDATION" || v.statut === "BROUILLON").length,
          active: allVehicles.filter((v) => v.statut === "VERIFIE").length,
          drafts: 0,
        }}
        showShareStoryBtn={true}
        vehicles={result.data}
      />
      <OwnerFleet initialVehicles={result.data} />
      <VehiclesPagination currentPage={currentPage} totalPages={totalPages} total={result.total} />
    </div>
  );
}
