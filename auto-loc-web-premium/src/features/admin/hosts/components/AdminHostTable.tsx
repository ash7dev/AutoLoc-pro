'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, ShieldOff, Eye, SearchX } from 'lucide-react';
import { HostItem } from '../hooks/useAdminHosts';

interface AdminHostTableProps {
  items: HostItem[];
  isLoading?: boolean;
  onSelectHost: (host: HostItem) => void;
}

const FOREST = '#0A3D2E';
const CHAMPAGNE = '#F1DFB6';
const GOLD = '#b27c2d';
const RUST = '#a13d3d';

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A3D2E] dark:focus-visible:outline-[#F1DFB6]';

const CARD =
  'rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n > 1 ? many : one}`;

const KYC_BADGES: Record<
  string,
  { label: string; tone: string; bg: string; Icon: React.ElementType }
> = {
  VERIFIE: { label: 'Vérifié', tone: FOREST, bg: 'rgba(10, 61, 46, 0.09)', Icon: ShieldCheck },
  EN_ATTENTE: { label: 'En attente', tone: GOLD, bg: 'rgba(178, 124, 45, 0.13)', Icon: ShieldAlert },
  REJETE: { label: 'Rejeté', tone: RUST, bg: 'rgba(161, 61, 61, 0.11)', Icon: ShieldX },
};
const KYC_DEFAULT = { label: 'Non vérifié', tone: '#64748b', bg: 'rgba(100, 116, 139, 0.12)', Icon: ShieldOff };

const HEAD = 'py-3 px-4 text-[12px] font-semibold text-slate-500 dark:text-slate-400';

export const AdminHostTable: React.FC<AdminHostTableProps> = ({ items, isLoading, onSelectHost }) => {
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
              <div className="hidden md:block h-6 w-24 rounded-full bg-slate-100 dark:bg-slate-800/60" />
              <div className="hidden md:block h-6 w-32 rounded bg-slate-100 dark:bg-slate-800/60" />
              <div className="h-9 w-24 rounded-full bg-slate-100 dark:bg-slate-800/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${CARD} px-6 py-14 text-center font-sans`}>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)' }}
        >
          <SearchX className="w-5 h-5" style={{ color: FOREST }} strokeWidth={1.75} />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Aucun hôte trouvé</h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
          Aucun propriétaire ne correspond à cette recherche. Essayez un autre nom ou changez de statut.
        </p>
      </div>
    );
  }

  return (
    <div className={`${CARD} overflow-hidden font-sans`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
              <th scope="col" className={HEAD}>Hôte</th>
              <th scope="col" className={HEAD}>Vérification KYC</th>
              <th scope="col" className={HEAD}>Flotte</th>
              <th scope="col" className={HEAD}>Activité</th>
              <th scope="col" className={HEAD}>Compte</th>
              <th scope="col" className={`${HEAD} text-right`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
            {items.map((item) => {
              const u = item.utilisateur;
              const name = u?.fullName || item.email.split('@')[0];
              const initials = ((u?.prenom?.[0] || '') + (u?.nom?.[0] || '')).toUpperCase() || 'H';

              const kyc = KYC_BADGES[item.statutKyc] ?? KYC_DEFAULT;
              const KycIcon = kyc.Icon;

              const { total, verified, pending } = item.fleetStats;
              const otherVehicles = Math.max(total - verified - pending, 0);

              // Liseré gauche : signale les hôtes qui demandent une action
              const accent = item.isBanned || item.statutKyc === 'REJETE'
                ? RUST
                : item.statutKyc === 'EN_ATTENTE'
                  ? GOLD
                  : undefined;

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectHost(item)}
                  className="group cursor-pointer hover:bg-[#0A3D2E]/[0.03] dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Identité */}
                  <td
                    className="py-3.5 px-4"
                    style={accent ? { boxShadow: `inset 3px 0 0 0 ${accent}` } : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden text-[13px] font-semibold ring-1 ring-inset ring-[#F1DFB6]/25"
                        style={{ backgroundColor: FOREST, color: CHAMPAGNE }}
                      >
                        {u?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span aria-hidden="true">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[240px]">{name}</p>
                        <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400 min-w-0">
                          <span className="truncate max-w-[200px]">{item.email}</span>
                          {item.phone && (
                            <>
                              <span aria-hidden="true" className="w-px h-3 bg-slate-200 dark:bg-slate-700 shrink-0" />
                              <span className="tabular-nums whitespace-nowrap">{item.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* KYC */}
                  <td className="py-3.5 px-4">
                    <span
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap"
                      style={{ backgroundColor: kyc.bg, color: kyc.tone }}
                    >
                      <KycIcon className="w-3.5 h-3.5" strokeWidth={2} />
                      {kyc.label}
                    </span>
                  </td>

                  {/* Flotte */}
                  <td className="py-3.5 px-4">
                    {total === 0 ? (
                      <span className="text-slate-400 dark:text-slate-500">Aucun véhicule</span>
                    ) : (
                      <div className="space-y-1.5 w-44">
                        <p className="font-semibold text-slate-900 dark:text-white tabular-nums">
                          {plural(total, 'véhicule')}
                        </p>
                        <div
                          role="img"
                          aria-label={`${verified} actifs, ${pending} en attente, ${otherVehicles} autres`}
                          className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800"
                        >
                          {verified > 0 && (
                            <div style={{ width: `${(verified / total) * 100}%`, backgroundColor: FOREST }} />
                          )}
                          {pending > 0 && (
                            <div style={{ width: `${(pending / total) * 100}%`, backgroundColor: GOLD }} />
                          )}
                          {otherVehicles > 0 && (
                            <div style={{ width: `${(otherVehicles / total) * 100}%`, backgroundColor: '#cbd5e1' }} />
                          )}
                        </div>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {verified > 0 && (
                            <span style={{ color: FOREST }} className="font-medium dark:!text-[#F1DFB6]">
                              {plural(verified, 'actif')}
                            </span>
                          )}
                          {verified > 0 && pending > 0 && ', '}
                          {pending > 0 && (
                            <span style={{ color: GOLD }} className="font-medium">
                              {pending} en attente
                            </span>
                          )}
                          {verified === 0 && pending === 0 && 'Aucun actif'}
                        </p>
                      </div>
                    )}
                  </td>

                  {/* Activité */}
                  <td className="py-3.5 px-4 tabular-nums">
                    {item.totalBookings > 0 ? (
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {plural(item.totalBookings, 'location')}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Aucune location</span>
                    )}
                  </td>

                  {/* Compte */}
                  <td className="py-3.5 px-4">
                    <span
                      className="inline-flex items-center gap-2 font-medium"
                      style={{ color: item.isBanned ? RUST : undefined }}
                    >
                      <span
                        aria-hidden="true"
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.isBanned ? RUST : FOREST }}
                      />
                      <span className={item.isBanned ? '' : 'text-slate-700 dark:text-slate-200'}>
                        {item.isBanned ? 'Banni' : 'Actif'}
                      </span>
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHost(item);
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

      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
        {plural(items.length, 'hôte')} affiché{items.length > 1 ? 's' : ''}
      </div>
    </div>
  );
};