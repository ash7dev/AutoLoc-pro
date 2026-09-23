'use client';

import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Star,
  Eye,
  FileText,
  Ban,
  User,
  AlertTriangle,
} from 'lucide-react';
import { TenantItem } from '../hooks/useAdminTenants';
import { formatCurrency } from '@/lib/utils';

interface AdminTenantTableProps {
  items: TenantItem[];
  isLoading: boolean;
  onSelectTenant: (tenant: TenantItem) => void;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export const AdminTenantTable: React.FC<AdminTenantTableProps> = ({
  items,
  isLoading,
  onSelectTenant,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
            </div>
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
        <User className="w-10 h-10 mx-auto text-slate-400 mb-3" strokeWidth={1.5} />
        <h3 style={fontStyle} className="text-base font-normal text-slate-800 dark:text-slate-100">
          Aucun locataire trouvé
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Aucun conducteur ne correspond à vos critères de recherche actuels.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10.5px]">
            <tr>
              <th className="py-3.5 px-4">Conducteur / Voyageur</th>
              <th className="py-3.5 px-4">Permis & KYC</th>
              <th className="py-3.5 px-4">Note Locataire</th>
              <th className="py-3.5 px-4">Réservations</th>
              <th className="py-3.5 px-4">Dépenses Cumulées</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((tenant) => {
              const fullName = tenant.utilisateur?.fullName || tenant.email;
              const initials = (tenant.utilisateur?.prenom?.[0] || 'L').toUpperCase();
              const hasPermis = tenant.hasPermis;
              const isBanned = tenant.isBanned;

              return (
                <tr
                  key={tenant.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectTenant(tenant)}
                >
                  {/* Conducteur / Profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0A3D2E] text-[#F1DFB6] font-bold text-sm flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                        {tenant.utilisateur?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={tenant.utilisateur.avatarUrl}
                            alt={fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {fullName}
                          </span>
                          {isBanned && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              Banni
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {tenant.email} • {tenant.phone || 'Pas de téléphone'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Permis & KYC Badge */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      {tenant.statutKyc === 'VERIFIE' && hasPermis ? (
                        <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Permis & KYC Validés</span>
                        </span>
                      ) : hasPermis ? (
                        <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Permis Transmis</span>
                        </span>
                      ) : tenant.statutKyc === 'REJETE' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <ShieldX className="w-3.5 h-3.5" />
                          <span>Rejeté</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                          <span>Non Vérifié</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Rating / Note Locataire */}
                  <td className="py-3.5 px-4 font-medium">
                    {tenant.noteLocataire > 0 ? (
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{tenant.noteLocataire.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal text-[11px]">/ 5</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Aucune note</span>
                    )}
                  </td>

                  {/* Booking Stats */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-900 dark:text-white font-semibold">
                      {tenant.tenantStats.totalBookings} location(s)
                    </div>
                    <p className="text-[10.5px] text-slate-400">
                      {tenant.tenantStats.completedBookings} terminées • {tenant.tenantStats.ongoingBookings} en cours
                    </p>
                  </td>

                  {/* GMV Spent */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(tenant.tenantStats.totalSpent)}
                  </td>

                  {/* 360° Inspection Button */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTenant(tenant);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0A3D2E] hover:text-[#F1DFB6] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
    </div>
  );
};
