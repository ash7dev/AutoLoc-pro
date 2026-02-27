"use client";

import Link from "next/link";
import { Car, Calendar, Wallet, Plus, Star } from "lucide-react";
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
      color: "bg-emerald-500",
      description: "Un véhicule"
    },
    {
      icon: Calendar,
      label: "Réservations",
      href: "/dashboard/owner/reservations",
      color: urgentCount > 0 ? "bg-red-500" : "bg-blue-500",
      description: urgentCount > 0 ? `${urgentCount} urgent${urgentCount > 1 ? 's' : ''}` : "Gérer"
    },
    {
      icon: Car,
      label: "Véhicules",
      href: "/dashboard/owner/vehicles",
      color: "bg-purple-500",
      description: "Mon parc"
    },
    {
      icon: Wallet,
      label: "Portefeuille",
      href: "/dashboard/owner/wallet",
      color: "bg-orange-500",
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
              "bg-white border border-slate-100",
              "transition-all duration-200",
              "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            <span className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-2",
              action.color,
              "shadow-sm"
            )}>
              <Icon className="w-5 h-5 text-white" strokeWidth={2} />
            </span>
            <span className="text-[13px] font-semibold text-black text-center mb-0.5">
              {action.label}
            </span>
            <span className="text-[11px] text-black/40 text-center">
              {action.description}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
