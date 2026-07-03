import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchOwnerReservations, type Reservation } from "@/lib/nestjs/reservations";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { OwnerReservationsList } from "@/features/reservations/components/owner-reservations-list";

// ✅ OPTIMISATION: Cache des réservations owner pour 15 secondes
const getCachedReservations = unstable_cache(
  async (token: string) => fetchOwnerReservations(token),
  ['owner-reservations'],
  { revalidate: 15, tags: ['owner-reservations'] }
);

export default async function OwnerReservationsPage() {
  const nestToken = cookies().get("nest_access")?.value ?? null;
  let token: string | null = nestToken;
  if (!token) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  }
  if (!token) redirect("/login");

  let reservations: Reservation[] = [];
  try {
    const result = await getCachedReservations(token);
    reservations = (result?.data ?? []).filter((r) => !["INITIEE", "EN_ATTENTE_PAIEMENT"].includes(r.statut));
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
  }

  const activeCount = reservations.filter(
    (r) => ["PAYEE", "CONFIRMEE", "EN_COURS"].includes(r.statut),
  ).length;

  return (
    <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
      <OwnerHeader
        title="Gestion réservations"
        subtitle={`${reservations.length} réservation${reservations.length !== 1 ? "s" : ""} · ${activeCount} active${activeCount !== 1 ? "s" : ""}`}
      />
      <OwnerReservationsList initialReservations={reservations} />
    </div>
  );
}
