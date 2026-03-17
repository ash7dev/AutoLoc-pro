'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Search, CheckCircle2, XCircle,
  BadgeCheck, ShieldOff, Shield, Loader2, AlertTriangle,
  Eye, Phone, Mail, Car, Calendar, X, CreditCard,
  ExternalLink, Clock, Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminUser } from '../../../lib/nestjs/admin';
import { ADMIN_PATHS } from '../../../lib/nestjs/admin';

// ── Types ──────────────────────────────────────────────────────────────────────

type RoleFilter = 'ALL' | 'LOCATAIRE' | 'PROPRIETAIRE';
type KycFilter  = 'ALL' | AdminUser['kycStatus'];

const PAGE_SIZE = 20;

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

const KYC_FILTER_TABS: { value: KycFilter; label: string }[] = [
  { value: 'ALL',         label: 'Tous'         },
  { value: 'EN_ATTENTE',  label: 'En attente'   },
  { value: 'VERIFIE',     label: 'Vérifié'      },
  { value: 'REJETE',      label: 'Rejeté'       },
  { value: 'NON_VERIFIE', label: 'Non vérifié'  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function exportUsersCsv(users: AdminUser[]) {
  const headers = ['Nom', 'Email', 'Téléphone', 'Rôle', 'KYC', 'Véhicules', 'Banni', 'Inscrit le'];
  const rows = users.map((u) => [
    u.utilisateur ? `${u.utilisateur.prenom} ${u.utilisateur.nom}` : '',
    u.email ?? '',
    u.utilisateur?.telephone ?? '',
    u.role,
    u.kycStatus,
    String(u._count?.vehicles ?? 0),
    u.isBanned ? 'Oui' : 'Non',
    new Date(u.createdAt).toLocaleDateString('fr-FR'),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'utilisateurs.csv'; a.click();
  URL.revokeObjectURL(url);
}

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

// ── User detail modal ──────────────────────────────────────────────────────────

function UserDetailModal({ user, onClose, onBan, onUnban, onApproveKyc, pendingId }: {
  user: AdminUser;
  onClose: () => void;
  onBan: (id: string, name: string) => void;
  onUnban: (id: string) => void;
  onApproveKyc: (id: string) => void;
  pendingId: string | null;
}) {
  const isLoading = pendingId === user.id;
  const role = ROLE_LABELS[user.role];
  const kyc  = KYC_LABELS[user.kycStatus];
  const name = getUserName(user);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl shadow-black/20 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90dvh]"
      >
        {/* Header */}
        <div className="relative flex-shrink-0 flex items-center justify-between px-5 py-4 bg-black overflow-hidden">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className={cn(
              'flex items-center justify-center w-11 h-11 rounded-xl text-[15px] font-black flex-shrink-0 overflow-hidden',
              user.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-emerald-400',
            )}>
              {user.utilisateur?.avatarUrl
                ? <img src={user.utilisateur.avatarUrl} alt={name} className="w-full h-full object-cover" />
                : getInitials(user)
              }
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Profil utilisateur</p>
              <p className="text-[14px] font-black text-white leading-tight">{name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border', role.bg, role.text, role.border)}>
                  {role.label}
                </span>
                {user.isBanned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-400/30 px-2 py-0.5 text-[10px] font-bold text-red-400">
                    <ShieldOff className="w-2.5 h-2.5" strokeWidth={2.5} /> Banni
                  </span>
                )}
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="relative z-10 flex items-center justify-center w-8 h-8 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">

          {/* Coordonnées */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Coordonnées</p>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 divide-y divide-slate-100">
              {user.email && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Mail className="w-3.5 h-3.5 text-black/30 flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-[13px] font-medium text-black/70 truncate">{user.email}</span>
                </div>
              )}
              {user.utilisateur?.telephone ? (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Phone className="w-3.5 h-3.5 text-black/30 flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-[13px] font-medium text-black/70">{user.utilisateur.telephone}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Phone className="w-3.5 h-3.5 text-black/20 flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-[13px] font-medium text-black/25 italic">Téléphone non renseigné</span>
                </div>
              )}
              <div className="flex items-center gap-3 px-4 py-3">
                <Calendar className="w-3.5 h-3.5 text-black/30 flex-shrink-0" strokeWidth={1.75} />
                <span className="text-[13px] font-medium text-black/70">
                  Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              {user.lastSeenAt && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Clock className="w-3.5 h-3.5 text-black/30 flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-[13px] font-medium text-black/70">
                    Vu le {new Date(user.lastSeenAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Statuts */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Vérifications</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1.5">KYC</p>
                <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-bold', kyc.text)}>
                  <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', kyc.dot)} />
                  {kyc.label}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1.5">Permis</p>
                <span className={cn(
                  'inline-flex items-center gap-1.5 text-[12px] font-bold',
                  user.kyc?.permisUrl ? 'text-emerald-600' : 'text-black/35',
                )}>
                  <CreditCard className="w-3.5 h-3.5" strokeWidth={1.75} />
                  {user.kyc?.permisUrl ? 'Fourni' : 'Non fourni'}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1.5">Véhicules</p>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-black/70">
                  <Car className="w-3.5 h-3.5 text-black/30" strokeWidth={1.75} />
                  {user._count?.vehicles ?? 0} annonce{(user._count?.vehicles ?? 0) > 1 ? 's' : ''}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1.5">Compte</p>
                <span className={cn('text-[12px] font-bold', user.isBanned ? 'text-red-500' : 'text-emerald-600')}>
                  {user.isBanned ? 'Banni' : 'Actif'}
                </span>
              </div>
            </div>
          </div>

          {/* Raison du ban */}
          {user.isBanned && user.banRaison && (
            <div className="rounded-xl border border-red-100 bg-red-50/60 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Raison du bannissement</p>
              <p className="text-[13px] font-medium text-red-700">{user.banRaison}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/80 px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose}
              className="text-[12.5px] font-semibold text-black/40 hover:text-black/70 transition-colors">
              Fermer
            </button>
            {user.role === 'PROPRIETAIRE' && (user._count?.vehicles ?? 0) > 0 && (
              <a
                href={`/dashboard/admin/vehicles?owner=${user.id}`}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                Voir les annonces
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user.kycStatus === 'EN_ATTENTE' && (
              <button type="button" disabled={isLoading}
                onClick={() => { onApproveKyc(user.id); onClose(); }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-300/50 bg-amber-50 text-[12px] font-bold text-amber-700 hover:bg-amber-100 transition-all disabled:opacity-40">
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2} />}
                Approuver KYC
              </button>
            )}
            {user.role !== 'ADMIN' && (
              user.isBanned ? (
                <button type="button" disabled={isLoading}
                  onClick={() => { onUnban(user.id); onClose(); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black text-emerald-400 text-[12px] font-bold hover:bg-emerald-500 hover:text-white shadow-sm transition-all disabled:opacity-40">
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" strokeWidth={2} />}
                  Débannir
                </button>
              ) : (
                <button type="button" disabled={isLoading}
                  onClick={() => { onClose(); onBan(user.id, name); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-[12px] font-bold text-black/50 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-40">
                  <ShieldOff className="w-3.5 h-3.5" strokeWidth={2} />
                  Bannir
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
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

function UserRow({ user, pendingId, onBan, onUnban, onApproveKyc, onViewDetail }: {
  user: AdminUser;
  pendingId: string | null;
  onBan: (id: string, name: string) => void;
  onUnban: (id: string) => void;
  onApproveKyc: (id: string) => void;
  onViewDetail: (user: AdminUser) => void;
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
          {/* Voir profil */}
          <button
            type="button"
            onClick={() => onViewDetail(user)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-[11.5px] font-bold text-black/50 hover:bg-slate-50 hover:text-black hover:border-slate-300 transition-all"
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
            Voir
          </button>

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
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [kycFilter, setKycFilter]   = useState<KycFilter>('ALL');
  const [page, setPage]             = useState(0);
  const [pendingId, setPendingId]   = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [toast, setToast]           = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [banDialog, setBanDialog]   = useState<{
    open: boolean; userId: string; userName: string; raison: string;
  }>({ open: false, userId: '', userName: '', raison: '' });

  const safeUsers = Array.isArray(users) ? users : [];
  const filtered = safeUsers.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (kycFilter  !== 'ALL' && u.kycStatus !== kycFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = u.utilisateur
      ? `${u.utilisateur.prenom} ${u.utilisateur.nom}`.toLowerCase()
      : '';
    const phone = u.utilisateur?.telephone ?? '';
    return name.includes(q) || (u.email ?? '').toLowerCase().includes(q) || phone.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages - 1);
  const paginated  = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function resetPage() { setPage(0); }

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
      <div className="flex flex-col gap-3 mb-5">
        {/* Row 1: Search + counter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/25" strokeWidth={2} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Nom, email ou téléphone…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5
                text-[13px] font-medium text-black placeholder-black/25
                focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/20
                transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={() => exportUsersCsv(filtered)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-[12px] font-semibold text-black/50 hover:bg-slate-50 hover:text-black hover:border-slate-300 transition-all"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={2} />
              CSV
            </button>
            <span className="text-[12px] font-medium text-black/30">
              {filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2
              rounded-xl bg-black text-emerald-400 text-[12px] font-black">
              {filtered.length}
            </span>
          </div>
        </div>

        {/* Row 2: Role tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {ROLE_TABS.map((tab) => (
            <button key={tab.value} type="button"
              onClick={() => { setRoleFilter(tab.value); resetPage(); }}
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
          <span className="w-px h-5 bg-slate-200 mx-1" />
          {KYC_FILTER_TABS.map((tab) => {
            const cfg = tab.value !== 'ALL' ? KYC_LABELS[tab.value as AdminUser['kycStatus']] : null;
            return (
              <button key={tab.value} type="button"
                onClick={() => { setKycFilter(tab.value); resetPage(); }}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold transition-all duration-200',
                  kycFilter === tab.value
                    ? 'bg-black text-emerald-400 shadow-sm shadow-black/10'
                    : 'bg-slate-100 text-black/50 hover:bg-slate-200 hover:text-black',
                )}
              >
                {cfg && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />}
                {tab.label}
              </button>
            );
          })}
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
                paginated.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    pendingId={pendingId}
                    onBan={(id, name) => setBanDialog({ open: true, userId: id, userName: name, raison: '' })}
                    onUnban={handleUnban}
                    onApproveKyc={handleApproveKyc}
                    onViewDetail={setDetailUser}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
            <span className="text-[12px] font-medium text-black/35">
              Page {safePage + 1} / {totalPages} · {filtered.length} résultats
            </span>
            <div className="flex items-center gap-1.5">
              <button type="button" disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-[12px] font-semibold text-black/50
                  hover:bg-white hover:text-black hover:border-slate-300 transition-all
                  disabled:opacity-30 disabled:cursor-not-allowed">
                ← Préc.
              </button>
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((i) => Math.abs(i - safePage) <= 2)
                .map((i) => (
                  <button key={i} type="button" onClick={() => setPage(i)}
                    className={cn(
                      'w-8 h-8 rounded-xl text-[12px] font-bold transition-all',
                      i === safePage
                        ? 'bg-black text-emerald-400'
                        : 'border border-slate-200 text-black/40 hover:bg-white hover:text-black hover:border-slate-300',
                    )}>
                    {i + 1}
                  </button>
                ))
              }
              <button type="button" disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-[12px] font-semibold text-black/50
                  hover:bg-white hover:text-black hover:border-slate-300 transition-all
                  disabled:opacity-30 disabled:cursor-not-allowed">
                Suiv. →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detailUser && (
        <UserDetailModal
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onBan={(id, name) => setBanDialog({ open: true, userId: id, userName: name, raison: '' })}
          onUnban={handleUnban}
          onApproveKyc={handleApproveKyc}
          pendingId={pendingId}
        />
      )}

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
