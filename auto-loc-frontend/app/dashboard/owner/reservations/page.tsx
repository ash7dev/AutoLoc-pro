import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchOwnerReservations, type Reservation } from "@/lib/nestjs/reservations";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { OwnerReservationsList } from "@/features/reservations/components/owner-reservations-list";

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
    const result = await fetchOwnerReservations(token);
    reservations = result?.data ?? [];
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login?expired=1");
    reservations = [];
  }

  const activeCount = reservations.filter(
    (r) => ["PAYEE", "CONFIRMEE", "EN_COURS"].includes(r.statut),
  ).length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <OwnerHeader
        title="Gestion réservations"
        subtitle={`${reservations.length} réservation${reservations.length !== 1 ? "s" : ""} · ${activeCount} active${activeCount !== 1 ? "s" : ""}`}
      />
      <OwnerReservationsList initialReservations={reservations} />
    </div>
  );
}
