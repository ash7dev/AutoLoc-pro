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

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';

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
      <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm" style={fontStyle}>
        <div className="inline-flex p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-4 animate-pulse">
          <Clock className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-normal text-slate-700 dark:text-slate-300">Chargement de l'annuaire des utilisateurs...</p>
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm" style={fontStyle}>
        <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
          <UserX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-normal text-slate-900 dark:text-white mb-1">Aucun utilisateur trouvé</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Essayez de modifier vos filtres ou le terme de recherche.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_10px_40px_-26px_rgba(10,61,46,0.3)]" style={fontStyle}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-[11px] font-normal text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-5">Utilisateur & Contact</th>
              <th className="py-4 px-5">Rôle</th>
              <th className="py-4 px-5">Statut KYC</th>
              <th className="py-4 px-5">Activité / Flotte</th>
              <th className="py-4 px-5">Statut Compte</th>
              <th className="py-4 px-5">Inscription</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-sans">
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
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150 group"
                >
                  {/* User Profile & Contact Info */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={fullName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs"
                            style={{ backgroundColor: 'rgba(10,61,46,0.08)', color: FOREST, borderColor: 'rgba(10,61,46,0.2)' }}
                          >
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
                          <span className="font-semibold text-slate-900 dark:text-white text-sm truncate max-w-[200px]" style={fontStyle}>
                            {fullName}
                          </span>
                          {isStuck && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                              Inscription incomplète
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1 truncate max-w-[160px]" title={item.email}>
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.email || 'Pas d\'email'}
                          </span>
                          {item.phone && (
                            <span className="flex items-center gap-1 truncate">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              {item.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-4 px-5">
                    <RoleBadge role={item.role} />
                  </td>

                  {/* KYC Badge */}
                  <td className="py-4 px-5">
                    <KycBadge status={item.statutKyc} isStuck={isStuck} />
                  </td>

                  {/* Stats & Vehicles */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1 text-[11px]">
                      <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                        <Car className="w-3.5 h-3.5" style={{ color: FOREST }} />
                        {item.stats.vehiclesCount} véhicule{item.stats.vehiclesCount > 1 ? 's' : ''}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.stats.bookingsCount} réservation{item.stats.bookingsCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>

                  {/* Account Status Badge */}
                  <td className="py-4 px-5">
                    {isBanned ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        Suspendu
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Actif
                      </span>
                    )}
                  </td>

                  {/* Registration Date */}
                  <td className="py-4 px-5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>

                  {/* Actions Button */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectUser(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 text-white shadow-xs"
                        style={{ background: `linear-gradient(135deg, ${FOREST}, #062a1f)` }}
                        title="Inspecter le compte 360°"
                      >
                        <Eye className="w-3.5 h-3.5 text-white/90" />
                        Inspecter
                      </button>

                      <button
                        onClick={() => onBanClick(item)}
                        className={`p-2 rounded-xl border transition-all duration-150 ${
                          isBanned
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
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
      <div ref={observerTarget} className="p-4 text-center border-t border-slate-100 dark:border-slate-800">
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 animate-spin" style={{ color: FOREST }} />
            <span>Chargement des comptes suivants...</span>
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-[11px] text-slate-400 font-sans">Fin des résultats — {items.length} utilisateurs affichés</p>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case 'PROPRIETAIRE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Award className="w-3 h-3 text-amber-600" /> Hôte (Propriétaire)
        </span>
      );
    case 'ADMIN':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          👑 Admin
        </span>
      );
    case 'SUPPORT':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          🎧 Support
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Locataire
        </span>
      );
  }
}

function KycBadge({ status, isStuck }: { status: string; isStuck: boolean }) {
  if (isStuck) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        Non démarré
      </span>
    );
  }

  switch (status) {
    case 'VERIFIE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Vérifié
        </span>
      );
    case 'EN_ATTENTE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 animate-pulse">
          <Clock className="w-3 h-3 text-sky-600" /> À examiner
        </span>
      );
    case 'REJETE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertCircle className="w-3 h-3 text-rose-600" /> Rejeté
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Non vérifié
        </span>
      );
  }
}
