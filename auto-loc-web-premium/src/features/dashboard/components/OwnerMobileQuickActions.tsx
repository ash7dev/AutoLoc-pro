'use client';

import React from 'react';
import Link from 'next/link';
import {
  Plus,
  CalendarCheck,
  CarFront,
  Wallet,
  BarChart3,
  User,
  ChevronRight,
} from 'lucide-react';

interface QuickActionItem {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  highlighted?: boolean;
}

const ACTIONS: QuickActionItem[] = [
  {
    key: 'create',
    title: 'Créer une annonce',
    subtitle: 'Ajoutez un nouveau véhicule à la plateforme...',
    href: '/dashboard/vehicles/new',
    icon: Plus,
    highlighted: true,
  },
  {
    key: 'reservations',
    title: 'Voir mes réservations',
    subtitle: 'Gérez vos demandes et séjours en cours',
    href: '/dashboard/reservations',
    icon: CalendarCheck,
  },
  {
    key: 'vehicles',
    title: 'Mes véhicules',
    subtitle: 'Ajustez les tarifs, photos et disponibilités',
    href: '/dashboard/vehicles',
    icon: CarFront,
  },
  {
    key: 'wallet',
    title: 'Consulter mon solde',
    subtitle: 'Solde disponible, retraits et historique',
    href: '/dashboard/wallet',
    icon: Wallet,
  },
  {
    key: 'stats',
    title: 'Voir mes stats & activités',
    subtitle: "Taux d'occupation, revenus et performance",
    href: '/dashboard#stats',
    icon: BarChart3,
  },
  {
    key: 'profile',
    title: 'Mes données',
    subtitle: 'Compte, sécurité et paramètres du profil',
    href: '/profile',
    icon: User,
  },
];

export const OwnerMobileQuickActions: React.FC = () => {
  return (
    <nav
      aria-label="Actions rapides mobile"
      className="md:hidden space-y-3 pt-2 pb-1"
    >
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        const isForest = action.highlighted;
        return (
          <Link
            key={action.key}
            href={action.href}
            className={`group flex items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm transition-all duration-200 active:scale-[0.99] ${
              isForest
                ? 'border-[#0A3D2E] bg-[#0A3D2E] text-[#F1DFB6] active:bg-[#0F4F3B]'
                : 'border-[#0A3D2E]/10 bg-white text-[#041912] hover:border-[#0A3D2E]/30'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105 ${
                  isForest
                    ? 'bg-[#F1DFB6] text-[#0A3D2E]'
                    : 'bg-[#0A3D2E] text-[#F1DFB6]'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
              </span>
              <div className="min-w-0 space-y-0.5">
                <h3
                  className={`font-display text-sm font-semibold tracking-tight ${
                    isForest ? 'text-[#F1DFB6]' : 'text-[#041912]'
                  }`}
                >
                  {action.title}
                </h3>
                <p
                  className={`text-xs truncate leading-snug ${
                    isForest ? 'text-[#F1DFB6]/75' : 'text-slate-500'
                  }`}
                >
                  {action.subtitle}
                </p>
              </div>
            </div>
            <ChevronRight
              className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                isForest ? 'text-[#F1DFB6]/60' : 'text-slate-400'
              }`}
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </nav>
  );
};
