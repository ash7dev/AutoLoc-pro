"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  TriangleAlert,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  Dot,
} from "lucide-react";
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

const PAGE_SIZE = 4;

/* ════════════════════════════════════════════════════════════════
   TODO ITEM
════════════════════════════════════════════════════════════════ */
function TodoItem({ item }: { item: OwnerTodoItem }) {
  const isUrgent = item.priority === "urgent";

  const inner = (
    <div className={cn(
      "group relative flex items-center gap-4 px-4 py-3.5 transition-all duration-150",
      isUrgent
        ? "bg-red-950/30 hover:bg-red-950/50"
        : "hover:bg-white/5",
      item.href && "cursor-pointer",
    )}>

      {/* Left colored strip */}
      <div className={cn(
        "absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full transition-all duration-150",
        isUrgent
          ? "bg-red-500 group-hover:bg-red-400"
          : "bg-emerald-500/40 group-hover:bg-emerald-400",
      )} />

      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl",
        isUrgent
          ? "bg-red-500/15 border border-red-500/30"
          : "bg-emerald-400/10 border border-emerald-400/20",
      )}>
        {isUrgent
          ? <TriangleAlert className="w-3.5 h-3.5 text-red-400" strokeWidth={2} />
          : <Dot className="w-5 h-5 text-emerald-400" strokeWidth={2} />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-[13px] font-semibold leading-snug tracking-tight",
          isUrgent ? "text-white" : "text-white/80",
        )}>
          {item.title}
        </p>

        {item.description && (
          <p className="mt-0.5 text-[11.5px] font-medium text-white/35 leading-snug">
            {item.description}
          </p>
        )}

        {item.meta && (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/20">
            {item.meta}
          </p>
        )}
      </div>

      {/* Right side */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {isUrgent && (
          <span className="text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-md">
            Urgent
          </span>
        )}
        {item.href && (
          <div className={cn(
            "flex items-center justify-center w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150",
            isUrgent ? "bg-red-500/20" : "bg-emerald-400/10",
          )}>
            <ArrowUpRight className={cn(
              "w-3 h-3",
              isUrgent ? "text-red-400" : "text-emerald-400",
            )} strokeWidth={2.5} />
          </div>
        )}
      </div>
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
    <div className="flex items-center gap-4 px-4 py-3.5 animate-pulse">
      <div className="w-8 h-8 rounded-xl bg-white/10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/5 rounded-md bg-white/10" />
        <div className="h-2.5 w-2/5 rounded-md bg-white/[0.06]" />
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
  emptyLabel = "Aucune action en attente",
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
    <div className="relative overflow-hidden rounded-2xl bg-foreground shadow-lg flex flex-col">

      {/* Top highlight */}
      <div className="absolute top-0 left-6 right-6 h-px bg-white/10" />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
            {title}
          </p>

          {urgentItems.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/25 text-[9px] font-black text-red-400 uppercase tracking-wider">
              <TriangleAlert className="w-2.5 h-2.5" strokeWidth={2.5} />
              {urgentItems.length} urgent{urgentItems.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-emerald-400/15 border border-emerald-400/25 text-[10px] font-black text-emerald-400">
              {items.length}
            </span>
          )}
          {items.length > 0 && (
            <Link
              href={allHref}
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
            >
              Voir tout
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────────── */}
      {!loading && items.length > 0 && (
        <>
          <div className="mx-5 h-px bg-white/10" />
          <div className="grid grid-cols-2 divide-x divide-white/10 mx-0 mt-0">
            <div className="px-5 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Urgents</p>
              <p className={cn(
                "text-[22px] font-black leading-none tracking-tight",
                urgentItems.length > 0 ? "text-red-400" : "text-white/20",
              )}>
                {urgentItems.length}
              </p>
            </div>
            <div className="px-5 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">À traiter</p>
              <p className="text-[22px] font-black leading-none tracking-tight text-white/70">
                {normalItems.length}
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── Separator ──────────────────────────────────────── */}
      <div className="mx-5 h-px bg-white/10" />

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex flex-col py-2">

        {/* Loading */}
        {loading && Array.from({ length: 3 }).map((_, i) => <TodoSkeleton key={i} />)}

        {/* Empty */}
        {!loading && items.length === 0 && (
          <div className="flex items-center gap-4 mx-4 my-3 rounded-xl bg-emerald-400/8 border border-emerald-400/15 px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/15 border border-emerald-400/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white/80">{emptyLabel}</p>
              <p className="text-[11px] font-medium text-white/35 mt-0.5">Votre tableau de bord est à jour.</p>
            </div>
          </div>
        )}

        {/* Urgent items */}
        {!loading && paginated
          .filter(i => i.priority === "urgent")
          .map(item => <TodoItem key={item.id} item={item} />)
        }

        {/* Séparateur urgent / normal */}
        {!loading &&
          urgentItems.length > 0 &&
          normalItems.length > 0 &&
          paginated.some(i => i.priority !== "urgent") && (
            <div className="flex items-center gap-3 px-5 py-1.5">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20">
                À traiter
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          )}

        {/* Normal items */}
        {!loading && paginated
          .filter(i => i.priority !== "urgent")
          .map(item => <TodoItem key={item.id} item={item} />)
        }
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      {(hasMore || (!loading && !hasMore && items.length > 0)) && (
        <>
          <div className="mx-5 h-px bg-white/10" />
          <div className="px-4 py-3">
            {hasMore ? (
              <button
                type="button"
                onClick={() => setVisible(v => v + PAGE_SIZE)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-[11.5px] font-semibold text-white/40 hover:text-white/70 hover:bg-white/8 hover:border-white/15 transition-all duration-150"
              >
                <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                {Math.min(PAGE_SIZE, sorted.length - visible)} de plus
              </button>
            ) : (
              <p className="text-center text-[10.5px] font-medium text-white/20">
                {items.length} action{items.length > 1 ? "s" : ""} au total
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
