'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck, CheckCircle2, Search, Clock,
  FileText, Loader2, XCircle, X, Eye, ZoomIn,
  Square, CheckSquare, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminUser } from '../../../lib/nestjs/admin';
import { ADMIN_PATHS } from '../../../lib/nestjs/admin';

// ── Helpers ────────────────────────────────────────────────────────────────────

function avatarInitials(user: AdminUser) {
  const p = user.utilisateur?.prenom?.[0] ?? '';
  const n = user.utilisateur?.nom?.[0] ?? '';
  return (p + n).toUpperCase() || user.email?.[0]?.toUpperCase() || '?';
}

function userName(user: AdminUser) {
  return user.utilisateur
    ? `${user.utilisateur.prenom} ${user.utilisateur.nom}`
    : (user.email ?? user.id);
}

// ── Lightbox ───────────────────────────────────────────────────────────────────

function Lightbox({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm
        animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 flex items-center justify-center w-10 h-10
          rounded-xl border border-white/10 text-white/40
          hover:text-white hover:bg-white/10 transition-all"
      >
        <X className="w-5 h-5" strokeWidth={2} />
      </button>
      <div className="p-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={url}
          alt={label}
          className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain shadow-2xl"
        />
        <p className="text-center text-white/30 text-[11px] font-medium mt-3 uppercase tracking-widest">
          {label}
        </p>
      </div>
    </div>
  );
}

// ── Doc slot ───────────────────────────────────────────────────────────────────

