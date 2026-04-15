"use client";

import Link from "next/link";
import { Car, Calendar, Wallet, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/lib/nestjs/reservations";

interface MobileQuickActionsProps {
  reservations?: Reservation[];
  urgentCount?: number;
}

export function MobileQuickActions({ reservations = [], urgentCount = 0 }: MobileQuickActionsProps) {
  const actions = [
    {
      icon: Plus,
      label: "Ajouter",
      href: "/dashboard/owner/vehicles?action=add",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
      accentBorder: "border-l-emerald-500",
      description: "Un véhicule"
    },
    {
      icon: Calendar,
      label: "Réservations",
      href: "/dashboard/owner/reservations",
      iconBg: urgentCount > 0 ? "bg-gradient-to-br from-red-500 to-rose-500" : "bg-gradient-to-br from-blue-500 to-indigo-500",
      accentBorder: urgentCount > 0 ? "border-l-red-500" : "border-l-blue-500",
      description: urgentCount > 0 ? `${urgentCount} urgent${urgentCount > 1 ? 's' : ''}` : "Gérer"
    },
    {
      icon: Car,
      label: "Véhicules",
      href: "/dashboard/owner/vehicles",
      iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
      accentBorder: "border-l-purple-500",
      description: "Mon parc"
    },
    {
      icon: Wallet,
      label: "Portefeuille",
      href: "/dashboard/owner/wallet",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
      accentBorder: "border-l-amber-500",
      description: "Finances"
    },
  ];

  return (
    <div className="lg:hidden grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl",
              "border border-l-[3px] border-white/70",
              action.accentBorder,
              "bg-white/70 backdrop-blur-xl",
              "shadow-sm",
              "transition-all duration-200",
              "hover:shadow-lg hover:shadow-slate-200/40 hover:-translate-y-[2px] active:scale-[0.98]"
            )}
          >
            <span className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-2",
              action.iconBg,
              "shadow-md"
            )}>
              <Icon className="w-5 h-5 text-white" strokeWidth={2} />
            </span>
            <span className="text-[13px] font-bold text-slate-800 text-center mb-0.5">
              {action.label}
            </span>
            <span className="text-[11px] font-medium text-slate-500 text-center">
              {action.description}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
