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
  approved: { label: "Approuvée", dot: "bg-emerald-500", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  pending: { label: "En attente", dot: "bg-amber-400", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  PAYEE: { label: "Payée", dot: "bg-blue-500", cls: "text-blue-700 bg-blue-50 border-blue-200" },
  CONFIRMEE: { label: "Confirmée", dot: "bg-indigo-500", cls: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  EN_COURS: { label: "En cours", dot: "bg-emerald-500 animate-pulse", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  TERMINEE: { label: "Terminée", dot: "bg-slate-400", cls: "text-slate-600 bg-slate-100 border-slate-200" },
  ANNULEE: { label: "Annulée", dot: "bg-red-400", cls: "text-red-600 bg-red-50 border-red-200" },
  LITIGE: { label: "Litige", dot: "bg-orange-400 animate-pulse", cls: "text-orange-700 bg-orange-50 border-orange-200" },
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
      "group flex items-center gap-4 px-5 py-4 transition-all duration-200",
      r.href && "hover:bg-slate-50/80 cursor-pointer",
    )}>

      {/* Vehicle Photo or Icon */}
      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group-hover:border-emerald-200 transition-colors">
        {r.vehiclePhoto ? (
          <img 
            src={r.vehiclePhoto} 
            alt={r.vehicle} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <Car className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[14px] font-bold text-slate-900 truncate tracking-tight">{r.vehicle}</p>
          {r.duration && (
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
              {r.duration}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {r.tenantName && (
            <span className="text-[12px] font-medium text-slate-500 truncate max-w-[120px]">
              {r.tenantName}
            </span>
          )}
          {r.tenantPhone && r.status === "EN_COURS" && (
            <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 tabular-nums">
              {r.tenantPhone}
            </span>
          )}
          <span className="text-slate-200 text-[10px]">|</span>
          <span className="text-[12px] font-bold text-emerald-600 tabular-nums">
            {r.amount}
          </span>
        </div>
      </div>

      {/* Status & Meta */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10.5px] font-black uppercase tracking-tight",
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
        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ml-1">
          <ChevronRight className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
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
      <div className="w-8 h-8 rounded-xl bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/5 rounded-lg bg-slate-100" />
        <div className="h-3 w-1/4 rounded-lg bg-slate-100" />
      </div>
      <div className="h-6 w-20 rounded-full bg-slate-100 flex-shrink-0" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PIPELINE SECTION HEADER
════════════════════════════════════════════════════════════════ */
function PipelineHeader({ status, count }: { status: ReservationStatus; count: number }) {
  const s = STATUS[status];
  return (
    <div className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-50/80 border-y border-slate-100/50">
      <div className={cn("w-2 h-2 rounded-full", s.dot)} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{s.label}</span>
      <div className="ml-auto flex items-center gap-1">
        <span className="text-[10px] font-black text-slate-400">{count}</span>
        <span className="text-[9px] font-bold text-slate-300 uppercase leading-none">items</span>
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
  const effectiveTitle = title ?? (mode === "pipeline" ? "Pipeline" : "Réservations récentes");

  const groups = PIPELINE_ORDER
    .map(st => ({ st, items: reservations.filter(r => r.status === st) }))
    .filter(g => g.items.length > 0);

  return (
    <div className={cn(
      "rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm shadow-slate-100/60 flex flex-col",
      className
    )}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-black tracking-tight text-slate-900">
            {effectiveTitle}
          </h3>
          {!loading && reservations.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-900 text-[10px] font-black text-emerald-400">
              {reservations.length}
            </span>
          )}
        </div>
        <Link
          href="/dashboard/owner/reservations"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-slate-900 transition-colors"
        >
          Voir tout
          <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
        </Link>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="divide-y divide-slate-100">

        {/* Loading */}
        {loading && Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}

        {/* Empty */}
        {!loading && reservations.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Car className="w-4.5 h-4.5 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] font-semibold text-slate-400">Aucune réservation</p>
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