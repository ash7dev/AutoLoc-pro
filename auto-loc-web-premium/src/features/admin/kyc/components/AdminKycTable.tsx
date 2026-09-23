'use client';

import React from 'react';
import { Eye, CheckCircle2, Clock, FileText, Camera, CreditCard } from 'lucide-react';
import type { AdminKycQueueItem } from '../../../../core/api/adminAnalyticsApi';

interface AdminKycTableProps {
  items: AdminKycQueueItem[];
  isLoading?: boolean;
  onSelectItem: (item: AdminKycQueueItem) => void;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const CHAMPAGNE = '#F1DFB6';
const GOLD = '#b27c2d';
const RUST = '#a13d3d';

const statusConfig: Record<string, { label: string; tone: string; bg: string }> = {
  EN_ATTENTE: { label: 'En attente', tone: GOLD, bg: 'rgba(178, 124, 45, 0.1)' },
  VERIFIE: { label: 'Vérifié', tone: FOREST, bg: 'rgba(10, 61, 46, 0.08)' },
  REJETE: { label: 'Rejeté', tone: RUST, bg: 'rgba(161, 61, 61, 0.1)' },
  NON_VERIFIE: { label: 'Non soumis', tone: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
};

const DocPill: React.FC<{ ok: boolean; icon: React.ElementType; label: string }> = ({ ok, icon: Icon, label }) => (
  <span
    className="px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1"
    style={ok ? { backgroundColor: 'rgba(10, 61, 46, 0.08)', color: FOREST } : { backgroundColor: '#f1f5f9', color: '#94a3b8' }}
  >
    <Icon className="w-3 h-3" /> {label}
  </span>
);

export const AdminKycTable: React.FC<AdminKycTableProps> = ({ items, isLoading, onSelectItem }) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-4 animate-pulse" style={fontStyle}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/50" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-center space-y-3" style={fontStyle}>
        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)', color: FOREST }}>
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
    <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs overflow-hidden" style={fontStyle}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/70 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-medium">
            <tr>
              <th className="py-3.5 px-4">Utilisateur</th>
              <th className="py-3.5 px-4">Pièces fournies</th>
              <th className="py-3.5 px-4">Ancienneté / SLA</th>
              <th className="py-3.5 px-4">Statut</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {items.map((item) => {
              const docs = item.documents;
              const st = statusConfig[item.statutKyc] ?? statusConfig.NON_VERIFIE;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  {/* User Profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full text-[#041912] font-normal flex items-center justify-center text-sm shrink-0 border border-black/5"
                        style={{ backgroundColor: CHAMPAGNE }}
                      >
                        {item.prenom?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-normal text-[#041912] dark:text-white text-sm truncate">{item.fullName}</div>
                        <div className="text-[11px] text-slate-500 truncate">{item.phone || item.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Documents Status Pills */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <DocPill ok={!!docs.documentUrl} icon={CreditCard} label="CIN recto" />
                      <DocPill ok={!!docs.documentBackUrl} icon={CreditCard} label="CIN verso" />
                      <DocPill ok={!!docs.selfieUrl} icon={Camera} label="Selfie" />
                      <DocPill ok={!!docs.permisUrl} icon={FileText} label="Permis" />
                    </div>
                  </td>

                  {/* SLA Wait Hours */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                      <span className="text-xs text-slate-700 dark:text-slate-300 tabular-nums">{item.waitHours}h d'attente</span>
                    </div>
                  </td>

                  {/* KYC Status Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                      style={{ backgroundColor: st.bg, color: st.tone }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: st.tone }} />
                      {st.label}
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-normal text-white transition-opacity hover:opacity-90 shadow-2xs"
                      style={{ background: `linear-gradient(135deg, ${FOREST}, #062a1f)` }}
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