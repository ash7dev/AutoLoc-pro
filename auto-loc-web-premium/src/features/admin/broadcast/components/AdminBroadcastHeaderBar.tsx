'use client';

import React from 'react';
import {
  Users,
  ShieldCheck,
  Smartphone,
  Globe,
  Mail,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import type { AdminAudienceStats } from '../../../../core/api/adminBroadcastApi';

interface AdminBroadcastHeaderBarProps {
  stats?: AdminAudienceStats;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * Typographie d'affichage : Gloock via next/font (variable --font-gloock),
 * avec un repli serif si la variable n'est pas définie.
 */
const DISPLAY_FONT = { fontFamily: 'var(--font-gloock, Georgia, "Times New Roman", serif)' };

const fmt = (n: number) => n.toLocaleString('fr-FR');
const percent = (part: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;

const CHANNELS = [
  { label: 'Push mobile', Icon: Smartphone },
  { label: 'Push web', Icon: Globe },
  { label: 'Email', Icon: Mail },
  { label: 'WhatsApp / SMS', Icon: MessageSquare },
];

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block animate-pulse rounded-md bg-white/15 motion-reduce:animate-none ${className}`}
    />
  );
}

function MiniBar({
  segments,
  label,
}: {
  segments: { value: number; className: string }[];
  label: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-white/10"
    >
      {segments.map((s, i) => (
        <div key={i} className={s.className} style={{ width: `${s.value}%` }} />
      ))}
    </div>
  );
}

export function AdminBroadcastHeaderBar({
  stats,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
}: AdminBroadcastHeaderBarProps) {
  const totalUsers = stats?.totalUsers ?? 0;
  const totalHotes = stats?.totalHotes ?? 0;
  const totalLocataires = stats?.totalLocataires ?? 0;
  const totalKycVerifies = stats?.totalKycVerifies ?? 0;
  const pushMobile = stats?.reach.pushMobileExpo ?? 0;
  const webPush = stats?.reach.webPushVapid ?? 0;
  const pushTotal = pushMobile + webPush;

  const hostShare = percent(totalHotes, totalUsers);
  const tenantShare = percent(totalLocataires, totalUsers);
  const kycShare = percent(totalKycVerifies, totalLocataires);
  const pushCoverage = percent(pushTotal, totalUsers);
  const mobileSplit = percent(pushMobile, pushTotal);

  return (
    <section
      aria-label="Audience du Broadcast Studio"
      className="relative mb-8 overflow-hidden rounded-[28px] border border-[#F1DFB6]/15 bg-[#0A3D2E] p-6 text-white shadow-[0_24px_60px_-24px_rgba(10,61,46,0.6)] sm:p-8"
    >
      {/* En-tête */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <h1
            style={DISPLAY_FONT}
            className="text-3xl leading-tight tracking-tight text-[#F1DFB6] sm:text-4xl"
          >
            Broadcast Studio
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-emerald-100/75">
            Envoyez un message à toute l'audience ou à un segment, par push, email ou WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-busy={isRefreshing}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[#F1DFB6]/30 px-4 py-2 text-sm font-medium text-[#F1DFB6] transition hover:bg-[#F1DFB6]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A3D2E] disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin motion-reduce:animate-none' : ''}`}
          />
          Actualiser
        </button>
      </div>

      {/* Audience */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        {/* Chiffre principal */}
        <div className="flex flex-col justify-end">
          <p className="text-sm text-emerald-100/75">Audience active</p>
          <div
            style={DISPLAY_FONT}
            className="mt-1 text-6xl leading-none tracking-tight text-white tabular-nums sm:text-7xl"
          >
            {isLoading ? <Skeleton className="h-16 w-48" /> : fmt(totalUsers)}
          </div>

          <div
            role="img"
            aria-label={`Répartition : ${hostShare} % d'hôtes, ${tenantShare} % de locataires`}
            className="mt-6 flex h-2 overflow-hidden rounded-full bg-white/10"
          >
            <div className="bg-[#F1DFB6]" style={{ width: `${hostShare}%` }} />
            <div className="bg-emerald-400/80" style={{ width: `${tenantShare}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-emerald-100/75">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F1DFB6]" />
              Hôtes {isLoading ? '' : `${hostShare} %`}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
              Locataires {isLoading ? '' : `${tenantShare} %`}
            </span>
          </div>
        </div>

        {/* Détail par segment */}
        <dl className="divide-y divide-[#F1DFB6]/15 border-y border-[#F1DFB6]/15">
          {/* Hôtes */}
          <div className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="inline-flex items-center gap-2 text-sm text-emerald-100/80">
                <ShieldCheck className="h-4 w-4 text-[#F1DFB6]" />
                Hôtes
              </dt>
              <dd className="text-2xl tabular-nums text-[#F1DFB6]" style={DISPLAY_FONT}>
                {isLoading ? <Skeleton className="h-7 w-14" /> : fmt(totalHotes)}
              </dd>
            </div>
            <p className="mt-1 text-xs text-emerald-100/60">Propriétaires avec véhicules en ligne</p>
          </div>

          {/* Locataires */}
          <div className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="inline-flex items-center gap-2 text-sm text-emerald-100/80">
                <Users className="h-4 w-4 text-emerald-300" />
                Locataires
              </dt>
              <dd className="text-2xl tabular-nums text-white" style={DISPLAY_FONT}>
                {isLoading ? <Skeleton className="h-7 w-14" /> : fmt(totalLocataires)}
              </dd>
            </div>
            <p className="mt-1 text-xs text-emerald-100/60">
              {isLoading
                ? 'Chargement…'
                : `${fmt(totalKycVerifies)} avec permis validé (${kycShare} %)`}
            </p>
            <MiniBar
              label={`${kycShare} % des locataires ont un KYC vérifié`}
              segments={[{ value: kycShare, className: 'bg-emerald-400/80' }]}
            />
          </div>

          {/* Portée push */}
          <div className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="inline-flex items-center gap-2 text-sm text-emerald-100/80">
                <Smartphone className="h-4 w-4 text-[#F1DFB6]" />
                Joignables en push
              </dt>
              <dd className="text-2xl tabular-nums text-white" style={DISPLAY_FONT}>
                {isLoading ? <Skeleton className="h-7 w-14" /> : fmt(pushTotal)}
              </dd>
            </div>
            <p className="mt-1 text-xs text-emerald-100/60">
              {isLoading
                ? 'Chargement…'
                : `Mobile ${fmt(pushMobile)}, web ${fmt(webPush)} (${pushCoverage} % de l'audience)`}
            </p>
            <MiniBar
              label={`${mobileSplit} % des appareils sont mobiles, le reste est web`}
              segments={[
                { value: mobileSplit, className: 'bg-[#F1DFB6]' },
                { value: pushTotal > 0 ? 100 - mobileSplit : 0, className: 'bg-emerald-400/80' },
              ]}
            />
          </div>
        </dl>
      </div>

      {/* Canaux disponibles */}
      <ul className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#F1DFB6]/15 pt-5">
        <li className="mr-2 text-xs text-emerald-100/60">Canaux d'envoi</li>
        {CHANNELS.map(({ label, Icon }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-xs text-emerald-50"
          >
            <Icon className="h-3.5 w-3.5 text-[#F1DFB6]" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}