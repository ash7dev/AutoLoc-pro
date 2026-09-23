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
const FOREST_DARK = '#062a1f';
const GOLD = '#b27c2d';
const RUST = '#a13d3d';
const SLATE = '#64748b';

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
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(target);
    return () => {
      observer.unobserve(target);
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (isLoading && items.length === 0) {
    return (
      <div
        className="p-14 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm"
        style={fontStyle}
      >
        <div
          className="w-9 h-9 mx-auto border-[3px] border-t-transparent rounded-full animate-spin mb-3"
          style={{ borderColor: `${FOREST} transparent ${FOREST} ${FOREST}` }}
        />
        <p className="text-xs text-slate-500 font-medium font-sans">Chargement des utilisateurs...</p>
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <div
        className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3"
        style={fontStyle}
      >
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center border"
          style={{ background: 'rgba(10,61,46,0.06)', borderColor: 'rgba(10,61,46,0.12)', color: FOREST }}
        >
          <UserX className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Aucun utilisateur trouvé</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
          Aucun utilisateur ne correspond à votre recherche ou aux filtres sélectionnés.
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
              <th className="py-4 px-4">Utilisateur & Contact</th>
              <th className="py-4 px-4">Rôle</th>
              <th className="py-4 px-4">Statut KYC</th>
              <th className="py-4 px-4">Activité / Flotte</th>
              <th className="py-4 px-4">Statut Compte</th>
              <th className="py-4 px-4">Inscription</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
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
                  className="hover:bg-[#0A3D2E]/[0.03] dark:hover:bg-[#F1DFB6]/[0.04] transition-colors group cursor-pointer"
                  onClick={() => onSelectUser(item.id)}
                >
                  {/* User Profile & Contact Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={fullName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200/80 dark:border-slate-700 shadow-xs"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full border flex items-center justify-center font-semibold text-xs"
                            style={{ background: 'rgba(10,61,46,0.08)', borderColor: 'rgba(10,61,46,0.18)', color: FOREST }}
                          >
                            {initials || 'U'}
                          </div>
                        )}
                        {isStuck && (
                          <span
                            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white dark:border-slate-900"
                            style={{ backgroundColor: GOLD }}
                            title="Inscription incomplète"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-white text-sm truncate max-w-[200px]">
                            {fullName}
                          </span>
                          {isStuck && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium border font-sans"
                              style={{ backgroundColor: 'rgba(178, 124, 45, 0.08)', color: GOLD, borderColor: 'rgba(178, 124, 45, 0.18)' }}
                            >
                              Inscription incomplète
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
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
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <RoleBadge role={item.role} />
                  </td>

                  {/* KYC Badge */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <KycBadge status={item.statutKyc} isStuck={isStuck} />
                  </td>

                  {/* Stats & Vehicles */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5 text-[11px] font-sans">
                      <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                        <Car className="w-3.5 h-3.5" style={{ color: FOREST }} />
                        {item.stats.vehiclesCount} véhicule{item.stats.vehiclesCount > 1 ? 's' : ''}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {item.stats.bookingsCount} réservation{item.stats.bookingsCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>

                  {/* Account Status Badge */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    {isBanned ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-sans"
                        style={{ backgroundColor: 'rgba(161, 61, 61, 0.08)', color: RUST, borderColor: 'rgba(161, 61, 61, 0.18)' }}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        Suspendu
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-sans"
                        style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)', color: FOREST, borderColor: 'rgba(10, 61, 46, 0.18)' }}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        Actif
                      </span>
                    )}
                  </td>

                  {/* Registration Date */}
                  <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
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
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectUser(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white shadow-xs transition-all hover:opacity-90 font-sans"
                        style={{ background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})` }}
                        title="Inspecter le compte 360°"
                      >
                        <Eye className="w-3.5 h-3.5 text-white/90" />
                        Inspecter
                      </button>

                      <button
                        onClick={() => onBanClick(item)}
                        className="p-1.5 rounded-xl border transition-all font-sans"
                        style={
                          isBanned
                            ? { backgroundColor: 'rgba(10, 61, 46, 0.08)', color: FOREST, borderColor: 'rgba(10, 61, 46, 0.18)' }
                            : { backgroundColor: 'rgba(161, 61, 61, 0.08)', color: RUST, borderColor: 'rgba(161, 61, 61, 0.18)' }
                        }
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
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-sans">
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
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-sans"
          style={{ backgroundColor: 'rgba(178, 124, 45, 0.08)', color: GOLD, borderColor: 'rgba(178, 124, 45, 0.18)' }}
        >
          <Award className="w-3 h-3" /> Hôte (Propriétaire)
        </span>
      );
    case 'ADMIN':
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-sans"
          style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)', color: FOREST, borderColor: 'rgba(10, 61, 46, 0.18)' }}
        >
          👑 Admin
        </span>
      );
    case 'SUPPORT':
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-sans"
          style={{ backgroundColor: 'rgba(100, 116, 139, 0.08)', color: SLATE, borderColor: 'rgba(100, 116, 139, 0.18)' }}
        >
          🎧 Support
        </span>
      );
    default:
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-sans"
          style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)', color: FOREST, borderColor: 'rgba(10, 61, 46, 0.18)' }}
        >
          Locataire
        </span>
      );
  }
}

function KycBadge({ status, isStuck }: { status: string; isStuck: boolean }) {
  if (isStuck) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-sans"
        style={{ backgroundColor: 'rgba(100, 116, 139, 0.08)', color: SLATE, borderColor: 'rgba(100, 116, 139, 0.18)' }}
      >
        Non démarré
      </span>
    );
  }

  switch (status) {
    case 'VERIFIE':
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-sans"
          style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)', color: FOREST, borderColor: 'rgba(10, 61, 46, 0.18)' }}
        >
          <ShieldCheck className="w-3 h-3" /> Vérifié
        </span>
      );
    case 'EN_ATTENTE':
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-sans"
          style={{ backgroundColor: 'rgba(178, 124, 45, 0.08)', color: GOLD, borderColor: 'rgba(178, 124, 45, 0.18)' }}
        >
          <Clock className="w-3 h-3" /> À examiner
        </span>
      );
    case 'REJETE':
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-sans"
          style={{ backgroundColor: 'rgba(161, 61, 61, 0.08)', color: RUST, borderColor: 'rgba(161, 61, 61, 0.18)' }}
        >
          <AlertCircle className="w-3 h-3" /> Rejeté
        </span>
      );
    default:
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-sans"
          style={{ backgroundColor: 'rgba(100, 116, 139, 0.08)', color: SLATE, borderColor: 'rgba(100, 116, 139, 0.18)' }}
        >
          Non vérifié
        </span>
      );
  }
}
