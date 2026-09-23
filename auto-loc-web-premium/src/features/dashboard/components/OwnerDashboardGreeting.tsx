'use client';

import React, { useId } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { BellRing, CheckCircle2, Wallet, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { OWNER_ROUTES } from './dashboardUtils';

interface OwnerDashboardGreetingProps {
  prenom: string | undefined;
  checkinsCount?: number;
  checkoutsCount?: number;
  demandesCount?: number;
  soldeRetirableWallet?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastRefreshedAt?: Date | null;
}

/** Accord français : 0 et 1 au singulier, à partir de 2 au pluriel. */
const plural = (n: number, one: string, many: string) => (n > 1 ? many : one);

const PILL =
  'inline-flex items-center justify-center gap-2.5 rounded-full border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2 md:py-2.5';
const PILL_PRIMARY = 'border-[#0A3D2E] bg-[#0A3D2E] text-[#F1DFB6] hover:bg-[#0F4F3B]';

const Num: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className="font-semibold tabular-nums text-[#041912]">{children}</strong>
);

export const OwnerDashboardGreeting: React.FC<OwnerDashboardGreetingProps> = ({
  prenom,
  checkinsCount = 0,
  checkoutsCount = 0,
  demandesCount = 0,
  soldeRetirableWallet = 0,
  onRefresh,
  isRefreshing = false,
  lastRefreshedAt,
}) => {
  const titleId = useId();
  const reduceMotion = useReducedMotion();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const rawDate = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dateStr = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const formattedRefreshedTime = lastRefreshedAt
    ? lastRefreshedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : undefined;

  const stats = [
    {
      key: 'checkins',
      count: checkinsCount,
      label: plural(checkinsCount, 'Check-in prévu', 'Check-ins prévus'),
      needsAction: false,
    },
    {
      key: 'checkouts',
      count: checkoutsCount,
      label: plural(checkoutsCount, 'Check-out prévu', 'Check-outs prévus'),
      needsAction: false,
    },
    {
      key: 'demandes',
      count: demandesCount,
      label: plural(demandesCount, 'Demande en attente', 'Demandes en attente'),
      needsAction: true,
    },
  ];

  const hasActivity = stats.some((s) => s.count > 0);
  const hasDemandes = demandesCount > 0;
  const canWithdraw = soldeRetirableWallet > 0;

  const parts: React.ReactNode[] = [];
  if (checkinsCount > 0)
    parts.push(
      <>
        <Num>{checkinsCount}</Num> {plural(checkinsCount, 'check-in prévu', 'check-ins prévus')}
      </>,
    );
  if (checkoutsCount > 0)
    parts.push(
      <>
        <Num>{checkoutsCount}</Num> {plural(checkoutsCount, 'check-out prévu', 'check-outs prévus')}
      </>,
    );
  if (demandesCount > 0)
    parts.push(
      <>
        <Num>{demandesCount}</Num> {plural(demandesCount, 'demande en attente', 'demandes en attente')}
      </>,
    );

  const calm = (
    <>
      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0A3D2E]" aria-hidden="true" />
      Aucune action urgente pour le moment
    </>
  );

  return (
    <motion.section
      aria-labelledby={titleId}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8"
    >
      <div className="min-w-0 space-y-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1
              id={titleId}
              suppressHydrationWarning
              className="font-display text-[2rem] font-normal leading-[1.1] tracking-tight text-[#041912] md:text-4xl"
            >
              {greeting}
              {prenom ? `, ${prenom}` : ''}
              <span aria-hidden="true" className="md:hidden">
                {' '}
                👋
              </span>
            </h1>

            {/* Badge de Synchronisation Manuelle UX */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Rafraîchir les données du dashboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#0A3D2E]/15 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-[#0A3D2E]/30 hover:bg-[#0A3D2E]/5 disabled:opacity-60"
              >
                <RefreshCw className="h-3.5 w-3.5 text-[#0A3D2E]" />
                <span>{isRefreshing ? 'Mise à jour...' : formattedRefreshedTime ? `Synchro ${formattedRefreshedTime}` : 'Rafraîchir'}</span>
                {isRefreshing && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            )}
          </div>

          <p suppressHydrationWarning className="text-sm text-slate-500">
            {dateStr}
          </p>
        </div>

        {/* Mobile : résumé du jour en une phrase */}
        <p className="flex items-center gap-2 text-[15px] leading-relaxed text-slate-600 md:hidden">
          {hasActivity ? (
            <span>
              Aujourd’hui,{' '}
              {parts.map((part, i) => (
                <React.Fragment key={i}>
                  {i > 0 ? (i === parts.length - 1 ? ' et ' : ', ') : ''}
                  {part}
                </React.Fragment>
              ))}
              .
            </span>
          ) : (
            calm
          )}
        </p>

        {/* Actions du moment */}
        {(hasDemandes || canWithdraw) && (
          <div className="flex flex-wrap gap-2.5">
            {hasDemandes && (
              <Link href={OWNER_ROUTES.reservations} className={`${PILL} ${PILL_PRIMARY}`}>
                <BellRing className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                {plural(demandesCount, 'Traiter la demande', 'Traiter les demandes')}
              </Link>
            )}
            {canWithdraw && (
              <Link href={OWNER_ROUTES.wallet} className={`${PILL} ${PILL_PRIMARY} md:hidden`}>
                <Wallet className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Retirer mes gains
                <span className="rounded-full bg-[#F1DFB6] px-2 py-0.5 text-xs font-semibold tabular-nums text-[#041912]">
                  {formatCurrency(soldeRetirableWallet)} FCFA
                </span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Desktop : bandeau de chiffres */}
      <div className="hidden md:block">
        {hasActivity ? (
          <ul
            aria-label="Résumé de votre activité"
            className="grid min-w-[26rem] grid-cols-3 divide-x divide-[#0A3D2E]/10 overflow-hidden rounded-2xl border border-[#0A3D2E]/10 bg-white"
          >
            {stats.map(({ key, count, label, needsAction }) => {
              const active = count > 0;
              return (
                <li
                  key={key}
                  className={`flex min-w-0 flex-col gap-1.5 px-6 py-4 ${
                    active && needsAction ? 'bg-[#F1DFB6]/40' : ''
                  }`}
                >
                  <span
                    className={`font-display text-3xl leading-none tabular-nums ${
                      active ? 'text-[#0A3D2E]' : 'text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                  <span
                    className={`text-xs leading-tight ${
                      active ? 'font-medium text-slate-700' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="inline-flex items-center gap-2 rounded-full border border-[#0A3D2E]/10 bg-white px-4 py-2 text-sm text-slate-600">
            {calm}
          </p>
        )}
      </div>
    </motion.section>
  );
};