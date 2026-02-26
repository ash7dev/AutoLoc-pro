"use client";

import Link from "next/link";
import { ArrowRight, AlertTriangle, Clock3, CheckCircle2, Flame, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

export type TodoPriority = "urgent" | "normal";

export interface OwnerTodoItem {
  id: string | number;
  title: string;
  description?: string;
  href?: string;
  priority?: TodoPriority;
  meta?: string;
}

// ── Config ─────────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  urgent: {
    icon: Flame,
    iconBg: "bg-red-50 border border-red-200/60",
    iconColor: "text-red-500",
    badge: "bg-red-50 border-red-300/50 text-red-600",
    badgeLabel: "Urgent",
    rowHover: "hover:border-red-200/60 hover:bg-red-50/30",
  },
  normal: {
    icon: Clock3,
    iconBg: "bg-slate-100 border border-slate-200",
    iconColor: "text-black/40",
    badge: "bg-slate-100 border-slate-200 text-black/50",
    badgeLabel: "À faire",
    rowHover: "hover:border-slate-200 hover:bg-slate-50/50",
  },
} as const;

const PAGE_SIZE = 4;

// ── Single item ────────────────────────────────────────────────────────────────

function TodoItem({ item }: { item: OwnerTodoItem }) {
  const priority = item.priority ?? "normal";
  const cfg = PRIORITY_CONFIG[priority];
  const Icon = cfg.icon;

  const inner = (
    <div className={cn(
      "group flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3.5",
      "transition-all duration-200",
      cfg.rowHover,
      item.href && "cursor-pointer",
    )}>
      {/* Icon */}
      <span className={cn(
        "flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 mt-0.5",
        cfg.iconBg,
      )}>
        <Icon className={cn("w-3.5 h-3.5", cfg.iconColor)} strokeWidth={2} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="text-[13.5px] font-bold text-black leading-snug tracking-tight">
            {item.title}
          </p>
          <span className={cn(
            "inline-flex items-center flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold",
            cfg.badge,
          )}>
            {cfg.badgeLabel}
          </span>
        </div>

        {item.description && (
          <p className="text-[12px] font-medium text-black/45 leading-snug mt-0.5">
            {item.description}
          </p>
        )}

        {item.meta && (
          <p className="mt-1.5 text-[11px] font-semibold text-black/30 uppercase tracking-wide">
            {item.meta}
          </p>
        )}
      </div>

      {/* Arrow */}
      {item.href && (
        <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-black/20
          transition-transform duration-200 group-hover:translate-x-0.5 mt-1" strokeWidth={2} />
      )}
    </div>
  );

  return item.href ? (
    <Link href={item.href} className="block">{inner}</Link>
  ) : (
    <div>{inner}</div>
  );
}

// ── Main card ──────────────────────────────────────────────────────────────────

export function OwnerTodoCard({
  title = "À faire maintenant",
  items = [],
  allHref = "/dashboard/owner",
  loading = false,
  emptyLabel = "Aucune action urgente pour l'instant.",
}: {
  title?: string;
  items?: OwnerTodoItem[];
  allHref?: string;
  loading?: boolean;
  emptyLabel?: string;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  const urgentItems = items.filter((i) => i.priority === "urgent");
  const normalItems = items.filter((i) => i.priority !== "urgent");

  // Urgent en premier, puis normal
  const sorted = [...urgentItems, ...normalItems];
  const paginated = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[15px] font-black tracking-tight text-black">{title}</h3>

          {/* Compteur urgents */}
          {urgentItems.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
              rounded-full bg-red-50 border border-red-300/50 text-[10px] font-bold text-red-600">
              {urgentItems.length}
            </span>
          )}

          {/* Compteur total si pas de urgents */}
          {urgentItems.length === 0 && items.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
              rounded-full bg-black text-emerald-400 text-[10px] font-black">
              {items.length}
            </span>
          )}
        </div>

        {items.length > 0 && (
          <Link
            href={allHref}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-black/40
              hover:text-black transition-colors duration-150"
          >
            Voir tout
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </Link>
        )}
      </div>

      {/* Résumé urgents / normaux */}
      {!loading && items.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-50 bg-slate-50/50">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-500">
            <Flame className="w-3 h-3" strokeWidth={2} />
            {urgentItems.length} urgent{urgentItems.length > 1 ? 's' : ''}
          </span>
          <span className="w-px h-3 bg-slate-200" />
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-black/35">
            <Clock3 className="w-3 h-3" strokeWidth={1.75} />
            {normalItems.length} à faire
          </span>
          <span className="w-px h-3 bg-slate-200" />
          <span className="text-[11px] font-medium text-black/30">
            {items.length} au total
          </span>
        </div>
      )}

      {/* Body */}
      <div className="p-4 space-y-2">

        {/* Loading skeleton */}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3.5 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-0.5">
              <div className="h-3.5 w-40 rounded-lg bg-slate-100" />
              <div className="h-3 w-28 rounded-lg bg-slate-100" />
            </div>
          </div>
        ))}

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20
            bg-emerald-400/5 px-4 py-3.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl
              bg-emerald-400/10 border border-emerald-400/20 flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
            </span>
            <p className="text-[13px] font-semibold text-emerald-700">{emptyLabel}</p>
          </div>
        )}

        {/* Items */}
        {!loading && paginated.map((item) => (
          <TodoItem key={item.id} item={item} />
        ))}

        {/* Séparateur urgents / normaux */}
        {!loading && urgentItems.length > 0 && normalItems.length > 0 &&
          paginated.some(i => i.priority !== 'urgent') &&
          paginated.some(i => i.priority === 'urgent') && (
          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[9.5px] font-bold uppercase tracking-widest text-black/25">
              À traiter
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl
              border border-slate-200 bg-white px-4 py-2.5 mt-1
              text-[12.5px] font-semibold text-black/50
              hover:bg-slate-50 hover:text-black hover:border-slate-300
              transition-all duration-150"
          >
            <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />
            Voir {Math.min(PAGE_SIZE, sorted.length - visible)} de plus
          </button>
        )}

        {/* Footer — tout affiché */}
        {!loading && !hasMore && items.length > 0 && (
          <p className="text-center text-[11px] font-medium text-black/20 pt-1">
            {items.length} action{items.length > 1 ? 's' : ''} au total
          </p>
        )}
      </div>
    </div>
  );
}