'use client';

import React, { useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ShieldCheck,
  Phone,
  Zap,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
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

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  if (isLoadingInitial) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 w-full bg-slate-200/80 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800">Aucun virement ou retrait trouvé</h3>
          <p className="text-xs text-slate-500">
            Aucune transaction ne correspond à vos critères de recherche actuels.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
                <th className="py-4 px-6">Bénéficiaire / Propriétaire</th>
                <th className="py-4 px-6">Canal & Destinataire</th>
                <th className="py-4 px-6">Montant du Retrait</th>
                <th className="py-4 px-6">Statut & Transaction</th>
                <th className="py-4 px-6">Date de Demande</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {items.map((item) => {
                const isWave = item.method === 'WAVE';
                const isApproved = item.statut === 'EFFECTUE';
                const isRejected = item.statut === 'REJETE';
                const isPending = item.statut === 'EN_ATTENTE';

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Propriétaire */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#0A3D2E]/10 border border-[#0A3D2E]/20 text-[#0A3D2E] font-extrabold flex items-center justify-center text-sm shrink-0">
                          {item.ownerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-[#0A3D2E] transition-colors">
                            <span>{item.ownerName}</span>
                            {item.ownerKycStatus === 'VALIDE' && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {item.ownerPhone || item.ownerEmail || '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Méthode & Numéro Destinataire */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isWave
                              ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}
                        >
                          {isWave ? '🌊 Wave' : '🟠 Orange Money'}
                        </span>
                        <div className="flex items-center gap-1 text-slate-700 font-mono text-[11px] font-bold">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{item.numeroDestinataire}</span>
                        </div>
                      </div>
                    </td>

                    {/* Montant */}
                    <td className="py-4 px-6">
                      <div>
                        <span className="text-base font-black text-slate-900 font-mono tracking-tight">
                          {item.amount.toLocaleString('fr-FR')}{' '}
                          <span className="text-xs font-bold text-slate-500">FCFA</span>
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Solde wallet : {item.walletBalance.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    </td>

                    {/* Statut & Provider ID */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isRejected
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                          {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                          <span>
                            {isApproved ? 'Effectué' : isRejected ? 'Rejeté' : 'En attente'}
                          </span>
                        </span>
                        {item.idTransactionFournisseur && (
                          <p className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                            ID: {item.idTransactionFournisseur}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6">
                      <div className="text-slate-600 font-medium text-[11px]">
                        {new Date(item.demandeeLe).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(item.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A3D2E]/10 hover:bg-[#0A3D2E] text-[#0A3D2E] hover:text-[#F1DFB6] font-bold text-xs transition-all cursor-pointer shadow-2xs"
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
      </div>

      {/* Sentinel pour Infinite Scroll */}
      <div ref={sentinelRef} className="py-4 text-center">
        {isLoadingMore && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs text-slate-600 shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-[#0A3D2E]" />
            <span>Chargement des retraits suivants...</span>
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <span className="text-xs text-slate-400 font-medium">
            Affichage de {items.length} sur {totalItems} transactions au total
          </span>
        )}
      </div>
    </div>
  );
};
