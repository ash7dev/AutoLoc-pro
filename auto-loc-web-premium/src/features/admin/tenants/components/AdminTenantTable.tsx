'use client';

import React, { useRef, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, ShieldOff, FileText, Star, Eye, SearchX } from 'lucide-react';
import { TenantItem } from '../hooks/useAdminTenants';
import { formatCurrency } from '@/lib/utils';

interface AdminTenantTableProps {
  items: TenantItem[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  isReachingEnd?: boolean;
  totalItems?: number;
  onLoadMore?: () => void;
  onSelectTenant: (tenant: TenantItem) => void;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

const FOREST = '#0A3D2E';
const CHAMPAGNE = '#F1DFB6';
const GOLD = '#b27c2d';
const RUST = '#a13d3d';

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A3D2E] dark:focus-visible:outline-[#F1DFB6]';
const CARD = 'rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs';
const HEAD = 'py-3 px-4 text-[12px] font-semibold text-slate-500 dark:text-slate-400';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n > 1 ? many : one}`;

const KYC_BADGES: Record<string, { label: string; text: string; bg: string; Icon: React.ElementType }> = {
  VERIFIE: {
    label: 'KYC vérifié',
    text: 'text-[#0A3D2E] dark:text-[#F1DFB6]',
    bg: 'rgba(10, 61, 46, 0.09)',
    Icon: ShieldCheck,
  },
  EN_ATTENTE: {
    label: 'KYC en attente',
    text: 'text-[#8a5f1f] dark:text-[#e0b96a]',
    bg: 'rgba(178, 124, 45, 0.13)',
    Icon: ShieldAlert,
  },
  REJETE: {
    label: 'KYC rejeté',
    text: 'text-[#a13d3d] dark:text-[#e59a9a]',
    bg: 'rgba(161, 61, 61, 0.11)',
    Icon: ShieldX,
  },
};
const KYC_DEFAULT = {
  label: 'KYC non vérifié',
  text: 'text-slate-600 dark:text-slate-300',
  bg: 'rgba(100, 116, 139, 0.12)',
  Icon: ShieldOff,
};

const getInitials = (name: string) =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'L';

export const AdminTenantTable: React.FC<AdminTenantTableProps> = ({
  items,
  isLoading,
  isLoadingMore,
  isReachingEnd,
  totalItems,
  onLoadMore,
  onSelectTenant,
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onLoadMore || isReachingEnd || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onLoadMore, isReachingEnd, isLoading, isLoadingMore]);

  if (isLoading) {
    return (
      <div className={`${CARD} overflow-hidden`} aria-busy="true" aria-live="polite">
        <div className="h-11 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800" />
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse motion-reduce:animate-none">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-2.5 w-56 rounded bg-slate-100 dark:bg-slate-800/60" />
              </div>
              <div className="hidden md:block h-6 w-28 rounded-full bg-slate-100 dark:bg-slate-800/60" />
              <div className="hidden md:block h-6 w-32 rounded bg-slate-100 dark:bg-slate-800/60" />
              <div className="h-9 w-24 rounded-full bg-slate-100 dark:bg-slate-800/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={`${CARD} px-6 py-14 text-center font-sans`}>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)' }}
        >
          <SearchX className="w-5 h-5" style={{ color: FOREST }} strokeWidth={1.75} />
        </div>
        <h3 style={fontStyle} className="text-base font-normal text-slate-900 dark:text-white">
          Aucun locataire trouvé
        </h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
          Aucun conducteur ne correspond à cette recherche. Essayez un autre nom ou changez de statut.
        </p>
      </div>
    );
  }

  return (
    <div className={`${CARD} overflow-hidden font-sans`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
              <th scope="col" className={HEAD}>Locataire</th>
              <th scope="col" className={HEAD}>Vérification</th>
              <th scope="col" className={HEAD}>Note</th>
              <th scope="col" className={HEAD}>Réservations</th>
              <th scope="col" className={HEAD}>Dépenses cumulées</th>
              <th scope="col" className={`${HEAD} text-right`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
            {items.map((tenant) => {
              const u = tenant.utilisateur;
              const name = u?.fullName || tenant.email;
              const kyc = KYC_BADGES[tenant.statutKyc] ?? KYC_DEFAULT;
              const KycIcon = kyc.Icon;

              const { totalBookings, completedBookings, ongoingBookings, totalSpent } = tenant.tenantStats;
              const otherBookings = Math.max(totalBookings - completedBookings - ongoingBookings, 0);

              // Liseré gauche : signale les locataires qui demandent une action
              const accent =
                tenant.isBanned || tenant.statutKyc === 'REJETE'
                  ? RUST
                  : tenant.statutKyc === 'EN_ATTENTE' || (tenant.hasPermis && tenant.statutKyc !== 'VERIFIE')
                    ? GOLD
                    : undefined;

              return (
                <tr
                  key={tenant.id}
                  onClick={() => onSelectTenant(tenant)}
                  className="group cursor-pointer hover:bg-[#0A3D2E]/[0.03] dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Identité */}
                  <td className="py-3.5 px-4" style={accent ? { boxShadow: `inset 3px 0 0 0 ${accent}` } : undefined}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden text-[13px] font-semibold ring-1 ring-inset ring-[#F1DFB6]/25"
                        style={{ backgroundColor: FOREST, color: CHAMPAGNE }}
                      >
                        {u?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span aria-hidden="true">{getInitials(name)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">{name}</span>
                          {tenant.isBanned && (
                            <span
                              className="inline-flex items-center h-5 px-2 rounded-full text-[11px] font-semibold text-[#a13d3d] dark:text-[#e59a9a] shrink-0"
                              style={{ backgroundColor: 'rgba(161, 61, 61, 0.11)' }}
                            >
                              Banni
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400 min-w-0">
                          <span className="truncate max-w-[200px]">{tenant.email}</span>
                          {tenant.phone && (
                            <>
                              <span aria-hidden="true" className="w-px h-3 bg-slate-200 dark:bg-slate-700 shrink-0" />
                              <span className="tabular-nums whitespace-nowrap">{tenant.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Vérification : KYC et permis restent deux informations distinctes */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${kyc.text}`}
                        style={{ backgroundColor: kyc.bg }}
                      >
                        <KycIcon className="w-3.5 h-3.5" strokeWidth={2} />
                        {kyc.label}
                      </span>
                      <p
                        className={`flex items-center gap-1.5 text-[12px] ${tenant.hasPermis ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'
                          }`}
                      >
                        <FileText className="w-3.5 h-3.5" strokeWidth={1.75} />
                        {tenant.hasPermis ? 'Permis transmis' : 'Permis manquant'}
                      </p>
                    </div>
                  </td>

                  {/* Note */}
                  <td className="py-3.5 px-4 tabular-nums">
                    {tenant.noteLocataire > 0 ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
                        <Star className="w-3.5 h-3.5" style={{ color: GOLD, fill: GOLD }} />
                        {tenant.noteLocataire.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Aucune note</span>
                    )}
                  </td>

                  {/* Réservations */}
                  <td className="py-3.5 px-4">
                    {totalBookings === 0 ? (
                      <span className="text-slate-400 dark:text-slate-500">Aucune réservation</span>
                    ) : (
                      <div className="space-y-1.5 w-44">
                        <p className="font-semibold text-slate-900 dark:text-white tabular-nums">
                          {plural(totalBookings, 'réservation')}
                        </p>
                        <div
                          role="img"
                          aria-label={`${completedBookings} terminées, ${ongoingBookings} en cours, ${otherBookings} autres`}
                          className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800"
                        >
                          {completedBookings > 0 && (
                            <div style={{ width: `${(completedBookings / totalBookings) * 100}%`, backgroundColor: FOREST }} />
                          )}
                          {ongoingBookings > 0 && (
                            <div style={{ width: `${(ongoingBookings / totalBookings) * 100}%`, backgroundColor: GOLD }} />
                          )}
                          {otherBookings > 0 && (
                            <div style={{ width: `${(otherBookings / totalBookings) * 100}%`, backgroundColor: '#cbd5e1' }} />
                          )}
                        </div>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {completedBookings} terminées, {ongoingBookings} en cours
                        </p>
                      </div>
                    )}
                  </td>

                  {/* Dépenses */}
                  <td className="py-3.5 px-4 tabular-nums">
                    {totalSpent > 0 ? (
                      <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(totalSpent)}</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Aucune dépense</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTenant(tenant);
                      }}
                      aria-label={`Inspecter ${name}`}
                      className={`inline-flex items-center gap-2 h-9 px-4 rounded-full text-[13px] font-semibold cursor-pointer transition-colors hover:brightness-125 ${FOCUS}`}
                      style={{ backgroundColor: FOREST, color: CHAMPAGNE }}
                    >
                      <Eye className="w-4 h-4" strokeWidth={1.75} />
                      Inspecter
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Infinite Scroll Sentinel & Footer Summary */}
      {!isLoading && items.length > 0 && (
        <>
          {!isReachingEnd && (
            <div
              ref={loadMoreRef}
              className="py-5 flex items-center justify-center gap-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 text-[13px] font-medium"
            >
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: `${FOREST} transparent ${FOREST} ${FOREST}` }}
              />
              <span>Chargement des locataires suivants...</span>
            </div>
          )}

          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[12px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 tabular-nums">
            <span>
              Affichage de <strong className="font-semibold text-slate-900 dark:text-white">{items.length}</strong> sur{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">{totalItems ?? items.length}</strong>{' '}
              {plural(totalItems ?? items.length, 'locataire')}
            </span>

            {isReachingEnd && (
              <span className="text-slate-400 dark:text-slate-500 font-medium">
                Tous les locataires ont été chargés
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};