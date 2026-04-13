"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Car } from "lucide-react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
export type ReservationStatus =
  | "PAYEE" | "CONFIRMEE" | "EN_COURS"
  | "TERMINEE" | "ANNULEE" | "LITIGE"
  | "approved" | "pending";

export interface ReservationItem {
  id: string | number;
  vehicle: string;
  vehiclePhoto?: string;
  tenantName?: string;
  tenantPhone?: string;
  duration?: string;
  dateRange?: string;
  amount: string;
  status: ReservationStatus;
  meta?: string;
  href?: string;
}

/* ════════════════════════════════════════════════════════════════
   STATUS TOKENS
════════════════════════════════════════════════════════════════ */
const STATUS: Record<ReservationStatus, {
  label: string;
  dot: string;
  cls: string;
}> = {
  approved: { label: "Approuvée", dot: "bg-emerald-500", cls: "text-emerald-600 bg-emerald-500/10 border-emerald-500/10" },
  pending: { label: "En attente", dot: "bg-blue-400", cls: "text-blue-600 bg-blue-500/10 border-blue-500/10" },
  PAYEE: { label: "Payée", dot: "bg-emerald-500", cls: "text-emerald-600 bg-emerald-500/10 border-emerald-500/10" },
  CONFIRMEE: { label: "Confirmée", dot: "bg-black", cls: "text-black bg-black/5 border-black/10" },
  EN_COURS: { label: "En cours", dot: "bg-emerald-500 animate-pulse", cls: "text-emerald-600 bg-emerald-500/10 border-emerald-500/10" },
  TERMINEE: { label: "Terminée", dot: "bg-black/30", cls: "text-black/40 bg-black/5 border-black/10" },
  ANNULEE: { label: "Annulée", dot: "bg-red-400", cls: "text-red-600 bg-red-500/10 border-red-500/10" },
  LITIGE: { label: "Litige", dot: "bg-red-500 animate-pulse", cls: "text-red-700 bg-red-500/10 border-red-500/20" },
};

const PIPELINE_ORDER: ReservationStatus[] = [
  "PAYEE", "CONFIRMEE", "EN_COURS", "TERMINEE", "ANNULEE", "LITIGE",
];

/* ════════════════════════════════════════════════════════════════
   ROW
════════════════════════════════════════════════════════════════ */
function ReservationRow({ r }: { r: ReservationItem }) {
  const s = STATUS[r.status] ?? STATUS.pending;

  const inner = (
    <div className={cn(
      "group flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3.5 sm:py-4 transition-all duration-200",
      r.href && "hover:bg-black/[0.02] cursor-pointer",
    )}>

      {/* Vehicle Photo or Icon */}
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-black/5 border border-black/[0.06] shrink-0 group-hover:border-emerald-500/30 transition-colors">
        {r.vehiclePhoto ? (
          <img
            src={r.vehiclePhoto}
            alt={r.vehicle}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/[0.02]">
            <Car className="w-5 h-5 text-black/20" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
          <p className="text-[13px] sm:text-[14px] font-bold text-black truncate tracking-tight">{r.vehicle}</p>
          {r.duration && (
            <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 bg-black/5 text-black/40 rounded uppercase tracking-widest">
              {r.duration}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {r.tenantName && (
            <span className="text-[11px] sm:text-[12px] font-medium text-black/40 truncate max-w-[80px] sm:max-w-[120px]">
              {r.tenantName}
            </span>
          )}
          {r.tenantPhone && r.status === "EN_COURS" && (
            <span className="hidden xs:inline-block text-[10px] sm:text-[11px] font-bold text-black/50 bg-black/5 px-1.5 py-0.5 rounded border border-black/[0.06] tabular-nums">
              {r.tenantPhone}
            </span>
          )}
          <span className="hidden sm:block text-black/10 text-[10px]">|</span>
          <span className="text-[11px] sm:text-[12px] font-bold text-emerald-500 tabular-nums">
            {r.amount}
          </span>
        </div>
      </div>

      {/* Status & Meta */}
      <div className="flex flex-col items-end gap-1 sm:gap-1.5 shrink-0">
        <span className={cn(
          "inline-flex items-center gap-1.2 sm:gap-1.5 px-2 sm:px-2.5 py-0.8 sm:py-1 rounded-full border text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-widest",
          s.cls,
        )}>
          <span className={cn("w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full", s.dot)} />
          {s.label}
        </span>
        {r.dateRange && (
          <span className="text-[10px] font-medium text-black/20">
            {r.dateRange}
          </span>
        )}
      </div>

      {/* Arrow if clickable */}
      {r.href && (
        <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ml-1">
          <ChevronRight className="w-4 h-4 text-black/30" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );

  return r.href
    ? <Link href={r.href} className="block">{inner}</Link>
    : <div>{inner}</div>;
}

/* ════════════════════════════════════════════════════════════════
   SKELETON
════════════════════════════════════════════════════════════════ */
function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
      <div className="w-8 h-8 rounded-xl bg-black/5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/5 rounded-lg bg-black/5" />
        <div className="h-3 w-1/4 rounded-lg bg-black/5" />
      </div>
      <div className="h-6 w-20 rounded-full bg-black/5 flex-shrink-0" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PIPELINE SECTION HEADER
════════════════════════════════════════════════════════════════ */
function PipelineHeader({ status, count }: { status: ReservationStatus; count: number }) {
  const s = STATUS[status];
  return (
    <div className="flex items-center gap-2.5 px-5 py-2.5 bg-black/[0.02] border-y border-black/[0.04]">
      <div className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
      <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-black/30">{s.label}</span>
      <div className="ml-auto flex items-center gap-1">
        <span className="text-[10px] font-bold text-black/30">{count}</span>
        <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest leading-none">items</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export function RecentReservations({
  reservations = [],
  mode = "recent",
  loading = false,
  title,
  className,
}: {
  reservations?: ReservationItem[];
  mode?: "recent" | "pipeline";
  loading?: boolean;
  title?: string;
  className?: string;
}) {
  const effectiveTitle = title ?? (mode === "pipeline" ? "Réservations récentes" : "Réservations récentes");

  const groups = PIPELINE_ORDER
    .map(st => ({ st, items: reservations.filter(r => r.status === st) }))
    .filter(g => g.items.length > 0);

  return (
    <div className={cn(
      "rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-sm shadow-black/[0.02] flex flex-col",
      className
    )}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold tracking-tight text-black">
            {effectiveTitle}
          </h3>
          {!loading && reservations.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-black text-[10px] font-bold text-emerald-400">
              {reservations.length}
            </span>
          )}
        </div>
        <Link
          href="/dashboard/owner/reservations"
          className="inline-flex items-center gap-1 text-[12px] font-bold text-black/40 hover:text-black transition-colors"
        >
          Voir tout
          <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
        </Link>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="divide-y divide-black/[0.06]">

        {/* Loading */}
        {loading && Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}

        {/* Empty */}
        {!loading && reservations.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center">
              <Car className="w-4.5 h-4.5 text-black/20" strokeWidth={1.5} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/20">Aucune réservation</p>
          </div>
        )}

        {/* Recent mode — flat list */}
        {!loading && mode === "recent" && reservations.map(r => (
          <ReservationRow key={r.id} r={r} />
        ))}

        {/* Pipeline mode — grouped by status */}
        {!loading && mode === "pipeline" && groups.map(({ st, items }) => (
          <div key={st}>
            <PipelineHeader status={st} count={items.length} />
            {items.map(r => <ReservationRow key={r.id} r={r} />)}
          </div>
        ))}
      </div>
    </div>
  );
}