function DocSlot({
  url, label, onZoom,
}: { url: string | null; label: string; onZoom: (url: string, label: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-black/30">{label}</p>
      {url ? (
        <button
          type="button"
          onClick={() => onZoom(url, label)}
          className="group relative rounded-xl overflow-hidden border border-slate-200
            hover:border-black/20 transition-all aspect-[3/2] bg-slate-100"
        >
          <img src={url} alt={label} className="w-full h-full object-cover
            transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 flex items-center justify-center
            bg-black/0 group-hover:bg-black/40 transition-all duration-200">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity
              inline-flex items-center gap-1.5 rounded-xl bg-black/70
              px-3 py-1.5 text-[11px] font-bold text-white">
              <ZoomIn className="w-3 h-3" strokeWidth={2} />
              Agrandir
            </span>
          </div>
        </button>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2
          aspect-[3/2] rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
          <FileText className="w-5 h-5 text-slate-300" strokeWidth={1.25} />
          <p className="text-[10px] font-medium text-slate-400">Non fourni</p>
        </div>
      )}
    </div>
  );
}

// ── KYC Modal ─────────────────────────────────────────────────────────────────

function KycModal({
  user, onClose, onApprove, onReject, isProcessing,
}: {
  user: AdminUser;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (user: AdminUser) => void;
  isProcessing: boolean;
}) {
  const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);
  const hasPermis = !!user.kyc?.permisUrl;
  const hasAnyDoc = !!user.kyc?.documentUrl || !!user.kyc?.selfieUrl;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape' && !lightbox) onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose, lightbox]);

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4
          animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl shadow-black/25 overflow-hidden
            animate-in zoom-in-95 duration-200 flex flex-col max-h-[90dvh]"
        >
          {/* ── Header ── */}
          <div className="relative flex-shrink-0 flex items-center justify-between px-5 py-4 bg-black overflow-hidden">
            <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-4 right-20 w-20 h-20 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 text-[14px] font-black flex-shrink-0">
                {(user.utilisateur?.prenom?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">
                  Dossier KYC
                </p>
                <p className="text-[14px] font-black text-white leading-tight">{userName(user)}</p>
                <p className="text-[11px] font-medium text-white/40">{user.email}</p>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30
                bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                En attente
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-xl
                  border border-white/10 text-white/40
                  hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {user.kyc ? (
              <div className="p-5 space-y-5">

                {/* Soumis le */}
                <div className="flex items-center gap-2 text-[11.5px] font-medium text-black/35">
                  <Clock className="w-3.5 h-3.5 text-black/20" strokeWidth={1.75} />
                  Soumis le{' '}
                  <span className="font-bold text-black/50">
                    {new Date(user.kyc.soumisLe).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>

                {/* CNI / Passeport */}
                {hasAnyDoc && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                      </div>
                      <p className="text-[12px] font-black text-black uppercase tracking-wide">
                        Pièce d&apos;identité
                      </p>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <DocSlot url={user.kyc.documentUrl} label="Recto" onZoom={(u, l) => setLightbox({ url: u, label: l })} />
                      <DocSlot url={user.kyc.selfieUrl}   label="Verso" onZoom={(u, l) => setLightbox({ url: u, label: l })} />
                    </div>
                  </div>
                )}

                {/* Permis de conduire */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0',
                      hasPermis ? 'bg-emerald-50' : 'bg-slate-100',
                    )}>
                      <BadgeCheck className={cn('w-3.5 h-3.5', hasPermis ? 'text-emerald-500' : 'text-slate-400')} strokeWidth={1.75} />
                    </div>
                    <p className="text-[12px] font-black text-black uppercase tracking-wide">
                      Permis de conduire
                    </p>
                    {hasPermis && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100
                        px-2 py-0.5 text-[9.5px] font-bold text-emerald-600">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Fourni
                      </span>
                    )}
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                  {hasPermis ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <DocSlot url={user.kyc.permisUrl!} label="Photo permis" onZoom={(u, l) => setLightbox({ url: u, label: l })} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
                      <FileText className="w-4 h-4 text-slate-300 flex-shrink-0" strokeWidth={1.25} />
                      <p className="text-[12px] font-medium text-slate-400">
                        Aucun permis soumis par l&apos;utilisateur
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-black/25">
                <FileText className="w-9 h-9" strokeWidth={1.25} />
                <p className="text-[13px] font-semibold">Aucun document soumis</p>
              </div>
            )}
          </div>

          {/* ── Sticky footer avec actions ── */}
          <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/80 px-5 py-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-[12.5px] font-semibold text-black/40 hover:text-black/70 transition-colors"
            >
              Fermer
            </button>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => { onClose(); onReject(user); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                  border border-slate-200 bg-white text-[12.5px] font-bold text-black/50
                  hover:bg-red-50 hover:text-red-500 hover:border-red-200
                  transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Rejeter
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => { onApprove(user.id); onClose(); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                  bg-black text-emerald-400 text-[12.5px] font-bold
                  hover:bg-emerald-500 hover:text-white
                  shadow-sm shadow-black/10
                  transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                }
                Approuver le KYC
              </button>
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <Lightbox url={lightbox.url} label={lightbox.label} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

// ── Reject dialog ─────────────────────────────────────────────────────────────

function RejectDialog({
  user, onConfirm, onCancel, isLoading,
}: {
  user: AdminUser;
  onConfirm: (raison: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [raison, setRaison] = useState('');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4
        animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl shadow-black/20
          animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[14px] font-black text-black">Rejeter le KYC</p>
          <p className="text-[12px] font-medium text-black/40 mt-0.5">
            Demande de{' '}
            <span className="font-bold text-black/60">{userName(user)}</span>
          </p>
        </div>

        <div className="p-5">
          <label className="block mb-1.5 text-[11.5px] font-bold text-black/50">
            Raison du rejet{' '}
            <span className="font-medium text-black/25">(optionnel)</span>
          </label>
          <textarea
            value={raison}
            onChange={(e) => setRaison(e.target.value)}
            placeholder="Ex : Document illisible, photo floue, pièce expirée…"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px]
              font-medium text-black placeholder-black/25 resize-none
              focus:border-red-400/50 focus:outline-none focus:ring-1 focus:ring-red-400/20
              transition-all"
          />

          <div className="flex gap-2.5 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50
                text-[12.5px] font-bold text-black/50 py-2.5
                hover:bg-slate-100 hover:border-slate-300 transition-all"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onConfirm(raison)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl
                bg-red-500 text-white text-[12.5px] font-bold py-2.5
                hover:bg-red-600 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <XCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
              }
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── KYC row ────────────────────────────────────────────────────────────────────

function KycRow({ user, pendingId, onApprove, onReject, onViewKyc, selected, onToggleSelect }: {
  user: AdminUser;
  pendingId: string | null;
  onApprove: (id: string) => void;
  onReject: (user: AdminUser) => void;
  onViewKyc: (user: AdminUser) => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const isLoading = pendingId === user.id;

  return (
    <tr className={cn(
      'border-b border-slate-50 last:border-b-0 transition-colors group',
      selected ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : 'hover:bg-slate-50/60',
    )}>

      {/* Checkbox */}
      <td className="pl-4 pr-1 py-3.5 w-10">
        <button
          type="button"
          onClick={() => onToggleSelect(user.id)}
          className="flex items-center justify-center w-5 h-5 rounded-md border-2 transition-all duration-150
            focus:outline-none"
          style={{ borderColor: selected ? 'transparent' : undefined }}
        >
          {selected
            ? <CheckSquare className="w-5 h-5 text-emerald-500" strokeWidth={2} />
            : <Square className="w-5 h-5 text-black/20 hover:text-black/40" strokeWidth={1.75} />
          }
        </button>
      </td>

      {/* Utilisateur */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          {/* Avatar avec initiales */}
          <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl
            bg-black text-emerald-400 text-[12px] font-black overflow-hidden">
            {user.utilisateur?.avatarUrl ? (
              <img src={user.utilisateur.avatarUrl} alt={userName(user)} className="w-full h-full object-cover" />
            ) : (
              avatarInitials(user)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-black truncate leading-tight">{userName(user)}</p>
            <p className="text-[11px] font-medium text-black/35 truncate">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Soumis le */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        {user.kyc ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-black/40">
            <Clock className="h-3 w-3 text-black/20" strokeWidth={1.75} />
            {new Date(user.kyc.soumisLe).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        ) : (
          <span className="text-[12px] font-medium text-black/20">—</span>
        )}
      </td>

      {/* Documents */}
      <td className="px-5 py-3.5">
        {user.kyc ? (
          <button
            type="button"
            onClick={() => onViewKyc(user)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
              border border-slate-200 bg-white text-[11.5px] font-bold text-black/60
              hover:bg-slate-50 hover:border-slate-300 hover:text-black
              transition-all duration-150"
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
            Voir les docs
          </button>
        ) : (
          <span className="text-[12px] font-medium text-black/20">Non soumis</span>
        )}
      </td>

      {/* Statut */}
      <td className="px-5 py-3.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
          border border-amber-300/50 bg-amber-50 text-[11px] font-bold text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          En attente
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onApprove(user.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl
              bg-black text-emerald-400 text-[11.5px] font-bold
              hover:bg-emerald-400 hover:text-black
              shadow-sm shadow-black/10
              transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
            }
            Approuver
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onReject(user)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl
              border border-slate-200 text-[11.5px] font-bold text-black/50
              hover:bg-red-50 hover:text-red-500 hover:border-red-200
              transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
            Rejeter
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AdminKycList({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [search, setSearch]             = useState('');
  const [pendingId, setPendingId]       = useState<string | null>(null);
  const [bulkLoading, setBulkLoading]   = useState(false);
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [kycModalUser, setKycModalUser] = useState<AdminUser | null>(null);
  const [rejectUser, setRejectUser]     = useState<AdminUser | null>(null);
  const [toast, setToast]               = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const safeUsers = Array.isArray(users) ? users : [];

  const filtered = safeUsers.filter((u) => {
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

  async function handleApprove(userId: string) {
    setPendingId(userId);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.approveKyc(userId)}`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      showToast('success', 'KYC approuvé avec succès.');
      router.refresh();
    } catch {
      showToast('error', 'Une erreur est survenue. Réessayez.');
    } finally {
      setPendingId(null);
    }
  }

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.id)));
    }
  }

  async function handleBulkApprove() {
    const ids = Array.from(selected);
    if (!ids.length) return;
    setBulkLoading(true);
    let ok = 0; let fail = 0;
    for (const id of ids) {
      try {
        const res = await fetch(`/api/nest${ADMIN_PATHS.approveKyc(id)}`, { method: 'PATCH' });
        if (res.ok) ok++; else fail++;
      } catch { fail++; }
    }
    setBulkLoading(false);
    setSelected(new Set());
    showToast(fail === 0 ? 'success' : 'error',
      fail === 0
        ? `${ok} KYC approuvé${ok > 1 ? 's' : ''} avec succès.`
        : `${ok} approuvé${ok > 1 ? 's' : ''}, ${fail} échec${fail > 1 ? 's' : ''}.`
    );
    router.refresh();
  }

  async function handleRejectConfirm(raison: string) {
    if (!rejectUser) return;
    const userId = rejectUser.id;
    setPendingId(userId);
    setRejectUser(null);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.rejectKyc(userId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raison: raison.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      showToast('success', 'KYC rejeté.');
      router.refresh();
    } catch {
      showToast('error', 'Une erreur est survenue. Réessayez.');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      {/* ── Bulk action bar ── */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-3 mb-4 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-500 text-white text-[12px] font-black">
              {selected.size}
            </span>
            <span className="text-[13px] font-bold text-emerald-800">
              dossier{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSelected(new Set())}
              className="text-[12px] font-semibold text-emerald-700/60 hover:text-emerald-800 transition-colors">
              Annuler
            </button>
            <button
              type="button"
              disabled={bulkLoading}
              onClick={handleBulkApprove}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-[12.5px] font-bold hover:bg-emerald-600 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {bulkLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
              }
              Approuver tout ({selected.size})
            </button>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/25" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelected(new Set()); }}
            placeholder="Rechercher un utilisateur…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5
              text-[13px] font-medium text-black placeholder-black/25
              focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/20
              transition-all shadow-sm"
          />
        </div>

        {/* Compteur */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-black/35">
            {filtered.length} demande{filtered.length > 1 ? 's' : ''}
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
                {/* Select-all */}
                <th className="pl-4 pr-1 py-3 w-10">
                  <button type="button" onClick={toggleSelectAll}
                    className="flex items-center justify-center">
                    {filtered.length > 0 && selected.size === filtered.length
                      ? <CheckSquare className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                      : <Square className="w-4 h-4 text-black/20 hover:text-black/40" strokeWidth={1.75} />
                    }
                  </button>
                </th>
                {['Utilisateur', 'Soumis le', 'Documents', 'Statut', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={cn(
                      'px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-black/30',
                      i === 4 ? 'text-right' : 'text-left',
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
                        <BadgeCheck className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
                      </div>
                      <p className="text-[13px] font-bold text-black/30">
                        {search ? 'Aucun résultat pour cette recherche' : 'Aucune demande KYC en attente'}
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
                  <KycRow
                    key={u.id}
                    user={u}
                    pendingId={pendingId}
                    onApprove={handleApprove}
                    onReject={setRejectUser}
                    onViewKyc={setKycModalUser}
                    selected={selected.has(u.id)}
                    onToggleSelect={toggleSelect}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {kycModalUser && (
        <KycModal
          user={kycModalUser}
          onClose={() => setKycModalUser(null)}
          onApprove={handleApprove}
          onReject={setRejectUser}
          isProcessing={pendingId === kycModalUser.id}
        />
      )}
      {rejectUser && (
        <RejectDialog
          user={rejectUser}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectUser(null)}
          isLoading={pendingId === rejectUser.id}
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