"use client";

import Link from "next/link";
import { ArrowRight, AlertCircle, Clock, CheckCircle2, ChevronDown, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
export type TodoPriority = "urgent" | "normal";

export interface OwnerTodoItem {
  id: string | number;
  title: string;
  description?: string;
  href?: string;
  priority?: TodoPriority;
  meta?: string;
}

/* ════════════════════════════════════════════════════════════════
   PRIORITY CONFIG
════════════════════════════════════════════════════════════════ */
const PRIORITY = {
  urgent: {
    dot: "bg-red-500",
    labelCls: "text-red-600 bg-red-50 border-red-200",
    label: "Urgent",
    rowBorder: "border-red-100 hover:border-red-200 hover:bg-red-50/30",
  },
  normal: {
    dot: "bg-slate-300",
    labelCls: "text-slate-500 bg-slate-100 border-slate-200",
    label: "À faire",
    rowBorder: "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50",
  },
} as const;

const PAGE_SIZE = 4;

/* ════════════════════════════════════════════════════════════════
   TODO ITEM
════════════════════════════════════════════════════════════════ */
function TodoItem({ item }: { item: OwnerTodoItem }) {
  const p = item.priority ?? "normal";
  const cfg = PRIORITY[p];

  const inner = (
    <div className={cn(
      "group flex items-start gap-3.5 rounded-xl border bg-white px-4 py-3.5 transition-all duration-150",
      cfg.rowBorder,
      item.href && "cursor-pointer",
    )}>

      {/* Priority dot */}
      <div className="flex flex-col items-center pt-1.5 flex-shrink-0">
        <span className={cn("w-2 h-2 rounded-full", cfg.dot, p === "urgent" && "animate-pulse")} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={cn(
            "text-[13.5px] font-bold leading-snug",
            p === "urgent" ? "text-slate-900" : "text-slate-700",
          )}>
            {item.title}
          </p>
          <span className={cn(
            "flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold",
            cfg.labelCls,
          )}>
            {cfg.label}
          </span>
        </div>

        {item.description && (
          <p className="mt-0.5 text-[12px] font-medium text-slate-400 leading-snug">
            {item.description}
          </p>
        )}

        {item.meta && (
          <p className="mt-1.5 text-[10.5px] font-black uppercase tracking-widest text-slate-300">
            {item.meta}
          </p>
        )}
      </div>

      {/* Arrow — only on hover, only if href */}
      {item.href && (
        <ArrowRight
          className="w-3.5 h-3.5 flex-shrink-0 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all mt-1"
          strokeWidth={2.5}
        />
      )}
    </div>
  );

  return item.href
    ? <Link href={item.href} className="block">{inner}</Link>
    : <div>{inner}</div>;
}

/* ════════════════════════════════════════════════════════════════
   SKELETON
════════════════════════════════════════════════════════════════ */
function TodoSkeleton() {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-white px-4 py-3.5 animate-pulse">
      <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-3.5 w-3/5 rounded-lg bg-slate-100" />
        <div className="h-3 w-2/5 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN CARD
════════════════════════════════════════════════════════════════ */
export function OwnerTodoCard({
  title = "Actions requises",
  items = [],
  allHref = "/dashboard/owner",
  loading = false,
  emptyLabel = "Tout est à jour — aucune action requise.",
}: {
  title?: string;
  items?: OwnerTodoItem[];
  allHref?: string;
  loading?: boolean;
  emptyLabel?: string;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  const urgentItems = items.filter(i => i.priority === "urgent");
  const normalItems = items.filter(i => i.priority !== "urgent");
  const sorted = [...urgentItems, ...normalItems];
  const paginated = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm shadow-slate-100/60">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-black tracking-tight text-slate-900">{title}</h3>

          {urgentItems.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] font-bold text-red-600">
              <Flame className="w-2.5 h-2.5" strokeWidth={2.5} />
              {urgentItems.length} urgent{urgentItems.length > 1 ? "s" : ""}
            </span>
          )}

          {urgentItems.length === 0 && items.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-900 text-[10px] font-black text-emerald-400">
              {items.length}
            </span>
          )}
        </div>

        {items.length > 0 && (
          <Link
            href={allHref}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-slate-900 transition-colors"
          >
            Voir tout
            <ChevronDown className="w-3 h-3 -rotate-90" strokeWidth={2.5} />
          </Link>
        )}
      </div>

      {/* ── Summary strip ──────────────────────────────────── */}
      {!loading && items.length > 0 && (
        <div className="flex items-center gap-4 px-5 py-2.5 bg-slate-50/60 border-b border-slate-100">
          {urgentItems.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-500">
              <AlertCircle className="w-3 h-3" strokeWidth={2.5} />
              {urgentItems.length} urgent{urgentItems.length > 1 ? "s" : ""}
            </span>
          )}
          {urgentItems.length > 0 && <div className="w-px h-3 bg-slate-200" />}
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Clock className="w-3 h-3" strokeWidth={1.75} />
            {normalItems.length} à traiter
          </span>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="p-4 space-y-2">

        {/* Loading */}
        {loading && Array.from({ length: 3 }).map((_, i) => <TodoSkeleton key={i} />)}

        {/* Empty */}
        {!loading && items.length === 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
            </div>
            <p className="text-[13px] font-semibold text-emerald-700">{emptyLabel}</p>
          </div>
        )}

        {/* Urgent items */}
        {!loading && paginated
          .filter(i => i.priority === "urgent")
          .map(item => <TodoItem key={item.id} item={item} />)
        }

        {/* Divider between urgent and normal */}
        {!loading &&
          urgentItems.length > 0 &&
          normalItems.length > 0 &&
          paginated.some(i => i.priority !== "urgent") && (
            <div className="flex items-center gap-3 py-0.5">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[9.5px] font-black uppercase tracking-[0.15em] text-slate-300">
                À traiter
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
          )}

        {/* Normal items */}
        {!loading && paginated
          .filter(i => i.priority !== "urgent")
          .map(item => <TodoItem key={item.id} item={item} />)
        }

        {/* Load more */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setVisible(v => v + PAGE_SIZE)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-150 mt-1"
          >
            <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />
            {Math.min(PAGE_SIZE, sorted.length - visible)} de plus
          </button>
        )}

        {/* Footer count */}
        {!loading && !hasMore && items.length > 0 && (
          <p className="text-center text-[11px] font-medium text-slate-300 pt-0.5">
            {items.length} action{items.length > 1 ? "s" : ""} au total
          </p>
        )}
      </div>
    </div>
  );
}