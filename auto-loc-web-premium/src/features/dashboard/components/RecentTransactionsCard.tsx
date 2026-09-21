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

const isPending = (statut: string | undefined) => /ATTENTE|PENDING|EN_COURS/i.test(statut ?? '');

/** "RETRAIT_WAVE" -> "Retrait wave" */
const humanize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ').toLowerCase();

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
            className="rounded-md text-sm font-medium text-[#0A3D2E] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2"
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

            return (
              <li key={t.id ?? `${label}-${i}`} className="flex items-center gap-4 py-3.5">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${debit ? 'bg-slate-100 text-slate-600' : 'bg-[#0A3D2E]/[0.08] text-[#0A3D2E]'
                    }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#041912]">{label}</p>
                  <p className="text-xs text-slate-500">
                    {date}
                    {isPending(t.statut) && (
                      <span className="ml-2 rounded-full bg-[#F1DFB6]/60 px-2 py-0.5 font-semibold text-[#5C4410]">
                        En cours
                      </span>
                    )}
                  </p>
                </div>

                <p
                  className={`shrink-0 text-sm font-semibold tabular-nums ${debit ? 'text-slate-700' : 'text-[#0A3D2E]'
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