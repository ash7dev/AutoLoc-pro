'use client';

import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Car,
  Star,
  Eye,
  CheckCircle2,
  Clock,
  Ban,
  User,
  Calendar,
} from 'lucide-react';
import { HostItem } from '../hooks/useAdminHosts';

interface AdminHostTableProps {
  items: HostItem[];
  isLoading?: boolean;
  onSelectHost: (host: HostItem) => void;
}

export const AdminHostTable: React.FC<AdminHostTableProps> = ({
  items,
  isLoading,
  onSelectHost,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Aucun hôte trouvé
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Aucun propriétaire ne correspond à vos critères de recherche actuels.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Hôte / Propriétaire</th>
              <th className="py-3.5 px-4">Statut KYC</th>
              <th className="py-3.5 px-4">Flotte de Véhicules</th>
              <th className="py-3.5 px-4">Performance Hôte</th>
              <th className="py-3.5 px-4">Compte</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {items.map((item) => {
              const u = item.utilisateur;
              const name = u?.fullName || `${item.email.split('@')[0]}`;
              const initials = ((u?.prenom?.[0] || '') + (u?.nom?.[0] || '')).toUpperCase() || 'H';
              const rating = u?.noteProprietaire ? Number(u.noteProprietaire).toFixed(1) : '5.0';

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Host Identity & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0A3D2E] text-[#F1DFB6] font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        {u?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.avatarUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.email} {item.phone ? `• ${item.phone}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* KYC Status Badge */}
                  <td className="py-3.5 px-4">
                    {item.statutKyc === 'VERIFIE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Vérifié</span>
                      </span>
                    ) : item.statutKyc === 'EN_ATTENTE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[11px] font-bold">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>En attente KYC</span>
                      </span>
                    ) : item.statutKyc === 'REJETE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-[11px] font-bold">
                        <ShieldX className="w-3.5 h-3.5 text-rose-600" />
                        <span>Rejeté</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                        <span>Non vérifié</span>
                      </span>
                    )}
                  </td>

                  {/* Fleet Summary Stats */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                        <Car className="w-3.5 h-3.5 text-[#0A3D2E]" />
                        <span>{item.fleetStats.total} véhicule{item.fleetStats.total > 1 ? 's' : ''}</span>
                      </div>
                      {item.fleetStats.verified > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10.5px] font-bold border border-emerald-200/60">
                          {item.fleetStats.verified} actifs
                        </span>
                      )}
                      {item.fleetStats.pending > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[10.5px] font-bold border border-amber-200/60">
                          {item.fleetStats.pending} en attente
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Host Performance (Rating & Bookings) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rating}</span>
                      </div>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {item.totalBookings} location{item.totalBookings > 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>

                  {/* Account Status */}
                  <td className="py-3.5 px-4">
                    {item.isBanned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10.5px]">
                        <Ban className="w-3 h-3" />
                        <span>Banni</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10.5px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Actif</span>
                      </span>
                    )}
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectHost(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A3D2E] text-[#F1DFB6] hover:bg-[#062a1f] transition-all text-xs font-bold shadow-2xs cursor-pointer"
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
