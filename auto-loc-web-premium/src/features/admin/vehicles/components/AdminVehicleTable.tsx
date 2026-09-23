'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Eye, Clock, ShieldCheck, FileText, AlertTriangle, Star, CheckCircle, Sparkles, Loader2, ArrowUpRight } from 'lucide-react';
import type { AdminVehicleQueueItem } from '../../../../core/api/adminAnalyticsApi';

interface AdminVehicleTableProps {
  items: AdminVehicleQueueItem[];
  isLoading: boolean;
  onSelectVehicle: (vehicle: AdminVehicleQueueItem) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  totalItems?: number;
  onLoadMore?: () => void;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const FOREST_DARK = '#062a1f';
const GOLD = '#b27c2d';
const CHAMPAGNE = '#F1DFB6';

export const AdminVehicleTable: React.FC<AdminVehicleTableProps> = ({
  items,
  isLoading,
  onSelectVehicle,
  hasMore = false,
  isLoadingMore = false,
  totalItems = 0,
  onLoadMore,
}) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Instagram-style Infinite Scroll via Intersection Observer
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
        <p className="text-xs text-slate-500 font-medium">Chargement des véhicules en modération...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3"
        style={fontStyle}
      >
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center border"
          style={{ background: 'rgba(10,61,46,0.06)', borderColor: 'rgba(10,61,46,0.12)', color: FOREST }}
        >
          <ShieldCheck className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Aucun véhicule trouvé</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Aucun véhicule ne correspond aux critères de recherche ou à ce statut de modération.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_10px_40px_-24px_rgba(10,61,46,0.35)]"
      style={fontStyle}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/70 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/50 text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-4">Véhicule & Immatriculation</th>
              <th className="py-4 px-4">Propriétaire (Hôte)</th>
              <th className="py-4 px-4">Tarif & Livraison</th>
              <th className="py-4 px-4">Documents</th>
              <th className="py-4 px-4">SLA File</th>
              <th className="py-4 px-4">Statut</th>
              <th className="py-4 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {items.map((item) => {
              const mainPhoto = item.photos.find((p) => p.estPrincipale) || item.photos[0];
              const isPending = item.statut === 'EN_ATTENTE_VALIDATION';
              const isUrgent = isPending && item.slaWaitHours >= 24;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-[#0A3D2E]/[0.03] dark:hover:bg-[#F1DFB6]/[0.04] transition-colors group cursor-pointer"
                  onClick={() => onSelectVehicle(item)}
                >
                  {/* Vehicle & Immatriculation */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {/* Photo Thumbnail */}
                      <div className="relative w-14 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/70 dark:border-slate-700 shadow-sm">
                        {mainPhoto ? (
                          <Image
                            src={mainPhoto.url}
                            alt={`${item.marque} ${item.modele}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                            Sans photo
                          </div>
                        )}
                        {item.photos.length > 0 && (
                          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded text-[9px] font-semibold bg-black/60 text-white backdrop-blur-sm">
                            📷 {item.photos.length}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                          <span>{item.marque} {item.modele}</span>
                          <span className="text-slate-400 text-[11px]">({item.annee})</span>
                          {item.isFeatured && (
                            <span className="text-amber-500" title="Mis en avant sur l'accueil">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {item.immatriculation || 'Plaque N/A'}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {item.ville} • {item.transmission || 'Auto'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="py-3.5 px-4">
                    {item.proprietaire ? (
                      <div className="space-y-0.5">
                        <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{item.proprietaire.prenom} {item.proprietaire.nom}</span>
                          {item.proprietaire.statutKyc === 'VERIFIE' ? (
                            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-[10px]" title="Hôte KYC Vérifié">
                              <CheckCircle className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-amber-600 text-[10px]" title="KYC non vérifié">
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.proprietaire.telephone || item.proprietaire.email || 'N/A'}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Anonyme</span>
                    )}
                  </td>

                  {/* Pricing & Delivery */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white tabular-nums">
                      {item.prixParJour.toLocaleString('fr-FR')} FCFA <span className="text-[10px] font-normal text-slate-400">/jour</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {item.proposeLivraisonDakar && '📍 Dakar'} {item.proposeLivraisonAibd && '✈️ AIBD'}
                      {!item.proposeLivraisonDakar && !item.proposeLivraisonAibd && 'Sur place'}
                    </div>
                  </td>

                  {/* Documents Badge */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 border ${item.carteGriseUrl
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-900'
                          }`}
                      >
                        <FileText className="w-3 h-3" />
                        <span>CG {item.carteGriseUrl ? 'OK' : 'Manquant'}</span>
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 border ${item.assurance
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>Assurance {item.assurance ? 'OK' : 'Option'}</span>
                      </span>
                    </div>
                  </td>

                  {/* SLA Wait */}
                  <td className="py-3.5 px-4">
                    {isPending ? (
                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium tabular-nums border ${isUrgent
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          }`}
                      >
                        {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                        <Clock className="w-3 h-3" />
                        <span>{item.slaWaitHours}h d'attente</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">
                        {new Date(item.creeLe).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {item.statut === 'EN_ATTENTE_VALIDATION' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800">
                        En attente
                      </span>
                    )}
                    {item.statut === 'VERIFIE' && (
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold border"
                        style={{ background: 'rgba(10,61,46,0.08)', color: FOREST, borderColor: 'rgba(10,61,46,0.18)' }}
                      >
                        Vérifié
                      </span>
                    )}
                    {item.statut === 'SUSPENDU' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200/80 dark:border-red-800">
                        Suspendu
                      </span>
                    )}
                    {item.statut === 'BROUILLON' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        Brouillon
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVehicle(item);
                      }}
                      className="px-3 py-1.5 rounded-xl border font-medium transition-all flex items-center gap-1.5 ml-auto shadow-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 group-hover:text-white group-hover:border-transparent"
                      style={{
                        transitionProperty: 'background, color, border-color',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '';
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspecter</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Instagram Feed Intelligent Pagination Footer */}
      <div ref={loadMoreRef} className="border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4">
        {isLoadingMore ? (
          <div className="flex flex-col items-center justify-center py-4 gap-2">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs text-slate-700 dark:text-slate-200">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: FOREST }} />
              <span className="font-medium">Chargement des véhicules suivants...</span>
            </div>
          </div>
        ) : hasMore ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1 text-xs">
            <div className="text-slate-500 font-medium">
              Affichage de <span className="font-semibold text-slate-900 dark:text-white">{items.length}</span> sur{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{totalItems}</span> véhicules
            </div>
            <button
              onClick={onLoadMore}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:shadow-sm transition-all font-medium flex items-center gap-2"
              style={{ borderColor: undefined }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = FOREST;
                e.currentTarget.style.color = FOREST;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.color = '';
              }}
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
              <span>Tous les véhicules ont été chargés ({items.length} au total)</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};