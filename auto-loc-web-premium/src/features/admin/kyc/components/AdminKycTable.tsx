'use client';

import React from 'react';
import { Eye, CheckCircle2, Clock, AlertTriangle, ShieldX, FileText, Camera, CreditCard, ChevronRight } from 'lucide-react';
import type { AdminKycQueueItem } from '../../../../core/api/adminAnalyticsApi';

interface AdminKycTableProps {
  items: AdminKycQueueItem[];
  isLoading?: boolean;
  onSelectItem: (item: AdminKycQueueItem) => void;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';

export const AdminKycTable: React.FC<AdminKycTableProps> = ({ items, isLoading, onSelectItem }) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-4 animate-pulse font-fraunces" style={fontStyle}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/50" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-center font-fraunces space-y-3" style={fontStyle}>
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-normal text-[#041912] dark:text-white">Aucun dossier dans cette liste</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Toutes les demandes de vérification KYC dans cette catégorie sont traitées ou aucune ne correspond à vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs overflow-hidden font-fraunces" style={fontStyle}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/70 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-medium">
            <tr>
              <th className="py-3.5 px-4">Utilisateur</th>
              <th className="py-3.5 px-4">Pièces Fournies</th>
              <th className="py-3.5 px-4">Ancienneté / SLA</th>
              <th className="py-3.5 px-4">Statut</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {items.map((item) => {
              const docs = item.documents;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  {/* User Profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#F1DFB6] text-[#041912] font-normal flex items-center justify-center text-sm shrink-0 border border-black/5">
                        {item.prenom?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-normal text-[#041912] dark:text-white text-sm truncate">
                          {item.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.phone || item.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Documents Status Pills */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${
                        docs.documentUrl ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <CreditCard className="w-3 h-3" /> CIN Recto
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${
                        docs.documentBackUrl ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <CreditCard className="w-3 h-3" /> CIN Verso
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${
                        docs.selfieUrl ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Camera className="w-3 h-3" /> Selfie
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${
                        docs.permisUrl ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <FileText className="w-3 h-3" /> Permis
                      </span>
                    </div>
                  </td>

                  {/* SLA Wait Hours */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                        {item.waitHours}h d'attente
                      </span>
                    </div>
                  </td>

                  {/* KYC Status Badge */}
                  <td className="py-3.5 px-4">
                    {item.statutKyc === 'EN_ATTENTE' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60">
                        En attente
                      </span>
                    )}
                    {item.statutKyc === 'VERIFIE' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60">
                        Vérifié 🟢
                      </span>
                    )}
                    {item.statutKyc === 'REJETE' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60">
                        Rejeté 🔴
                      </span>
                    )}
                    {item.statutKyc === 'NON_VERIFIE' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Non soumis
                      </span>
                    )}
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-normal text-white transition-opacity shadow-2xs"
                      style={{ backgroundColor: FOREST }}
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
  );
};
