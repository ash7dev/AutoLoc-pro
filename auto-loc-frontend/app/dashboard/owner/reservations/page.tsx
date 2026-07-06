import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { ApiError } from "@/lib/nestjs/api-client";
import { fetchOwnerReservations, type Reservation } from "@/lib/nestjs/reservations";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { OwnerReservationsList } from "@/features/reservations/components/owner-reservations-list";
import { CACHE_TAGS, getCacheKey, getOwnerCacheTags } from "@/lib/cache-config";

// ✅ OPTIMISATION: Cache des réservations owner pour 15 secondes
const getCachedReservations = (token: string) => unstable_cache(
  async () => fetchOwnerReservations(token, { limit: 20 }),
  getCacheKey(CACHE_TAGS.owner_reservations, token, 20),
  { revalidate: 15, tags: getOwnerCacheTags(CACHE_TAGS.owner_reservations, token) }
)();

export default async function OwnerReservationsPage() {
  const token = cookies().get("nest_access")?.value ?? null;
  if (!token) redirect("/login");

  let reservations: Reservation[] = [];
  let total = 0;
  try {
    const result = await getCachedReservations(token);
    reservations = (result?.data ?? []).filter((r) => !["INITIEE", "EN_ATTENTE_PAIEMENT"].includes(r.statut));
    total = result?.total ?? reservations.length;
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) redirect("/login?expired=1");
      // On retire la redirection vers /become-owner sur 403 car elle cause une boucle.
      // Le OwnerLayout se charge désormais de rediriger vers /complete-profile si besoin.
      console.error("[owner/reservations] API error", err.status, err.message);
    }
 else {
      console.error("[owner/reservations] Unexpected error", err);
    }
    reservations = [];
    total = 0;
  }

  const activeCount = reservations.filter(
    (r) => ["PAYEE", "CONFIRMEE", "EN_COURS"].includes(r.statut),
  ).length;

  return (
    <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
      <OwnerHeader
        title="Gestion réservations"
        subtitle={`${total} réservation${total !== 1 ? "s" : ""} · ${activeCount} active${activeCount !== 1 ? "s" : ""}`}
      />
      <OwnerReservationsList initialReservations={reservations} />
    </div>
  );
}
