'use client';

import React from 'react';
import { History, Smartphone, Globe, Mail, MessageSquare } from 'lucide-react';
import type { BroadcastHistoryItem, BroadcastChannel } from '../../../../core/api/adminBroadcastApi';

interface AdminBroadcastHistoryTableProps {
  history: BroadcastHistoryItem[];
  isLoading?: boolean;
}

const DISPLAY_FONT = { fontFamily: 'var(--font-gloock, Georgia, "Times New Roman", serif)' };

const fmt = (n: number) => n.toLocaleString('fr-FR');

const CHANNEL_META: Partial<
  Record<BroadcastChannel, { label: string; icon: React.ComponentType<{ className?: string }> }>
> = {
  PUSH_MOBILE: { label: 'Push mobile', icon: Smartphone },
  WEB_PUSH: { label: 'Push web', icon: Globe },
  EMAIL: { label: 'Email', icon: Mail },
  WHATSAPP: { label: 'WhatsApp / SMS', icon: MessageSquare },
};

const AUDIENCE_LABELS: Record<string, string> = {
  TOUS: 'Tous les membres',
  HOTES: 'Hôtes',
  LOCATAIRES: 'Locataires',
  KYC_VALIDE: 'KYC vérifiés',
};

type StatusKey = 'DELIVERED' | 'PARTIAL' | 'FAILED';

const STATUS_STYLES: Record<
  StatusKey,
  { label: string; badge: string; dot: string; bar: string }
> = {
  DELIVERED: {
    label: 'Livré',
    badge: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
    dot: 'bg-emerald-500',
    bar: 'bg-brand-main',
  },
  PARTIAL: {
    label: 'Partiel',
    badge: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  FAILED: {
    label: 'Échec',
    badge: 'bg-rose-50 text-rose-800 ring-rose-600/20',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
  },
};

const statusOf = (status: string): StatusKey =>
  status === 'DELIVERED' ? 'DELIVERED' : status === 'PARTIAL' ? 'PARTIAL' : 'FAILED';

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
}

/* ------------------------------------------------------------------ */
/* Éléments partagés desktop / mobile                                  */
/* ------------------------------------------------------------------ */
function ChannelIcons({ channels }: { channels: BroadcastChannel[] }) {
  return (
    <ul className="flex items-center gap-1.5">
      {channels.map((ch) => {
        const meta = CHANNEL_META[ch];
        if (!meta) return null;
        const Icon = meta.icon;
        return (
          <li
            key={ch}
            title={meta.label}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-main/[0.06] text-brand-main"
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="sr-only">{meta.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[statusOf(status)];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function DeliveryCell({ item }: { item: BroadcastHistoryItem }) {
  if (item.totalRecipients <= 0) {
    return <span className="text-sm text-gray-400">–</span>;
  }
  const rate = Math.round((item.deliveredCount / item.totalRecipients) * 100);
  const bar = STATUS_STYLES[statusOf(item.status)].bar;
  return (
    <div className="flex items-center gap-3">
      <div aria-hidden className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${rate}%` }} />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-medium tabular-nums text-gray-900">{rate} %</div>
        <div className="text-xs tabular-nums text-gray-400">
          {fmt(item.deliveredCount)} / {fmt(item.totalRecipients)}
        </div>
      </div>
    </div>
  );
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded-md bg-gray-100 motion-reduce:animate-none ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */
export function AdminBroadcastHistoryTable({
  history,
  isLoading = false,
}: AdminBroadcastHistoryTableProps) {
  const totalSent = history.reduce((sum, h) => sum + h.totalRecipients, 0);
  const totalDelivered = history.reduce((sum, h) => sum + h.deliveredCount, 0);
  const globalRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : null;

  return (
    <section
      aria-label="Historique des diffusions"
      className="mt-8 rounded-[28px] border border-brand-main/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(10,61,46,0.35)] sm:p-8"
    >
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 style={DISPLAY_FONT} className="text-2xl leading-tight text-brand-main sm:text-3xl">
            Historique des diffusions
          </h2>
          <p className="mt-1 max-w-md text-sm text-gray-500">
            Chaque envoi, ses canaux et son taux de remise.
          </p>
        </div>

        {!isLoading && history.length > 0 && (
          <div className="shrink-0 text-right">
            <div
              style={DISPLAY_FONT}
              className="text-3xl leading-none tabular-nums text-brand-main sm:text-4xl"
            >
              {fmt(history.length)}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {history.length > 1 ? 'diffusions' : 'diffusion'}
              {globalRate !== null && <> · {globalRate} % livrés</>}
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        /* Squelettes */
        <div className="mt-2 divide-y divide-gray-100" aria-busy="true">
          <span className="sr-only">Chargement de l'historique</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 py-5">
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-2/5" />
                <SkeletonBlock className="h-3 w-3/5" />
              </div>
              <SkeletonBlock className="hidden h-6 w-24 md:block" />
              <SkeletonBlock className="hidden h-7 w-20 md:block" />
              <SkeletonBlock className="h-6 w-16" />
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        /* État vide */
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-main text-champagne">
            <History className="h-6 w-6" />
          </span>
          <p style={DISPLAY_FONT} className="mt-5 text-xl text-brand-main">
            Aucune diffusion pour le moment
          </p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Rédigez votre première diffusion dans le formulaire ci-dessus. Elle apparaîtra ici avec
            son taux de remise.
          </p>
        </div>
      ) : (
        <>
          {/* Tableau (tablette et bureau) */}
          <div className="mt-2 hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Historique des diffusions</caption>
              <thead>
                <tr className="border-b border-gray-200 text-xs font-medium text-gray-500">
                  <th scope="col" className="px-4 py-3">Diffusion</th>
                  <th scope="col" className="px-4 py-3">Audience</th>
                  <th scope="col" className="px-4 py-3">Canaux</th>
                  <th scope="col" className="px-4 py-3 text-right">Destinataires</th>
                  <th scope="col" className="px-4 py-3">Remise</th>
                  <th scope="col" className="px-4 py-3">Envoyée le</th>
                  <th scope="col" className="px-4 py-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const { date, time } = formatDate(item.sentAt);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 transition-colors last:border-0 hover:bg-brand-main/[0.03]"
                    >
                      <td className="max-w-[280px] px-4 py-4">
                        <div className="truncate text-sm font-semibold text-gray-900" title={item.title}>
                          {item.title}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500" title={item.message}>
                          {item.message}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                        {AUDIENCE_LABELS[item.targetAudience] ?? item.targetAudience}
                      </td>
                      <td className="px-4 py-4">
                        <ChannelIcons channels={item.channels} />
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium tabular-nums text-gray-900">
                        {fmt(item.totalRecipients)}
                      </td>
                      <td className="px-4 py-4">
                        <DeliveryCell item={item} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 leading-tight">
                        <div className="text-sm text-gray-700">{date}</div>
                        <div className="text-xs tabular-nums text-gray-400">{time}</div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cartes (mobile) */}
          <ul className="mt-4 space-y-3 md:hidden">
            {history.map((item) => {
              const { date, time } = formatDate(item.sentAt);
              return (
                <li key={item.id} className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">{item.title}</div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{item.message}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <ChannelIcons channels={item.channels} />
                    <span className="text-xs text-gray-500">
                      {AUDIENCE_LABELS[item.targetAudience] ?? item.targetAudience},{' '}
                      <span className="tabular-nums">{fmt(item.totalRecipients)}</span>
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-gray-100 pt-3">
                    <DeliveryCell item={item} />
                    <div className="text-right text-xs leading-tight text-gray-500">
                      <div>{date}</div>
                      <div className="tabular-nums text-gray-400">{time}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}