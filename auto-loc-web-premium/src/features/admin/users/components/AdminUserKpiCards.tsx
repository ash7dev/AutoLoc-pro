'use client';

import React from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  UserPlus,
} from 'lucide-react';

interface AdminUserKpiCardsProps {
  counts?: {
    total: number;
    locataires: number;
    proprietaires: number;
    admins: number;
    support: number;
    pendingKyc: number;
    banned: number;
    stuckOnboarding: number;
  };
  activeStatusFilter: string;
  activeRoleFilter: string;
  onSelectStatusFilter: (status: string) => void;
  onSelectRoleFilter: (role: string) => void;
}

export function AdminUserKpiCards({
  counts,
  activeStatusFilter,
  activeRoleFilter,
  onSelectStatusFilter,
  onSelectRoleFilter,
}: AdminUserKpiCardsProps) {
  const total = counts?.total ?? 0;
  const locataires = counts?.locataires ?? 0;
  const proprietaires = counts?.proprietaires ?? 0;
  const pendingKyc = counts?.pendingKyc ?? 0;
  const banned = counts?.banned ?? 0;
  const stuckOnboarding = counts?.stuckOnboarding ?? 0;

  const cards = [
    {
      id: 'total',
      title: 'Total Inscrits',
      value: total,
      subtext: `${locataires} Locataires • ${proprietaires} Hôtes`,
      icon: Users,
      iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
      badge: null,
      isActive: activeStatusFilter === 'ALL' && activeRoleFilter === 'ALL',
      onClick: () => {
        onSelectStatusFilter('ALL');
        onSelectRoleFilter('ALL');
      },
    },
    {
      id: 'proprietaires',
      title: 'Hôtes (Propriétaires)',
      value: proprietaires,
      subtext: 'Partenaires avec véhicules',
      icon: UserCheck,
      iconBg: 'bg-amber-50 text-amber-700 border border-amber-200/60',
      badge: null,
      isActive: activeRoleFilter === 'PROPRIETAIRE',
      onClick: () => {
        onSelectRoleFilter('PROPRIETAIRE');
      },
    },
    {
      id: 'pendingKyc',
      title: 'KYC à Valider',
      value: pendingKyc,
      subtext: 'Identités en attente de revue',
      icon: ShieldCheck,
      iconBg: 'bg-sky-50 text-sky-700 border border-sky-200/60',
      badge: pendingKyc > 0 ? `${pendingKyc} urgent` : undefined,
      isActive: activeStatusFilter === 'PENDING_KYC',
      onClick: () => {
        onSelectStatusFilter('PENDING_KYC');
      },
    },
    {
      id: 'stuckOnboarding',
      title: 'Inscriptions Incomplètes',
      value: stuckOnboarding,
      subtext: 'Comptes en cours d\'onboarding',
      icon: UserPlus,
      iconBg: 'bg-violet-50 text-violet-700 border border-violet-200/60',
      badge: null,
      isActive: activeStatusFilter === 'STUCK_ONBOARDING',
      onClick: () => {
        onSelectStatusFilter('STUCK_ONBOARDING');
      },
    },
    {
      id: 'banned',
      title: 'Comptes Suspendus',
      value: banned,
      subtext: 'Accès restreint par l\'admin',
      icon: UserX,
      iconBg: 'bg-rose-50 text-rose-700 border border-rose-200/60',
      badge: null,
      isActive: activeStatusFilter === 'BANNED',
      onClick: () => {
        onSelectStatusFilter('BANNED');
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <button
            key={card.id}
            onClick={card.onClick}
            className={`relative group text-left p-4.5 rounded-2xl border transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
              card.isActive
                ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/10 shadow-emerald-500/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Top Row: Icon & Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              {card.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 uppercase tracking-wider">
                  {card.badge}
                </span>
              )}
            </div>

            {/* Value */}
            <div className="text-2xl font-black text-slate-900 tracking-tight mb-1 font-mono">
              {card.value.toLocaleString()}
            </div>

            {/* Title & Subtext */}
            <div className="text-xs font-bold text-slate-800 mb-0.5">
              {card.title}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {card.subtext}
            </div>

            {/* Active Indicator Bar */}
            {card.isActive && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
