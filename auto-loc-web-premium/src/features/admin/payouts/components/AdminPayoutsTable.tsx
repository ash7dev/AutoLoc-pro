'use client';

import React, { useEffect, useRef } from 'react';
import { Eye, ShieldCheck, Loader2, ChevronDown, Check, Inbox } from 'lucide-react';
import type { AdminWithdrawalItem } from '../../../../core/api/adminPayoutsApi';

interface AdminPayoutsTableProps {
  items: AdminWithdrawalItem[];
  totalItems: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  onSelect: (id: string) => void;
  isLoadingInitial: boolean;
}

const DISPLAY_FONT = { fontFamily: 'var(--font-gloock, Georgia, "Times New Roman", serif)' };
const GOLD = '#b27c2d';

const TEXT = 'text-slate-900';
const MUTED = 'text-slate-500';

const fmt = (n: number) => n.toLocaleString('fr-FR');

const NEUTRAL_BADGE = 'bg-slate-100 text-slate-600 ring-slate-500/20';

const STATUS: Record<string, { label: string; badge: string; dot: string }> = {
  EFFECTUE: {
    label: 'Effectué',
    badge: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
    dot: 'bg-emerald-500',
  },
  REJETE: {
    label: 'Rejeté',
    badge: 'bg-rose-50 text-rose-800 ring-rose-600/20',
    dot: 'bg-rose-500',
  },
  EN_ATTENTE: {
    label: 'En attente',
    badge: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    dot: 'bg-amber-500',
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const humanize = (v?: string | null) => {
  if (!v) return 'Inconnu';
  const t = v.replace(/_/g, ' ').toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const initialsOf = (name?: string | null) =>
  (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

const fmtDate = (v: string | number | Date) => {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return { date: '–', time: '' };
  return {
    date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
};

/* ------------------------------------------------------------------ */
/* Sous-composants                                                     */
/* ------------------------------------------------------------------ */
function StatusBadge({ statut }: { statut: string }) {
  const st = STATUS[statut] ?? { label: humanize(statut), badge: NEUTRAL_BADGE, dot: 'bg-slate-400' };
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${st.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
      {st.label}
    </span>
  );
}

function BeneficiaryCell({ item }: { item: AdminWithdrawalItem }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        style={DISPLAY_FONT}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A3D2E] text-sm text-[#F1DFB6]"
      >
        {initialsOf(item.ownerName)}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-sm font-semibold ${TEXT}`}>{item.ownerName}</span>
          {item.ownerKycStatus === 'VALIDE' && (
            <span title="KYC validé" className="shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="sr-only">KYC validé</span>
            </span>
          )}
        </div>
        <p className={`truncate text-xs ${MUTED}`}>{item.ownerPhone || item.ownerEmail || '–'}</p>
      </div>
    </div>
  );
}

function ChannelCell({ item }: { item: AdminWithdrawalItem }) {
  const isWave = item.method === 'WAVE';
  return (
    <div>
      <div className={`flex items-center gap-2 text-sm font-medium ${TEXT}`}>
        <span className={`h-2 w-2 rounded-full ${isWave ? 'bg-sky-400' : 'bg-orange-400'}`} />
        {isWave ? 'Wave' : 'Orange Money'}
      </div>
      <p className={`mt-0.5 font-mono text-xs tabular-nums ${MUTED}`}>{item.numeroDestinataire}</p>
    </div>
  );
}

function AmountCell({ item }: { item: AdminWithdrawalItem }) {
  return (
    <div className="whitespace-nowrap">
      <div className="flex items-baseline gap-1.5">
        <span style={DISPLAY_FONT} className="text-xl tabular-nums text-[#0A3D2E]">
          {fmt(item.amount)}
        </span>
        <span className={`text-xs ${MUTED}`}>FCFA</span>
      </div>
      <p className={`mt-0.5 text-xs tabular-nums ${MUTED}`}>
        Solde wallet : {fmt(item.walletBalance)} FCFA
      </p>
    </div>
  );
}

function StatusCell({ item }: { item: AdminWithdrawalItem }) {
  return (
    <div className="space-y-1.5">
      <StatusBadge statut={item.statut} />
      {item.idTransactionFournisseur && (
        <p
          title={item.idTransactionFournisseur}
          className={`max-w-[150px] truncate font-mono text-xs ${MUTED}`}
        >
          ID : {item.idTransactionFournisseur}
        </p>
      )}
    </div>
  );
}

function Skel({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded-md bg-slate-100 motion-reduce:animate-none ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */
export const AdminPayoutsTable: React.FC<AdminPayoutsTableProps> = ({
  items,
  totalItems,
  hasMore,
  isLoadingMore,
  loadMore,
  onSelect,
  isLoadingInitial,
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Scroll infini
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) loadMore();
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  const shell =
    'overflow-hidden rounded-[28px] border border-[#0A3D2E]/10 bg-white shadow-[0_20px_50px_-30px_rgba(10,61,46,0.35)]';

  /* Chargement initial */
  if (isLoadingInitial) {
    return (
      <div className={shell} aria-busy="true">
        <span className="sr-only">Chargement des retraits</span>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-6 py-5">
              <div className="flex flex-1 items-center gap-3">
                <Skel className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skel className="h-4 w-36" />
                  <Skel className="h-3 w-24" />
                </div>
              </div>
              <Skel className="hidden h-8 w-28 md:block" />
              <Skel className="hidden h-8 w-32 md:block" />
              <Skel className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* État vide */
  if (items.length === 0) {
    return (
      <div className={`${shell} flex flex-col items-center px-6 py-16 text-center`}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0A3D2E] text-[#F1DFB6]">
          <Inbox className="h-6 w-6" />
        </span>
        <p style={DISPLAY_FONT} className="mt-5 text-xl text-[#0A3D2E]">
          Aucun retrait trouvé
        </p>
        <p className={`mt-1 max-w-sm text-sm ${MUTED}`}>
          Aucune transaction ne correspond à vos critères de recherche.
        </p>
      </div>
    );
  }

  const total = Math.max(totalItems, items.length);
  const remaining = Math.max(0, total - items.length);
  const loadedShare = total > 0 ? Math.round((items.length / total) * 100) : 100;
  const thCls = `px-6 py-3.5 text-xs font-medium ${MUTED}`;

  return (
    <div className={shell}>
      {/* Tableau (tablette et bureau) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Retraits et virements des hôtes</caption>
          <thead>
            <tr className="border-b border-slate-200/80">
              <th scope="col" className={thCls}>Bénéficiaire</th>
              <th scope="col" className={thCls}>Canal</th>
              <th scope="col" className={thCls}>Montant</th>
              <th scope="col" className={thCls}>Statut</th>
              <th scope="col" className={thCls}>Demandé le</th>
              <th scope="col" className={`${thCls} text-right`}>
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const { date, time } = fmtDate(item.demandeeLe);
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className="cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-[#0A3D2E]/[0.04]"
                >
                  <td
                    className="max-w-[260px] px-6 py-4"
                    style={
                      item.statut === 'EN_ATTENTE'
                        ? { boxShadow: `inset 3px 0 0 0 ${GOLD}` }
                        : undefined
                    }
                  >
                    <BeneficiaryCell item={item} />
                  </td>
                  <td className="px-6 py-4"><ChannelCell item={item} /></td>
                  <td className="px-6 py-4"><AmountCell item={item} /></td>
                  <td className="px-6 py-4"><StatusCell item={item} /></td>
                  <td className="whitespace-nowrap px-6 py-4 leading-tight">
                    <div className="text-sm text-slate-700">{date}</div>
                    <div className={`text-xs tabular-nums ${MUTED}`}>{time}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item.id);
                      }}
                      aria-label={`Inspecter le retrait de ${item.ownerName}`}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#0A3D2E]/25 px-3.5 py-1.5 text-sm font-medium text-[#0A3D2E] transition hover:border-[#0A3D2E] hover:bg-[#0A3D2E] hover:text-[#F1DFB6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Inspecter
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cartes (mobile) */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {items.map((item) => {
          const { date, time } = fmtDate(item.demandeeLe);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-label={`Inspecter le retrait de ${item.ownerName}`}
                className="block w-full space-y-4 p-4 text-left transition-colors hover:bg-[#0A3D2E]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0A3D2E]"
                style={
                  item.statut === 'EN_ATTENTE' ? { boxShadow: `inset 3px 0 0 0 ${GOLD}` } : undefined
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <BeneficiaryCell item={item} />
                  <StatusBadge statut={item.statut} />
                </div>

                <div className="flex items-end justify-between gap-3">
                  <AmountCell item={item} />
                  <ChannelCell item={item} />
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
                  <span className={MUTED}>
                    {date}
                    {time && <span className="tabular-nums">, {time}</span>}
                  </span>
                  {item.idTransactionFournisseur && (
                    <span className={`max-w-[150px] truncate font-mono ${MUTED}`}>
                      ID : {item.idTransactionFournisseur}
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Pied : scroll infini */}
      <div
        ref={sentinelRef}
        aria-live="polite"
        className="border-t border-slate-200/80 bg-[#F6F7F5] px-5 py-4"
      >
        {isLoadingMore ? (
          <div className={`flex items-center justify-center gap-2.5 py-1 text-sm ${MUTED}`}>
            <Loader2 className="h-4 w-4 animate-spin text-[#0A3D2E] motion-reduce:animate-none" />
            Chargement des retraits suivants…
          </div>
        ) : hasMore ? (
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className={`text-sm tabular-nums ${MUTED}`}>
                <span className={`font-semibold ${TEXT}`}>{items.length}</span> sur{' '}
                <span className={`font-semibold ${TEXT}`}>{total}</span> transactions
              </p>
              <div aria-hidden className="mt-2 h-1 w-40 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-[#0A3D2E]" style={{ width: `${loadedShare}%` }} />
              </div>
            </div>
            <button
              type="button"
              onClick={loadMore}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-5 py-2.5 text-sm font-semibold text-[#F1DFB6] shadow-md shadow-[#0A3D2E]/20 transition hover:bg-[#0D4B39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2"
            >
              Charger la suite
              <ChevronDown className="h-4 w-4" />
              {remaining > 0 && (
                <span className="rounded-full bg-[#F1DFB6]/20 px-2 text-xs tabular-nums">
                  +{remaining}
                </span>
              )}
            </button>
          </div>
        ) : (
          <p className={`flex items-center justify-center gap-2 py-1 text-sm ${MUTED}`}>
            <Check className="h-4 w-4 text-[#0A3D2E]" />
            {items.length} transaction{items.length > 1 ? 's' : ''} sur {total}, tout est chargé
          </p>
        )}
      </div>
    </div>
  );
};