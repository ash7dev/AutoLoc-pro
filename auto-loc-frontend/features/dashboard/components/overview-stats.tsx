"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp, Car, Activity, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconBadge } from "@/components/ui/icon-badge";
import type { OwnerStats } from "@/lib/nestjs/reservations";

interface StatItem {
  label: string;
  value: string;
  unit: string;
  delta: string;
  positive: boolean;
  icon: LucideIcon;
}

function formatRevenu(montant: number): string {
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(1)}M`;
  if (montant >= 1_000) return `${Math.round(montant / 1_000)}K`;
  return String(Math.round(montant));
}

function buildStats(data: OwnerStats | null | undefined): StatItem[] {
  if (!data) {
    return [
      { label: "Revenus du mois", value: "—", unit: "FCFA", delta: "Chargement…", positive: true, icon: TrendingUp },
      { label: "Réservations actives", value: "—", unit: "en cours", delta: "Chargement…", positive: true, icon: Car },
      { label: "Taux d'occupation", value: "—", unit: "%", delta: "Chargement…", positive: true, icon: Activity },
      { label: "Litiges ouverts", value: "—", unit: "litige", delta: "Chargement…", positive: true, icon: Shield },
    ];
  }
  return [
    {
      label: "Revenus du mois",
      value: formatRevenu(data.revenusMois),
      unit: "FCFA",
      delta: data.revenusMois > 0 ? "Ce mois" : "Aucun revenu ce mois",
      positive: data.revenusMois > 0,
      icon: TrendingUp,
    },
    {
      label: "Réservations actives",
      value: String(data.reservationsActives),
      unit: "en cours",
      delta: data.reservationsActives > 0
        ? `${data.reservationsActives} active${data.reservationsActives > 1 ? "s" : ""}`
        : "Aucune",
      positive: data.reservationsActives > 0,
      icon: Car,
    },
    {
      label: "Taux d'occupation",
      value: String(data.tauxOccupation),
      unit: "%",
      delta: data.tauxOccupation > 0 ? "Véhicules actifs" : "Aucune réservation",
      positive: data.tauxOccupation > 0,
      icon: Activity,
    },
    {
      label: "Litiges ouverts",
      value: String(data.litigesOuverts),
      unit: "litige",
      delta: data.litigesOuverts === 0 ? "RAS" : `${data.litigesOuverts} en cours`,
      positive: data.litigesOuverts === 0,
      icon: Shield,
    },
  ];
}

export function OverviewStats({ data }: { data?: OwnerStats | null }) {
  const stats = buildStats(data);

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
