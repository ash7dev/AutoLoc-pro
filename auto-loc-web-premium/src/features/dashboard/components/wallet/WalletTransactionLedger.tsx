'use client';

import React from 'react';
import { Search, ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, FileText, SearchX, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { WalletTransactionItem } from '../../../../core/api/walletApi';
import type { WalletFilterState } from '../../hooks/useOwnerWalletView';

const WalletLedgerEmptyState: React.FC<{
  tab: 'ALL' | 'GAINS' | 'RETRAITS' | 'PENALITES';
  searchQuery: string;
  onReset: () => void;
}> = ({ tab, searchQuery, onReset }) => {
  let title = 'Aucune transaction enregistrée';
  let description = 'L’historique de vos mouvements financiers apparaîtra ici au fur et à mesure de vos activités.';
  let IconComp: any = FileText;

  if (searchQuery) {
    title = `Aucun résultat pour « ${searchQuery} »`;
    description = 'Aucune opération ne correspond à votre recherche. Vérifiez l’orthographe ou réinitialisez le filtre.';
    IconComp = SearchX;
  } else if (tab === 'GAINS') {
    title = 'Aucun gain de location pour le moment';
    description = 'Vos revenus de location apparaîtront automatiquement dès qu’une réservation franchit la validation check-in.';
    IconComp = ArrowDownLeft;
  } else if (tab === 'RETRAITS') {
    title = 'Aucun virement Mobile Money';
    description = 'Vous n’avez pas encore effectué de demande de retrait vers Wave ou Orange Money.';
    IconComp = ArrowUpRight;
  } else if (tab === 'PENALITES') {
    title = 'Aucune pénalité enregistrée';
    description = 'Excellente nouvelle ! Votre compte ne comporte aucune retenue pour annulation tardive ni pénalité d’infraction.';
    IconComp = ShieldCheck;
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center sm:p-12 my-2 w-full">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#059669] shadow-xs ring-1 ring-slate-200/80 mb-4">
        <IconComp className="h-7 w-7 text-[#059669]" />
      </div>
      <h3 className="font-fraunces text-lg sm:text-xl font-normal text-[#041912]">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed">
        {description}
      </p>
      {(searchQuery || tab !== 'ALL') && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#041912] px-4 py-2 text-xs font-bold text-[#F1DFB6] shadow-xs hover:bg-[#0A3D2E] transition-all cursor-pointer"
        >
          Réinitialiser tous les filtres
        </button>
      )}
    </div>
  );
};



interface WalletTransactionLedgerProps {
  transactions: WalletTransactionItem[];
  total: number;
  page: number;
  totalPages: number;
  filters: WalletFilterState;
  onFilterChange: (newFilters: WalletFilterState) => void;
  onSelectTransaction: (tx: WalletTransactionItem) => void;
  isLoading?: boolean;
}

