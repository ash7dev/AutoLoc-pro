"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Car, CalendarDays } from "lucide-react";
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
  approved: { label: "Approuvée", dot: "bg-emerald-500", cls: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  pending: { label: "En attente", dot: "bg-blue-400", cls: "text-blue-600 bg-blue-50 border-blue-100" },
  PAYEE: { label: "Payée", dot: "bg-emerald-500", cls: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  CONFIRMEE: { label: "Confirmée", dot: "bg-slate-800", cls: "text-slate-700 bg-slate-50 border-slate-200" },
  EN_COURS: { label: "En cours", dot: "bg-emerald-500 animate-pulse", cls: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  TERMINEE: { label: "Terminée", dot: "bg-slate-300", cls: "text-slate-500 bg-slate-50 border-slate-100" },
  ANNULEE: { label: "Annulée", dot: "bg-red-400", cls: "text-red-600 bg-red-50 border-red-100" },
  LITIGE: { label: "Litige", dot: "bg-orange-500 animate-pulse", cls: "text-orange-700 bg-orange-50 border-orange-100" },
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
      "group flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 transition-all duration-200",
      r.href && "hover:bg-slate-50/60 cursor-pointer",
    )}>

      {/* Vehicle Photo or Icon */}
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 group-hover:border-emerald-200 transition-colors shadow-sm">
        {r.vehiclePhoto ? (
          <img
            src={r.vehiclePhoto}
            alt={r.vehicle}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
          <p className="text-[13px] sm:text-[14px] font-bold text-slate-800 truncate tracking-tight">{r.vehicle}</p>
          {r.duration && (
            <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-md uppercase tracking-widest">
              {r.duration}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {r.tenantName && (
            <span className="text-[11px] sm:text-[12px] font-medium text-slate-500 truncate max-w-[80px] sm:max-w-[120px]">
              {r.tenantName}
            </span>
          )}
          {r.tenantPhone && r.status === "EN_COURS" && (
            <span className="hidden xs:inline-block text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 tabular-nums">
              {r.tenantPhone}
            </span>
          )}
          <span className="hidden sm:block text-slate-200 text-[10px]">|</span>
          <span className="text-[11px] sm:text-[12px] font-bold text-emerald-600 tabular-nums">
            {r.amount}
          </span>
        </div>
      </div>

      {/* Status & Meta */}
      <div className="flex flex-col items-end gap-1 sm:gap-1.5 shrink-0">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider",
          s.cls,
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
          {s.label}
        </span>
        {r.dateRange && (
          <span className="text-[10px] font-medium text-slate-400">
            {r.dateRange}
          </span>
        )}
      </div>

      {/* Arrow if clickable */}
      {r.href && (
        <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:border-emerald-200 group-hover:bg-emerald-50 ml-1 shadow-sm">
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" strokeWidth={2.5} />
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
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/5 rounded-lg bg-slate-100" />
        <div className="h-3 w-1/4 rounded-lg bg-slate-100" />
      </div>
      <div className="h-6 w-20 rounded-lg bg-slate-100 flex-shrink-0" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PIPELINE SECTION HEADER
════════════════════════════════════════════════════════════════ */
function PipelineHeader({ status, count }: { status: ReservationStatus; count: number }) {
  const s = STATUS[status];
  return (
    <div className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-50/50 border-y border-slate-100/80">
      <div className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
      <span className="text-[9.5px] font-black uppercase tracking-[0.18em] text-slate-500">{s.label}</span>
      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-slate-800 tabular-nums bg-slate-100 px-1.5 py-0.5 rounded-md">{count}</span>
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
  const effectiveTitle = title ?? "Réservations récentes";

  const groups = PIPELINE_ORDER
    .map(st => ({ st, items: reservations.filter(r => r.status === st) }))
    .filter(g => g.items.length > 0);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl flex flex-col",
      "border border-l-[3px] border-white/70 border-l-amber-500",
      "bg-white/70 backdrop-blur-xl",
      "shadow-sm",
      className,
    )}>

      {/* Decorative orb */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 opacity-[0.04] pointer-events-none blur-3xl" />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-slate-100/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center shadow-sm">
            <CalendarDays className="w-4 h-4 text-amber-600" strokeWidth={1.75} />
          </div>
          <h3 className="text-[15px] font-black tracking-tight text-slate-800">
            {effectiveTitle}
          </h3>
          {!loading && reservations.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-lg bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-700 tabular-nums">
              {reservations.length}
            </span>
          )}
        </div>
        <Link
          href="/dashboard/owner/reservations"
          className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-400 hover:text-emerald-600 transition-colors"
        >
          Voir tout
          <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
        </Link>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="relative z-10 divide-y divide-slate-100/80">

        {/* Loading */}
        {loading && Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}

        {/* Empty */}
        {!loading && reservations.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
              <Car className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aucune réservation</p>
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