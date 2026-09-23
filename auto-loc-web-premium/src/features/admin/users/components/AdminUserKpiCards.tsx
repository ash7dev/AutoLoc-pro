'use client';

import React from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  AlertTriangle,
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
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300',
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
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-300',
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
      color: pendingKyc > 0
        ? 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-400 animate-pulse'
        : 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-400',
      iconBg: 'bg-sky-500/20 text-sky-300',
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
      color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400',
      iconBg: 'bg-violet-500/20 text-violet-300',
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
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-300',
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
            className={`relative group text-left p-4 rounded-2xl border transition-all duration-300 bg-slate-900/60 backdrop-blur-md hover:scale-[1.02] hover:shadow-xl ${
              card.isActive
                ? 'ring-2 ring-emerald-500/80 shadow-lg shadow-emerald-500/10 bg-slate-800/80 border-emerald-500/50'
                : `border-slate-800 hover:border-slate-700`
            }`}
          >
            {/* Top Row: Icon & Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              {card.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
                  {card.badge}
                </span>
              )}
            </div>

            {/* Value */}
            <div className="text-2xl font-black text-white tracking-tight mb-1 font-mono">
              {card.value.toLocaleString()}
            </div>

            {/* Title & Subtext */}
            <div className="text-xs font-semibold text-slate-200 mb-0.5">
              {card.title}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {card.subtext}
            </div>

            {/* Active Indicator Bar */}
            {card.isActive && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
