import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMyVehicles, type Vehicle } from "@/lib/nestjs/vehicles";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { OwnerFleet } from "@/features/vehicles/owner/OwnerFleet";

export default async function OwnerVehiclesPage() {
  const nestToken = cookies().get("nest_access")?.value ?? null;
  let token: string | null = nestToken;
  if (!token) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  }

  if (!token) redirect("/login");

  let vehicles: Vehicle[];
  try {
    vehicles = await fetchMyVehicles(token);
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
