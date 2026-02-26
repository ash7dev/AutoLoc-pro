"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp, Car, Activity, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconBadge } from "@/components/ui/icon-badge";

interface StatItem {
  label: string;
  value: string;
  unit: string;
  delta: string;
  positive: boolean;
  icon: LucideIcon;
}

const stats: StatItem[] = [
  {
    label: "Revenus du mois",
    value: "2.4M",
    unit: "FCFA",
    delta: "+12%",
    positive: true,
    icon: TrendingUp,
  },
  {
    label: "Réservations actives",
    value: "8",
    unit: "en cours",
    delta: "+3 ce mois",
    positive: true,
    icon: Car,
  },
  {
    label: "Taux d'occupation",
    value: "73",
    unit: "%",
    delta: "+5% vs mois dernier",
    positive: true,
    icon: Activity,
  },
  {
    label: "Litiges ouverts",
    value: "0",
    unit: "litige",
    delta: "RAS",
    positive: true,
    icon: Shield,
  },
];

export function OverviewStats() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="relative rounded-lg border border-[hsl(var(--border))] bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                  <span className="text-sm text-muted-foreground font-medium">{stat.unit}</span>
                </div>
                <p
                  className={cn(
                    "text-xs font-medium",
                    stat.positive ? "text-emerald-600" : "text-destructive"
                  )}
                >
                  {stat.delta}
                </p>
              </div>
              <IconBadge icon={Icon} />
            </div>
          </div>
        );
      })}
    </div>
  );
}