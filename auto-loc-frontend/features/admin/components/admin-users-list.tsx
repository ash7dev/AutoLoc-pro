'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Search, CheckCircle2, XCircle,
  BadgeCheck, ShieldOff, Shield, Loader2, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminUser } from '../../../lib/nestjs/admin';
import { ADMIN_PATHS } from '../../../lib/nestjs/admin';

// ── Types ──────────────────────────────────────────────────────────────────────

type RoleFilter = 'ALL' | 'LOCATAIRE' | 'PROPRIETAIRE';

const ROLE_LABELS: Record<AdminUser['role'], { label: string; bg: string; text: string; border: string }> = {
  LOCATAIRE:    { label: 'Locataire',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200/60'   },
  PROPRIETAIRE: { label: 'Propriétaire', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200/60' },
  ADMIN:        { label: 'Admin',        bg: 'bg-black',      text: 'text-emerald-400', border: 'border-transparent'   },
  SUPPORT:      { label: 'Support',      bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200/60'  },
};

const KYC_LABELS: Record<AdminUser['kycStatus'], { label: string; dot: string; text: string }> = {
  NON_VERIFIE: { label: 'Non vérifié', dot: 'bg-slate-300',   text: 'text-black/35'  },
  EN_ATTENTE:  { label: 'En attente',  dot: 'bg-amber-400',   text: 'text-amber-700' },
  VERIFIE:     { label: 'Vérifié',     dot: 'bg-emerald-400', text: 'text-emerald-700'},
  REJETE:      { label: 'Rejeté',      dot: 'bg-red-400',     text: 'text-red-600'   },
};

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: 'ALL',          label: 'Tous'          },
  { value: 'LOCATAIRE',    label: 'Locataires'    },
  { value: 'PROPRIETAIRE', label: 'Propriétaires' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(user: AdminUser) {
  const p = user.utilisateur?.prenom?.[0] ?? '';
  const n = user.utilisateur?.nom?.[0] ?? '';
  return (p + n).toUpperCase() || user.email?.[0]?.toUpperCase() || '?';
}

function getUserName(user: AdminUser) {
  return user.utilisateur
    ? `${user.utilisateur.prenom} ${user.utilisateur.nom}`
    : (user.email ?? user.id);
}

// ── Ban dialog ─────────────────────────────────────────────────────────────────

function BanDialog({ userName, raison, onRaisonChange, onConfirm, onCancel, loading }: {
  userName: string;
  raison: string;
  onRaisonChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl shadow-black/20
        overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 border border-red-200/60">
            <ShieldOff className="w-4 h-4 text-red-500" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[14px] font-black text-black leading-tight">Bannir l&apos;utilisateur</p>
            <p className="text-[11.5px] font-medium text-black/40">{userName}</p>
          </div>
        </div>

        <div className="p-5">
          {/* Warning */}
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200/60 p-3 mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className="text-[12px] font-medium text-amber-700 leading-snug">
              L&apos;utilisateur ne pourra plus accéder à la plateforme.
              Cette action est réversible depuis cette interface.
            </p>
          </div>

          {/* Raison */}
          <label className="block mb-1.5 text-[11.5px] font-bold text-black/50">
            Raison <span className="font-medium text-black/25">(optionnel)</span>
          </label>
          <textarea
            value={raison}
            onChange={(e) => onRaisonChange(e.target.value)}
            placeholder="Ex : Comportement frauduleux, abus signalé…"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5
              text-[13px] font-medium text-black placeholder-black/25
              focus:border-red-400/50 focus:outline-none focus:ring-1 focus:ring-red-400/20
              transition-all resize-none"
          />

          <div className="flex gap-2.5 mt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5
                text-[12.5px] font-bold text-black/50
                hover:bg-slate-50 hover:border-slate-300
                transition-all disabled:opacity-40"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl
                bg-red-500 text-white py-2.5 text-[12.5px] font-bold
                hover:bg-red-600 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <ShieldOff className="w-3.5 h-3.5" strokeWidth={2} />
              }
              Confirmer le bannissement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── User row ───────────────────────────────────────────────────────────────────

function UserRow({ user, pendingId, onBan, onUnban, onApproveKyc }: {
  user: AdminUser;
  pendingId: string | null;
  onBan: (id: string, name: string) => void;
  onUnban: (id: string) => void;
  onApproveKyc: (id: string) => void;
}) {
  const isLoading = pendingId === user.id;
  const role = ROLE_LABELS[user.role];
  const kyc  = KYC_LABELS[user.kycStatus];
  const name = getUserName(user);

  return (
    <tr className={cn(
      'border-b border-slate-50 last:border-b-0 transition-colors',
      user.isBanned ? 'bg-red-50/20 hover:bg-red-50/40' : 'hover:bg-slate-50/60',
    )}>

      {/* Utilisateur */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          {/* Avatar initiales */}
          <div className="relative flex-shrink-0">
            <div className={cn(
              'flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden text-[12px] font-black',
              user.isBanned ? 'bg-red-100 text-red-500' : 'bg-black text-emerald-400',
            )}>
              {user.utilisateur?.avatarUrl ? (
                <img src={user.utilisateur.avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                getInitials(user)
              )}
            </div>
            {/* Badge banni */}
            {user.isBanned && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full
                bg-red-500 border-2 border-white flex items-center justify-center">
                <ShieldOff className="w-1.5 h-1.5 text-white" strokeWidth={3} />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className={cn(
                'text-[13px] font-bold leading-tight truncate',
                user.isBanned ? 'text-red-600' : 'text-black',
              )}>
                {name}
              </p>
              {user.isBanned && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full
                  bg-red-50 border border-red-200/60 px-1.5 py-0.5
                  text-[9.5px] font-bold text-red-500">
                  Banni
                </span>
              )}
            </div>
            <p className="text-[11px] font-medium text-black/35 truncate">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Rôle */}
      <td className="px-5 py-3.5">
        <span className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold border',
          role.bg, role.text, role.border,
        )}>
          {role.label}
        </span>
      </td>

      {/* KYC */}
      <td className="px-5 py-3.5">
        <span className={cn('inline-flex items-center gap-1.5 text-[11.5px] font-semibold', kyc.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', kyc.dot)} />
          {kyc.label}
        </span>
      </td>

      {/* Véhicules */}
      <td className="px-5 py-3.5">
        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2
          rounded-lg bg-slate-100 text-[12px] font-bold text-black/60">
          {user._count?.vehicles ?? 0}
        </span>
      </td>

      {/* Inscrit */}
      <td className="px-5 py-3.5">
        <span className="text-[12px] font-medium text-black/35">
          {new Date(user.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-2">
          {/* KYC approve */}
          {user.kycStatus === 'EN_ATTENTE' && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onApproveKyc(user.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                border border-amber-300/50 bg-amber-50 text-[11.5px] font-bold text-amber-700
                hover:bg-amber-100 hover:border-amber-300
                transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
              }
              KYC
            </button>
          )}

          {/* Ban / Unban */}
          {user.role !== 'ADMIN' && (
            user.isBanned ? (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onUnban(user.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  bg-black text-emerald-400 text-[11.5px] font-bold
                  hover:bg-emerald-400 hover:text-black
                  shadow-sm shadow-black/10
                  transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Shield className="h-3.5 w-3.5" strokeWidth={2} />
                }
                Débannir
              </button>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onBan(user.id, name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  border border-slate-200 text-[11.5px] font-bold text-black/50
                  hover:bg-red-50 hover:text-red-500 hover:border-red-200
                  transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <ShieldOff className="h-3.5 w-3.5" strokeWidth={2} />
                }
                Bannir
              </button>
            )
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AdminUsersList({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toast, setToast]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [banDialog, setBanDialog] = useState<{
    open: boolean; userId: string; userName: string; raison: string;
  }>({ open: false, userId: '', userName: '', raison: '' });

  const filtered = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = u.utilisateur
      ? `${u.utilisateur.prenom} ${u.utilisateur.nom}`.toLowerCase()
      : '';
    return name.includes(q) || (u.email ?? '').toLowerCase().includes(q);
  });

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function getErrorMessage(res: Response, fallback: string) {
    const contentType = res.headers.get('content-type') ?? '';
    try {
      if (contentType.includes('application/json')) {
        const payload = await res.json() as { message?: string | string[] };
        if (Array.isArray(payload?.message)) return payload.message.join(' ');
        if (payload?.message) return payload.message;
      } else {
        const text = await res.text();
        if (text?.trim()) return text;
      }
    } catch {
      // ignore parsing errors
    }
    return fallback;
  }

  async function handleApproveKyc(userId: string) {
    setPendingId(userId);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.approveKyc(userId)}`, { method: 'PATCH' });
      if (!res.ok) throw new Error(await getErrorMessage(res, 'Erreur lors de l\'approbation KYC.'));
      showToast('success', 'KYC approuvé avec succès.');
      router.refresh();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Erreur lors de l\'approbation KYC.');
    } finally {
      setPendingId(null);
    }
  }

  async function handleBan() {
    setPendingId(banDialog.userId);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.banUser(banDialog.userId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: false, raison: banDialog.raison || undefined }),
      });
      if (!res.ok) throw new Error(await getErrorMessage(res, 'Erreur lors du bannissement.'));
      setBanDialog({ open: false, userId: '', userName: '', raison: '' });
      showToast('success', 'Utilisateur banni avec succès.');
      router.refresh();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Erreur lors du bannissement.');
    } finally {
      setPendingId(null);
    }
  }

  async function handleUnban(userId: string) {
    setPendingId(userId);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.banUser(userId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: true }),
      });
      if (!res.ok) throw new Error(await getErrorMessage(res, 'Erreur lors du débannissement.'));
      showToast('success', 'Utilisateur débanni avec succès.');
      router.refresh();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Erreur lors du débannissement.');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5 flex-wrap">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/25" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5
              text-[13px] font-medium text-black placeholder-black/25
              focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/20
              transition-all shadow-sm"
          />
        </div>

        {/* Role tabs */}
        <div className="flex items-center gap-1.5">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setRoleFilter(tab.value)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-[12.5px] font-semibold transition-all duration-200',
                roleFilter === tab.value
                  ? 'bg-black text-emerald-400 shadow-sm shadow-black/10'
                  : 'bg-slate-100 text-black/50 hover:bg-slate-200 hover:text-black',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Compteur */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-[12px] font-medium text-black/30">
            {filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2
            rounded-xl bg-black text-emerald-400 text-[12px] font-black">
            {filtered.length}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Utilisateur', 'Rôle', 'KYC', 'Véhicules', 'Inscrit', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={cn(
                      'px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-black/30',
                      i === 5 ? 'text-right' : 'text-left',
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100">
                        <Users className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
                      </div>
                      <p className="text-[13px] font-bold text-black/30">
                        {search ? 'Aucun résultat pour cette recherche' : 'Aucun utilisateur'}
                      </p>
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch('')}
                          className="text-[12px] font-semibold text-emerald-500 hover:text-emerald-600 transition-colors"
                        >
                          Effacer la recherche
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    pendingId={pendingId}
                    onBan={(id, name) => setBanDialog({ open: true, userId: id, userName: name, raison: '' })}
                    onUnban={handleUnban}
                    onApproveKyc={handleApproveKyc}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban dialog */}
      {banDialog.open && (
        <BanDialog
          userName={banDialog.userName}
          raison={banDialog.raison}
          onRaisonChange={(v) => setBanDialog((d) => ({ ...d, raison: v }))}
          onConfirm={handleBan}
          onCancel={() => setBanDialog({ open: false, userId: '', userName: '', raison: '' })}
          loading={!!pendingId}
        />
      )}

      {/* Toast — design system */}
      {toast && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-2.5',
          'rounded-2xl px-4 py-3 text-[13px] font-bold shadow-xl max-w-sm',
          'animate-in slide-in-from-bottom-2 duration-300',
          toast.type === 'success'
            ? 'bg-black border border-emerald-400/30 text-white'
            : 'bg-red-500 text-white',
        )}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
            : <XCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
          }
          {toast.msg}
        </div>
      )}
    </>
  );
}
