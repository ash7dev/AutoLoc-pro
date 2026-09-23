'use client';

import React, { useEffect, useRef } from 'react';
import {
  Eye,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Car,
  Calendar,
  Phone,
  Mail,
  Award,
  AlertCircle,
  Clock,
} from 'lucide-react';
import type { AdminUserQueueItem } from '../../../../core/api/adminAnalyticsApi';

interface AdminUserTableProps {
  items: AdminUserQueueItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectUser: (id: string) => void;
  onBanClick: (user: AdminUserQueueItem) => void;
}

export function AdminUserTable({
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onSelectUser,
  onBanClick,
}: AdminUserTableProps) {
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Instagram-style infinite scroll sentinel observer
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => {
      observer.unobserve(target);
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (isLoading && items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-600 mb-4 animate-pulse">
          <Clock className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Chargement de l'annuaire des utilisateurs...</p>
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
          <UserX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Aucun utilisateur trouvé</h3>
        <p className="text-xs text-slate-500">Essayez de modifier vos filtres ou le terme de recherche.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Utilisateur & Contact</th>
              <th className="py-3.5 px-4">Rôle</th>
              <th className="py-3.5 px-4">Statut KYC</th>
              <th className="py-3.5 px-4">Activité / Flotte</th>
              <th className="py-3.5 px-4">Statut Compte</th>
              <th className="py-3.5 px-4">Inscription</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((item) => {
              const u = item.utilisateur;
              const isStuck = item.isStuckOnboarding;
              const isBanned = item.isBanned;

              const fullName = u?.fullName || (item.email ? item.email.split('@')[0] : 'Compte Incomplet');
              const avatarUrl = u?.avatarUrl;
              const initials = fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors duration-150 group"
                >
                  {/* User Profile & Contact Info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={fullName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            {initials || 'U'}
                          </div>
                        )}
                        {isStuck && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm truncate max-w-[200px]">
                            {fullName}
                          </span>
                          {isStuck && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                              Inscription incomplète
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1 truncate max-w-[160px]" title={item.email}>
                            <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            {item.email || 'Pas d\'email'}
                          </span>
                          {item.phone && (
                            <span className="flex items-center gap-1 truncate">
                              <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              {item.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-4 px-4">
                    <RoleBadge role={item.role} />
                  </td>

                  {/* KYC Badge */}
                  <td className="py-4 px-4">
                    <KycBadge status={item.statutKyc} isStuck={isStuck} />
                  </td>

                  {/* Stats & Vehicles */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1 text-[11px]">
                      <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <Car className="w-3.5 h-3.5 text-emerald-600" />
                        {item.stats.vehiclesCount} véhicule{item.stats.vehiclesCount > 1 ? 's' : ''}
                      </span>
                      <span className="text-slate-500">
                        {item.stats.bookingsCount} réservation{item.stats.bookingsCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>

                  {/* Account Status Badge */}
                  <td className="py-4 px-4">
                    {isBanned ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        Suspendu
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Actif
                      </span>
                    )}
                  </td>

                  {/* Registration Date */}
                  <td className="py-4 px-4 text-slate-500 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>

                  {/* Actions Button */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectUser(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all duration-150"
                        title="Inspecter le compte 360°"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        Inspecter
                      </button>

                      <button
                        onClick={() => onBanClick(item)}
                        className={`p-1.5 rounded-lg border transition-all duration-150 ${
                          isBanned
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                        }`}
                        title={isBanned ? 'Réactiver le compte' : 'Suspendre le compte'}
                      >
                        {isBanned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sentinel Element for Infinite Scroll */}
      <div ref={observerTarget} className="p-4 text-center border-t border-slate-100">
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Chargement des comptes suivants...</span>
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-[11px] text-slate-400">Fin des résultats — {items.length} utilisateurs affichés</p>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case 'PROPRIETAIRE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Award className="w-3 h-3 text-amber-600" /> Hôte (Propriétaire)
        </span>
      );
    case 'ADMIN':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          👑 Admin
        </span>
      );
    case 'SUPPORT':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
          🎧 Support
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          Locataire
        </span>
      );
  }
}

function KycBadge({ status, isStuck }: { status: string; isStuck: boolean }) {
  if (isStuck) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        Non démarré
      </span>
    );
  }

  switch (status) {
    case 'VERIFIE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Vérifié
        </span>
      );
    case 'EN_ATTENTE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200 animate-pulse">
          <Clock className="w-3 h-3 text-sky-600" /> À examiner
        </span>
      );
    case 'REJETE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" /> Rejeté
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
          Non vérifié
        </span>
      );
  }
}
