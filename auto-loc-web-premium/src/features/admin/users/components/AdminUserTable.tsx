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
  MoreVertical,
  Award,
  AlertCircle,
  Clock,
  UserPlus,
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
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 animate-pulse">
          <Clock className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Chargement de l'annuaire des utilisateurs...</p>
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="inline-flex p-4 rounded-full bg-slate-800 text-slate-400 mb-4">
          <UserX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Aucun utilisateur trouvé</h3>
        <p className="text-xs text-slate-400">Essayez de modifier vos filtres ou le terme de recherche.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Utilisateur & Contact</th>
              <th className="py-3.5 px-4">Rôle</th>
              <th className="py-3.5 px-4">Statut KYC</th>
              <th className="py-3.5 px-4">Activité / Flotte</th>
              <th className="py-3.5 px-4">Statut Compte</th>
              <th className="py-3.5 px-4">Inscription</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
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
                  className="hover:bg-slate-800/40 transition-colors duration-150 group"
                >
                  {/* User Profile & Contact Info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={fullName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
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
                          <span className="font-bold text-white text-sm truncate max-w-[200px]">
                            {fullName}
                          </span>
                          {isStuck && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                              Inscription incomplète
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1 truncate max-w-[160px]" title={item.email}>
                            <Mail className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            {item.email || 'Pas d\'email'}
                          </span>
                          {item.phone && (
                            <span className="flex items-center gap-1 truncate">
                              <Phone className="w-3 h-3 text-slate-500 flex-shrink-0" />
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
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Car className="w-3.5 h-3.5 text-emerald-400" />
                        {item.stats.vehiclesCount} véhicule{item.stats.vehiclesCount > 1 ? 's' : ''}
                      </span>
                      <span className="text-slate-400">
                        {item.stats.bookingsCount} réservation{item.stats.bookingsCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>

                  {/* Account Status Badge */}
                  <td className="py-4 px-4">
                    {isBanned ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <ShieldAlert className="w-3 h-3" />
                        Suspendu
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" />
                        Actif
                      </span>
                    )}
                  </td>

                  {/* Registration Date */}
                  <td className="py-4 px-4 text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all duration-200"
                        title="Inspecter le compte 360°"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspecter
                      </button>

                      <button
                        onClick={() => onBanClick(item)}
                        className={`p-1.5 rounded-lg border transition-all duration-200 ${
                          isBanned
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
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
      <div ref={observerTarget} className="p-4 text-center border-t border-slate-800/60">
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Chargement des comptes suivants...</span>
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-[11px] text-slate-500">Fin des résultats — {items.length} utilisateurs affichés</p>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case 'PROPRIETAIRE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <Award className="w-3 h-3 text-amber-400" /> Hôte (Propriétaire)
        </span>
      );
    case 'ADMIN':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
          👑 Admin
        </span>
      );
    case 'SUPPORT':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
          🎧 Support
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          Locataire
        </span>
      );
  }
}

function KycBadge({ status, isStuck }: { status: string; isStuck: boolean }) {
  if (isStuck) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
        Non démarré
      </span>
    );
  }

  switch (status) {
    case 'VERIFIE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Vérifié
        </span>
      );
    case 'EN_ATTENTE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse">
          <Clock className="w-3 h-3 text-sky-400" /> À examiner
        </span>
      );
    case 'REJETE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <AlertCircle className="w-3 h-3 text-rose-400" /> Rejeté
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
          Non vérifié
        </span>
      );
  }
}
