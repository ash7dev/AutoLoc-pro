"use client";

import Link from "next/link";
import { ArrowRight, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconBadge } from "@/components/ui/icon-badge";
import { cn } from "@/lib/utils";

export interface ReservationItem {
  id: string | number;
  vehicle: string;
  amount: string;
  status:
  | "approved" | "pending"
  | "PAYEE" | "CONFIRMEE" | "EN_COURS"
  | "TERMINEE" | "ANNULEE" | "LITIGE";
  image?: string;
  meta?: string;
  href?: string;
}

const statusConfig: Record<
  ReservationItem["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; dot: string }
> = {
  approved: { label: "Approuvée", variant: "secondary", dot: "bg-emerald-500" },
  pending: { label: "En attente", variant: "outline", dot: "bg-amber-400" },
  PAYEE: { label: "Payée", variant: "outline", dot: "bg-amber-400" },
  CONFIRMEE: { label: "Confirmée", variant: "secondary", dot: "bg-emerald-500" },
  EN_COURS: { label: "En cours", variant: "secondary", dot: "bg-blue-500 animate-pulse" },
  TERMINEE: { label: "Terminée", variant: "secondary", dot: "bg-emerald-500" },
  ANNULEE: { label: "Annulée", variant: "outline", dot: "bg-muted-foreground" },
  LITIGE: { label: "Litige", variant: "destructive", dot: "bg-destructive animate-pulse" },
};

const pipelineOrder: ReservationItem["status"][] = [
  "PAYEE", "CONFIRMEE", "EN_COURS", "TERMINEE", "ANNULEE", "LITIGE",
];

export function RecentReservations({
  reservations = [],
  mode = "recent",
  loading = false,
  title,
}: {
  reservations?: ReservationItem[];
  mode?: "recent" | "pipeline";
  loading?: boolean;
  title?: string;
}) {
  const effectiveTitle =
    title ?? (mode === "pipeline" ? "Pipeline réservations" : "Réservations reçues");

  const groups =
    mode === "pipeline"
      ? pipelineOrder
        .map((st) => ({ st, items: reservations.filter((r) => r.status === st) }))
        .filter((g) => g.items.length > 0)
      : [];

  const ReservationRow = ({ reservation }: { reservation: ReservationItem }) => {
    const cfg = statusConfig[reservation.status] ?? statusConfig.pending;
    return (
      <div className="group flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 rounded-lg border border-[hsl(var(--border))] p-3 sm:p-4 transition-all duration-200 hover:shadow-sm hover:border-foreground/20">
        {/* Icon */}
        <IconBadge icon={Car} size="lg" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{reservation.vehicle}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-muted-foreground">{reservation.amount}</span>
            {reservation.meta && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-xs text-muted-foreground">{reservation.meta}</span>
              </>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={cn("h-2 w-2 rounded-full flex-shrink-0", cfg.dot)} />
          <Badge variant={cfg.variant} className="text-xs font-medium">
            {cfg.label}
          </Badge>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[hsl(var(--border))]">
        <h3 className="text-lg sm:text-xl font-bold">{effectiveTitle}</h3>
        <Link
          href="/dashboard/owner/reservations"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          Voir tout
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border border-[hsl(var(--border))] p-4 animate-pulse"
            >
              <div className="h-10 w-10 rounded-lg bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
              <div className="h-5 w-20 rounded-full bg-muted" />
            </div>
          ))
        ) : mode === "pipeline" ? (
          groups.map((group) => (
            <div key={group.st} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {statusConfig[group.st].label}
                </p>
                <span className="text-xs text-muted-foreground">{group.items.length}</span>
              </div>
              {group.items.map((r) =>
                r.href ? (
                  <Link key={r.id} href={r.href} className="block">
                    <ReservationRow reservation={r} />
                  </Link>
                ) : (
                  <ReservationRow key={r.id} reservation={r} />
                )
              )}
            </div>
          ))
        ) : (
          reservations.map((r) =>
            r.href ? (
              <Link key={r.id} href={r.href} className="block">
                <ReservationRow reservation={r} />
              </Link>
            ) : (
              <ReservationRow key={r.id} reservation={r} />
            )
          )
        )}
      </div>
    </div>
  );
}