import React from 'react';
import { cookies } from 'next/headers';
import { Calendar } from 'lucide-react';
import { fetchAdminStats, fetchAdminActivity } from '../../../lib/nestjs/admin';
import type { AdminStats, AdminActivityItem } from '../../../lib/nestjs/admin';
import { AdminPlatformMetrics } from '../../../features/admin/components/admin-platform-metrics';
import type { PlatformMetric } from '../../../features/admin/components/admin-platform-metrics';
import { AdminStatCards } from '../../../features/admin/components/admin-stat-cards';
import { AdminActivityFeed } from '../../../features/admin/components/admin-activity-feed';
import { AdminQuickActions } from '../../../features/admin/components/admin-quick-actions';
import { PendingKycWithListingSection } from '../../../features/admin/components/pending-kyc-with-listing';

function buildMetrics(stats: AdminStats): PlatformMetric[] {
  const revenu = stats.revenuCeMois;
  const revenuFmt =
    revenu >= 1_000_000
      ? `${(revenu / 1_000_000).toFixed(1)}M FCFA`
      : revenu >= 1_000
      ? `${(revenu / 1_000).toFixed(0)}k FCFA`
      : `${revenu} FCFA`;

  const satisfaction =
    stats.tauxSatisfaction != null
      ? `${stats.tauxSatisfaction}/5`
      : '—';

  return [
    {
      label: 'Utilisateurs actifs',
      value: stats.utilisateursActifs,
      change: '—',
      changePositive: true,
    },
    {
      label: 'Locations ce mois',
      value: stats.locationsCeMois,
      change: '—',
      changePositive: true,
    },
    {
      label: 'Revenu plateforme',
      value: revenuFmt,
      change: '—',
      changePositive: true,
    },
    {
      label: 'Taux satisfaction',
      value: satisfaction,
      change: '—',
      changePositive: true,
    },
  ];
}

export default async function AdminOverviewPage(): Promise<React.ReactElement> {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const cookieStore = cookies();
  const token = cookieStore.get('nest_access')?.value ?? '';

  let stats: AdminStats | null = null;
  let activity: AdminActivityItem[] = [];

  const [statsResult, activityResult] = await Promise.allSettled([
    fetchAdminStats(token),
    fetchAdminActivity(token),
  ]);
  if (statsResult.status === 'fulfilled')    stats    = statsResult.value;
  if (activityResult.status === 'fulfilled') activity = activityResult.value;

  const metrics = stats ? buildMetrics(stats) : undefined;

  return (
    <div className="p-6 lg:p-8">

      {/* ── Welcome header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
            Espace administration
          </span>
        </div>
        <div className="flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-black">
              Bonjour, Admin 👋
            </h1>
            <p className="mt-1 text-[14px] font-medium text-black/40">
              Voici le résumé de la plateforme AutoLoc. {dateStr}.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-3 lg:mt-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-[12px] font-semibold text-black/50">
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
              Aujourd&apos;hui
            </span>
          </div>
        </div>
      </div>

      {/* ── Platform health metrics ── */}
      <AdminPlatformMetrics metrics={metrics} />

      {/* ── Stat cards (actions en attente) ── */}
      <AdminStatCards
        kyc={stats ? { value: stats.pending.kycEnAttente } : undefined}
        vehicles={stats ? { value: stats.pending.vehiculesAValider } : undefined}
        withdrawals={stats ? { value: stats.pending.retraitsEnAttente } : undefined}
        disputes={stats ? { value: stats.pending.litigesOuverts } : undefined}
      />

      {/* ── KYC + Annonce simultanés ── */}
      <PendingKycWithListingSection />

      {/* ── Body — 2 columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminActivityFeed items={activity} />
        <AdminQuickActions />
      </div>

    </div>
  );
}