export const WalletTransactionLedger: React.FC<WalletTransactionLedgerProps> = ({
  transactions,
  total,
  page,
  totalPages,
  filters,
  onFilterChange,
  onSelectTransaction,
  isLoading = false,
}) => {
  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  // Label and Icon helper
  const getTxTypeInfo = (type: string, sens: 'CREDIT' | 'DEBIT', fournisseur?: string) => {
    if (type === 'CREDIT_LOCATION') {
      return {
        title: 'Gain de location',
        desc: 'Revenu encaissé suite à un check-in validé',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badge: 'Gains',
        isCredit: true,
      };
    }
    if (type === 'RETRAIT' || sens === 'DEBIT') {
      if (type === 'PENALITE_DEBIT') {
        return {
          title: 'Retenue pour pénalité',
          desc: 'Infraction ou annulation hors délais',
          color: 'text-amber-800 bg-amber-50 border-amber-200',
          badge: 'Pénalité',
          isCredit: false,
        };
      }
      return {
        title: `Virement vers ${fournisseur === 'ORANGE_MONEY' ? 'Orange Money' : 'Wave'}`,
        desc: 'Retrait de solde vers compte mobile money',
        color: 'text-slate-700 bg-slate-100 border-slate-200',
        badge: 'Retrait',
        isCredit: false,
      };
    }
    return {
      title: type,
      desc: 'Mouvement financier',
      color: 'text-slate-700 bg-slate-50 border-slate-200',
      badge: 'Transaction',
      isCredit: sens === 'CREDIT',
    };
  };

  // Filter client-side by tab and search query
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Tab filtering
    if (filters.tab === 'GAINS') {
      const isGain = tx.type === 'CREDIT_LOCATION' || tx.sens === 'CREDIT';
      if (!isGain) return false;
    } else if (filters.tab === 'RETRAITS') {
      const isRetrait = (tx.type === 'RETRAIT' || tx.sens === 'DEBIT') && tx.type !== 'PENALITE_DEBIT' && tx.type !== 'PENALITE';
      if (!isRetrait) return false;
    } else if (filters.tab === 'PENALITES') {
      const isPenalite = tx.type === 'PENALITE_DEBIT' || tx.type === 'PENALITE';
      if (!isPenalite) return false;
    }

    // 2. Search query filtering
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const montant = tx.montant?.toString() || '';
      const resId = tx.reservationId || '';
      const type = tx.type || '';
      const provider = tx.fournisseur || '';
      const matches =
        montant.includes(q) ||
        resId.toLowerCase().includes(q) ||
        type.toLowerCase().includes(q) ||
        provider.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      {/* Header Ledger */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <h2 className="font-fraunces text-xl sm:text-3xl font-normal tracking-tight text-[#041912]">
              Grand Livre des Transactions
            </h2>
            <span className="whitespace-nowrap shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {filteredTransactions.length} {filteredTransactions.length > 1 ? 'opérations' : 'opération'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Historique certifié de tous les crédits de location, virement mobile money et déductions.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Rechercher montant, réf..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 pb-3 scrollbar-none">
        {[
          { key: 'ALL', label: 'Toutes les opérations' },
          { key: 'GAINS', label: 'Gains de location' },
          { key: 'RETRAITS', label: 'Retraits Mobile Money' },
          { key: 'PENALITES', label: 'Pénalités & Retenues' },
        ].map((tabItem) => {
          const isActive = filters.tab === tabItem.key;
          return (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => onFilterChange({ ...filters, tab: tabItem.key as any, page: 1 })}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${isActive
                  ? 'bg-[#041912] text-[#F1DFB6] shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
            >
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {/* MOBILE LIST VIEW (< sm) */}
      <div className="space-y-3 sm:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))
        ) : filteredTransactions.length === 0 ? (
          <WalletLedgerEmptyState
            tab={filters.tab}
            searchQuery={filters.searchQuery}
            onReset={() => onFilterChange({ ...filters, tab: 'ALL', searchQuery: '', page: 1 })}
          />
        ) : (
          filteredTransactions.map((tx) => {
            const info = getTxTypeInfo(tx.type, tx.sens, tx.fournisseur);
            const isCredit = tx.sens === 'CREDIT';
            const numericMontant = parseFloat(tx.montant || '0');
            const numericSoldeApres = parseFloat(tx.soldeApres || '0');

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3 hover:bg-slate-100/60 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${info.color}`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">{info.title}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{formatDate(tx.creeLe)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-fraunces font-bold text-sm sm:text-base tabular-nums ${isCredit ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {isCredit ? '+' : '-'}&nbsp;{formatCurrency(numericMontant)} <span className="font-sans text-[10px] text-slate-400 font-normal">FCFA</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Solde: <span className="font-fraunces font-semibold tabular-nums">{formatCurrency(numericSoldeApres)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-xs">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                    {tx.fournisseur === 'WAVE' ? (
                      <>
                        <img src="/wave.png" alt="Wave" className="h-3.5 w-3.5 object-contain" />
                        Wave
                      </>
                    ) : tx.fournisseur === 'ORANGE_MONEY' ? (
                      <>
                        <img src="/orange.png" alt="OM" className="h-3.5 w-3.5 object-contain" />
                        Orange Money
                      </>
                    ) : (
                      'AutoLoc Core'
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTransaction(tx);
                    }}
                    className="font-bold text-[#059669] hover:underline text-xs cursor-pointer"
                  >
                    Reçu &rarr;
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (>= sm) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="pb-3 font-semibold">Opération & Intitulé</th>
              <th className="pb-3 font-semibold">Méthode / Service</th>
              <th className="pb-3 font-semibold">Date & Heure</th>
              <th className="pb-3 text-right font-semibold">Montant (FCFA)</th>
              <th className="pb-3 text-right font-semibold">Solde Après</th>
              <th className="pb-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4"><div className="h-4 w-40 rounded bg-slate-100" /></td>
                  <td className="py-4"><div className="h-4 w-20 rounded bg-slate-100" /></td>
                  <td className="py-4"><div className="h-4 w-28 rounded bg-slate-100" /></td>
                  <td className="py-4"><div className="h-4 w-20 rounded bg-slate-100 ml-auto" /></td>
                  <td className="py-4"><div className="h-4 w-20 rounded bg-slate-100 ml-auto" /></td>
                  <td className="py-4"><div className="h-4 w-12 rounded bg-slate-100 ml-auto" /></td>
                </tr>
              ))
        ) : filteredTransactions.length === 0 ? (
          <tr>
            <td colSpan={6} className="py-6">
              <WalletLedgerEmptyState
                tab={filters.tab}
                searchQuery={filters.searchQuery}
                onReset={() => onFilterChange({ ...filters, tab: 'ALL', searchQuery: '', page: 1 })}
              />
            </td>
          </tr>
        ) : (
              filteredTransactions.map((tx) => {
                const info = getTxTypeInfo(tx.type, tx.sens, tx.fournisseur);
                const isCredit = tx.sens === 'CREDIT';
                const numericMontant = parseFloat(tx.montant || '0');
                const numericSoldeApres = parseFloat(tx.soldeApres || '0');

                return (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    {/* Opération & Intitulé */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${info.color}`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-[#059669] transition-colors">
                            {info.title}
                          </p>
                          <p className="text-[11px] text-slate-500">{info.desc}</p>
                        </div>
                      </div>
                    </td>

                    {/* Méthode / Service */}
                    <td className="py-4">
                      {tx.fournisseur === 'WAVE' ? (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-sky-100 bg-sky-50/80 px-2 py-1 text-xs font-semibold text-sky-800">
                          <img src="/wave.png" alt="Wave" className="h-4 w-4 object-contain" />
                          <span>Wave</span>
                        </div>
                      ) : tx.fournisseur === 'ORANGE_MONEY' ? (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-orange-100 bg-orange-50/80 px-2 py-1 text-xs font-semibold text-orange-800">
                          <img src="/orange.png" alt="OM" className="h-4 w-4 object-contain" />
                          <span>Orange Money</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">AutoLoc Core</span>
                      )}
                    </td>

                    {/* Date & Heure */}
                    <td className="py-4 font-mono text-xs text-slate-600">
                      {formatDate(tx.creeLe)}
                    </td>

                    {/* Montant */}
                    <td className="py-4 text-right font-fraunces font-bold text-[#041912] text-base tabular-nums">
                      <span className={isCredit ? 'text-emerald-700' : 'text-slate-900'}>
                        {isCredit ? '+' : '-'}&nbsp;{formatCurrency(numericMontant)}
                      </span>
                    </td>

                    {/* Solde Après */}
                    <td className="py-4 text-right font-fraunces text-xs text-slate-500 tabular-nums">
                      {formatCurrency(numericSoldeApres)} FCFA
                    </td>

                    {/* Action button */}
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(tx);
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        Reçu &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>


      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
          <p className="text-slate-500">
            Page <span className="font-bold text-slate-900">{page}</span> sur{' '}
            <span className="font-bold text-slate-900">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, page: Math.max(1, page - 1) })}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Précédent</span>
            </button>

            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, page: Math.min(totalPages, page + 1) })}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <span>Suivant</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
