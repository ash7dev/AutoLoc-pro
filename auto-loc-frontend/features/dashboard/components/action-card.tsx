"use client";

import Link from "next/link";
import { Plus, BarChart3, Settings, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionItem {
  label: string;
  icon: React.ElementType;
  href: string;
  primary?: boolean;
}

export function ActionCard({
  addVehicleHref = "/dashboard/owner/vehicles/new",
  reportHref = "/dashboard/owner/reports",
  settingsHref = "/dashboard/settings",
  loading = false,
}: {
  addVehicleHref?: string;
  reportHref?: string;
  settingsHref?: string;
  loading?: boolean;
}) {
  const actions: ActionItem[] = [
    { label: "Ajouter un véhicule", icon: Plus, href: addVehicleHref, primary: true },
    { label: "Voir rapport", icon: BarChart3, href: reportHref },
    { label: "Paramètres", icon: Settings, href: settingsHref },
  ];

  return (
    <div className="relative overflow-hidden rounded-lg bg-foreground p-6 shadow-lg flex flex-col h-full">
      {/* Subtle top highlight */}
      <div className="absolute top-0 left-6 right-6 h-px bg-white/10" />

      <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
        Actions rapides
      </p>

      <div className="flex flex-col gap-2.5 flex-1">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-11 rounded-lg bg-white/5 animate-pulse"
              />
            ))
          : actions.map(({ label, icon: Icon, href, primary }) => (
              <Link
                key={label}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  primary
                    ? "bg-white text-foreground hover:bg-white/90"
                    : "bg-white/8 text-white/70 hover:bg-white/12 hover:text-white border border-white/10"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                <span className="flex-1">{label}</span>
                <ArrowRight
                  className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                  strokeWidth={1.5}
                />
              </Link>
            ))}
      </div>
    </div>
  );
}