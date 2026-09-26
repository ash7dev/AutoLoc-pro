'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { DashboardCard, EmptyState, Skeleton } from './DashboardCard';
import { OWNER_ROUTES, formatShortDate, toNumber, type Amount } from './dashboardUtils';

/**
 * Champs attendus de GET /wallet/me. La liste est lue dans `transactions`
 * ou `recentTransactions` (la première présente).
 */
export interface WalletTransaction {
  id?: string;
  type?: string;
  montant?: Amount;
  description?: string;
  libelle?: string;
  statut?: string;
  createdAt?: string;
  date?: string;
}

export interface WalletTransactionsSource {
  transactions?: WalletTransaction[];
  recentTransactions?: WalletTransaction[];
}

interface RecentTransactionsCardProps {
  wallet?: WalletTransactionsSource;
  isLoading?: boolean;
}

const MAX_ITEMS = 5;

const isDebit = (type: string | undefined, amount: number) =>
  amount < 0 || /DEBIT|RETRAIT|WITHDRAW/i.test(type ?? '');

const humanize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ').toLowerCase();

const getStatusBadge = (statut?: string) => {
  if (!statut) return null;
  const s = statut.toUpperCase();
  if (/ATTENTE|PENDING|EN_COURS/i.test(s)) {
    return { text: 'En cours', className: 'bg-amber-100/80 text-amber-800 border border-amber-200/50' };
  }
  if (/VALIDE|SUCCESS|COMPLETE/i.test(s)) {
    return { text: 'Validé', className: 'bg-emerald-100/70 text-emerald-800 border border-emerald-200/50' };
  }
  if (/ECHOUE|FAILED|REJETE/i.test(s)) {
    return { text: 'Échoué', className: 'bg-rose-100/80 text-rose-800 border border-rose-200/50' };
  }
  return null;
};

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  wallet,
  isLoading = false,
}) => {
  const items = (wallet?.recentTransactions ?? wallet?.transactions ?? []).slice(0, MAX_ITEMS);

  return (
    <DashboardCard
      title="Dernières transactions"
      description="Mouvements de votre portefeuille"
      className="h-full"
      action={
        items.length > 0 ? (
          <Link
            href={OWNER_ROUTES.wallet}
            className="rounded-md text-sm font-medium text-brand-main underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2"
          >
            Ouvrir le wallet
          </Link>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Aucune transaction"
          text="Vos paiements reçus et vos retraits apparaîtront ici."
        />
      ) : (
        <ul className="divide-y divide-[#0A3D2E]/10">
          {items.map((t, i) => {
            const amount = toNumber(t.montant);
            const debit = isDebit(t.type, amount);
            const Icon = debit ? ArrowUpRight : ArrowDownLeft;
            const label = t.description ?? t.libelle ?? (t.type ? humanize(t.type) : 'Transaction');
            const date = formatShortDate(t.createdAt ?? t.date);
            const statusBadge = getStatusBadge(t.statut);

            return (
              <li key={t.id ?? `${label}-${i}`} className="flex items-center gap-4 py-3.5">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                    debit
                      ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200/60'
                      : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-brand-dark">{label}</p>
                    {statusBadge && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadge.className}`}>
                        {statusBadge.text}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-500">{date}</p>
                </div>

                <p
                  className={`shrink-0 text-sm font-bold tabular-nums ${
                    debit ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  <span className="sr-only">{debit ? 'Débit de ' : 'Crédit de '}</span>
                  {debit ? '−' : '+'}
                  {formatCurrency(Math.abs(amount))} FCFA
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
};