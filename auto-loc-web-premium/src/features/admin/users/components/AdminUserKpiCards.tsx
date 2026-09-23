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

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const GOLD = '#b27c2d';
const RUST = '#a13d3d';
const VIOLET = '#6d28d9';

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
      color: FOREST,
      bgLight: 'rgba(10, 61, 46, 0.08)',
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
      color: GOLD,
      bgLight: 'rgba(178, 124, 45, 0.1)',
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
      color: '#0284c7', // Sky blue
      bgLight: 'rgba(2, 132, 199, 0.1)',
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
      color: VIOLET,
      bgLight: 'rgba(109, 40, 217, 0.1)',
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
      color: RUST,
      bgLight: 'rgba(161, 61, 61, 0.1)',
      badge: null,
      isActive: activeStatusFilter === 'BANNED',
      onClick: () => {
        onSelectStatusFilter('BANNED');
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6" style={fontStyle}>
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <button
            key={card.id}
            onClick={card.onClick}
            className={`relative group text-left p-4.5 rounded-3xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-[0_10px_30px_-20px_rgba(10,61,46,0.15)] hover:shadow-lg ${
              card.isActive
                ? 'ring-2 border-transparent shadow-md'
                : 'border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
            style={{
              borderColor: card.isActive ? card.color : undefined,
              ['--tw-ring-color' as string]: card.isActive ? card.color : undefined,
            }}
          >
            {/* Top Row: Icon & Badge */}
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ backgroundColor: card.bgLight, color: card.color }}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              {card.badge && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans"
                  style={{ backgroundColor: card.bgLight, color: card.color, borderColor: `${card.color}33` }}
                >
                  {card.badge}
                </span>
              )}
            </div>

            {/* Value */}
            <div className="text-2xl font-normal text-slate-900 dark:text-white tracking-tight mb-1 font-mono">
              {card.value.toLocaleString()}
            </div>

            {/* Title & Subtext */}
            <div className="text-xs font-normal text-slate-900 dark:text-slate-200 mb-0.5">
              {card.title}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-sans">
              {card.subtext}
            </div>

            {/* Active Indicator Bar */}
            {card.isActive && (
              <div
                className="absolute bottom-0 left-5 right-5 h-1 rounded-t-full transition-all"
                style={{ backgroundColor: card.color }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
