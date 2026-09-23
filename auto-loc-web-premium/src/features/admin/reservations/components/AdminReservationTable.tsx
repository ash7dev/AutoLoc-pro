'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Eye, ShieldCheck, Camera, CreditCard, Sparkles, Loader2, ArrowUpRight, SearchX, Clock } from 'lucide-react';
import type { AdminReservationQueueItem } from '../../../../core/api/adminAnalyticsApi';
import { formatCurrency } from '@/lib/utils';

interface AdminReservationTableProps {
  items: AdminReservationQueueItem[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  totalItems?: number;
  onLoadMore?: () => void;
  onSelectReservation: (reservation: AdminReservationQueueItem) => void;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const FOREST_DARK = '#062a1f';
const GOLD = '#b27c2d';
const CHAMPAGNE = '#F1DFB6';
const RUST = '#a13d3d';

const STATUT_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  INITIEE: { label: 'Initiée', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  EN_ATTENTE_PAIEMENT: { label: 'En attente paiement', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  PAYEE: { label: 'Payée (à valider)', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  CONFIRMEE: { label: 'Confirmée', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  EN_COURS: { label: 'Location en cours', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  TERMINEE: { label: 'Terminée', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  ANNULEE: { label: 'Annulée', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
  LITIGE: { label: 'Litige ouvert', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export const AdminReservationTable: React.FC<AdminReservationTableProps> = ({
  items,
  isLoading,
  isLoadingMore = false,
  hasMore = false,
  totalItems = 0,
  onLoadMore,
  onSelectReservation,
}) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite Scroll via Intersection Observer
  useEffect(() => {
    if (!hasMore || isLoadingMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
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
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (isLoading) {
    return (
      <div
        className="p-14 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm"
        style={fontStyle}
      >
        <div
          className="w-9 h-9 mx-auto border-[3px] border-t-transparent rounded-full animate-spin mb-3"
          style={{ borderColor: `${FOREST} transparent ${FOREST} ${FOREST}` }}
        />
        <p className="text-xs text-slate-500 font-medium">Chargement du registre des réservations...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3 font-sans"
        style={fontStyle}
      >
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center border"
          style={{ background: 'rgba(10,61,46,0.06)', borderColor: 'rgba(10,61,46,0.12)', color: FOREST }}
        >
          <SearchX className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Aucune réservation trouvée</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Aucune réservation ne correspond à vos filtres ou à ce terme de recherche.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_10px_40px_-24px_rgba(10,61,46,0.35)] font-sans"
      style={fontStyle}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/70 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/50 text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-4">Réf & Période</th>
              <th className="py-4 px-4">Locataire</th>
              <th className="py-4 px-4">Véhicule & Hôte</th>
              <th className="py-4 px-4">Finances & Mode</th>
              <th className="py-4 px-4">États des lieux</th>
              <th className="py-4 px-4">Statut & SLA</th>
              <th className="py-4 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {items.map((r) => {
              const refId = `#RES-${r.id.slice(0, 8).toUpperCase()}`;
              const badge = STATUT_BADGES[r.statut] || STATUT_BADGES.INITIEE;
              const isUrgent = r.statut === 'PAYEE' || r.statut === 'LITIGE';

              const accent = r.statut === 'LITIGE' ? RUST : r.statut === 'PAYEE' ? GOLD : undefined;

              const vehicleCover = r.vehicule?.photos?.[0]?.url;

              return (
                <tr
                  key={r.id}
                  className="hover:bg-[#0A3D2E]/[0.03] dark:hover:bg-[#F1DFB6]/[0.04] transition-colors group cursor-pointer"
                  onClick={() => onSelectReservation(r)}
                >
                  {/* Réf & Période */}
                  <td className="py-3.5 px-4" style={accent ? { boxShadow: `inset 3px 0 0 0 ${accent}` } : undefined}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">{refId}</span>
                        {r.nbJours && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {r.nbJours} j
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {new Date(r.dateDebut).toLocaleDateString('fr-FR')} → {new Date(r.dateFin).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </td>

                  {/* Locataire */}
                  <td className="py-3.5 px-4">
                    {r.locataire ? (
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold text-[11px] text-white"
                          style={{ background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})` }}
                        >
                          {r.locataire.prenom?.[0]}{r.locataire.nom?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {r.locataire.prenom} {r.locataire.nom}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{r.locataire.telephone || r.locataire.email || 'N/A'}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">N/A</span>
                    )}
                  </td>

                  {/* Véhicule & Hôte */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                        {vehicleCover ? (
                          <Image src={vehicleCover} alt="" fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">Auto</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {r.vehicule ? `${r.vehicule.marque} ${r.vehicule.modele}` : 'Véhicule'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          Plaque: <span className="font-mono">{r.vehicule?.immatriculation || 'N/A'}</span> • Hôte: {r.proprietaire?.prenom || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Finances & Mode */}
                  <td className="py-3.5 px-4 tabular-nums">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {formatCurrency(Number(r.prixTotal || 0))}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
                      <CreditCard className="w-3 h-3 text-emerald-600" />
                      <span>En ligne: {formatCurrency(Number(r.montantPayeEnLigne || 0))}</span>
                    </div>
                  </td>

                  {/* États des lieux Photos */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${r.checkinPhotosCount > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        <Camera className="w-3 h-3" />
                        <span>In ({r.checkinPhotosCount})</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${r.checkoutPhotosCount > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        <Camera className="w-3 h-3" />
                        <span>Out ({r.checkoutPhotosCount})</span>
                      </span>
                    </div>
                  </td>

                  {/* Statut & SLA */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {r.statut === 'LITIGE' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                        {badge.label}
                      </span>
                      {r.slaWaitHours > 0 && r.statut === 'PAYEE' && (
                        <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{r.slaWaitHours}h d'attente</span>
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectReservation(r);
                      }}
                      aria-label={`Inspecter réservation ${refId}`}
                      className="px-3 py-1.5 rounded-xl border font-medium transition-all flex items-center gap-1.5 ml-auto shadow-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-white hover:border-transparent cursor-pointer"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})`;
                        e.currentTarget.style.color = CHAMPAGNE;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '';
                        e.currentTarget.style.color = '';
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspecter 360°</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Sentinel Infinite Scroll */}
      <div ref={loadMoreRef} className="border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4">
        {isLoadingMore ? (
          <div className="flex flex-col items-center justify-center py-4 gap-2">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs text-slate-700 dark:text-slate-200">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: FOREST }} />
              <span className="font-medium">Chargement des réservations suivantes...</span>
            </div>
          </div>
        ) : hasMore ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1 text-xs">
            <div className="text-slate-500 font-medium tabular-nums">
              Affichage de <span className="font-semibold text-slate-900 dark:text-white">{items.length}</span> sur{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{totalItems}</span> réservations
            </div>
            <button
              onClick={onLoadMore}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:shadow-sm transition-all font-medium flex items-center gap-2 cursor-pointer"
            >
              <span>Charger la suite</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500">
                +{Math.max(0, totalItems - items.length)}
              </span>
            </button>
          </div>
        ) : items.length > 0 ? (
          <div className="flex items-center justify-center py-2 text-xs text-slate-500">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD }} />
              <span>Toutes les réservations ont été chargées ({items.length} au total)</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
