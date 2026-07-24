'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
    User,
    Loader2,
    CheckCircle2,
    XCircle,
    Mail,
    Phone,
    Calendar,
    BadgeCheck,
    ShieldAlert,
    AlertTriangle,
    Pencil,
    Check,
    X,
    ChevronRight,
    Camera,
    Sparkles,
    Lock,
    Star,
    UserRound,
    Bell,
    RefreshCw,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateInput } from '@/features/shared/DateInput';
import type { UserProfile } from '@/lib/nestjs/auth';
import { updateUserProfile, deleteAccount } from '@/lib/nestjs/auth';
import { uploadAvatar, deleteAvatar } from '@/lib/nestjs/profile';
import { useSwitchToLocataire } from '@/features/owner/hooks/use-switch-to-locataire';
import { useSwitchToProprietaire } from '@/features/owner/hooks/use-switch-to-proprietaire';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { PhoneEditModal } from './phone-edit-modal';
import { AvatarUploadModal } from './avatar-upload-modal';

/* ── Helpers ─────────────────────────────────────────────────────── */

function getInitials(prenom: string, nom: string) {
    return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase() || '?';
}

function completionPercent(p: UserProfile) {
    const steps = [
        { done: !!p.prenom, label: 'Prénom' },
        { done: !!p.nom, label: 'Nom' },
        { done: !!p.dateNaissance, label: 'Date de naissance' },
        { done: !!p.telephone, label: 'Téléphone' },
        { done: p.phoneVerified, label: 'Téléphone vérifié' },
        { done: p.statutKyc === 'VERIFIE', label: 'Identité vérifiée' },
    ];
    return {
        percent: Math.round((steps.filter((s) => s.done).length / steps.length) * 100),
        missing: steps.filter((s) => !s.done).map((s) => s.label),
    };
}

/* ── Section wrapper ─────────────────────────────────────────────── */

function Section({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-4 px-0.5">
                <h3 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-black">{title}</h3>
                {subtitle && <p className="text-[13px] sm:text-[14px] text-black/30 mt-1 font-medium tracking-tight">{subtitle}</p>}
            </div>
            <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden divide-y divide-black/[0.02]">
                {children}
            </div>
        </div>
    );
}

/* ── Inline-edit row ────────────────────────────────────────────── */

function EditableRow({
    label,
    description,
    value,
    displayValue,
    type = 'text',
    onSave,
    icon: Icon,
    placeholder,
}: {
    label: string;
    description?: string;
    value: string;
    displayValue?: string;
    type?: string;
    onSave: (v: string) => Promise<void>;
    icon: React.ElementType;
    placeholder?: string;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const [saving, setSaving] = useState(false);
    const [flash, setFlash] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleEdit() {
        setDraft(value);
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    }

    function handleCancel() {
        setEditing(false);
        setDraft(value);
    }

    async function handleSave() {
        if (draft.trim() === value) { setEditing(false); return; }
        setSaving(true);
        try {
            await onSave(draft.trim());
            setFlash(true);
            setTimeout(() => setFlash(false), 2000);
        } finally {
            setSaving(false);
            setEditing(false);
        }
    }

    return (
        <div className={cn(
            'px-4 py-4 sm:px-5 transition-colors duration-200',
            flash && 'bg-emerald-50/60',
        )}>
            <div className="flex items-start gap-3">
                {/* Icon */}
                <span className="mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-900 transition-colors duration-200">
                    <Icon className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                </span>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[13.5px] font-bold text-black leading-tight">{label}</p>
                            {description && !editing && (
                                <p className="text-[12px] text-black/40 mt-0.5 font-medium">{description}</p>
                            )}
                        </div>
                        {!editing && (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="flex-shrink-0 flex items-center gap-1.5 text-[12px] font-bold text-black/40 hover:text-black transition-colors px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] group"
                            >
                                <Pencil className="w-3 h-3 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                                <span className="hidden sm:inline">Modifier</span>
                            </button>
                        )}
                    </div>

                    {/* Current value */}
                    {!editing && (
                        <p className={cn(
                            'text-[13px] font-bold mt-1.5 tracking-tight',
                            value ? 'text-black/60' : 'text-black/20 italic font-medium',
                        )}>
                            {flash
                                ? <span className="flex items-center gap-1.5 text-emerald-600 font-bold"><CheckCircle2 className="w-3.5 h-3.5" />Enregistré</span>
                                : (displayValue ?? (value || 'Non renseigné'))}
                        </p>
                    )}

                    {/* Inline edit form */}
                    {editing && (
                        <div className="mt-2 flex items-center gap-2">
                            {type === 'date' ? (
                                <DateInput
                                    value={draft}
                                    onChange={(v) => setDraft(v)}
                                    className="flex-1"
                                />
                            ) : (
                                <input
                                    ref={inputRef}
                                    type={type}
                                    value={draft}
                                    placeholder={placeholder}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave();
                                        if (e.key === 'Escape') handleCancel();
                                    }}
                                    className="flex-1 min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2 text-[13.5px] font-bold text-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-black/20"
                                />
                            )}
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || (type === 'date' && draft.length < 10 && draft !== '')}
                                className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-shrink-0 w-8 h-8 rounded-xl bg-black/[0.04] text-black/40 flex items-center justify-center hover:bg-black/[0.08] transition-colors"
                            >
                                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Info row (non-editable) ─────────────────────────────────────── */

function InfoRow({
    label,
    value,
    icon: Icon,
    badge,
    action,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    badge?: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div className="px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[13.5px] font-bold text-black leading-tight">{label}</p>
                        {badge}
                    </div>
                    <p className="text-[13px] font-bold text-black/40 mt-1 truncate tracking-tight">{value || '—'}</p>
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
                {!action && <Lock className="w-3 h-3 text-black/[0.1] flex-shrink-0" />}
            </div>
        </div>
    );
}

/* ── CTA row ─────────────────────────────────────────────────────── */

function CtaRow({
    icon: Icon,
    iconBg,
    iconColor,
    title,
    subtitle,
    href,
    buttonLabel,
    buttonVariant = 'default',
}: {
    icon: React.ElementType;
    iconBg?: string;
    iconColor?: string;
    title: string;
    subtitle: string;
    href: string;
    buttonLabel: string;
    buttonVariant?: 'default' | 'warning' | 'emerald';
}) {
    return (
        <div className="px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-900">
                    <Icon className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-bold text-black">{title}</p>
                    <p className="text-[12px] text-black/40 mt-0.5 font-medium">{subtitle}</p>
                </div>
                <Link
                    href={href}
                    className={cn(
                        'flex-shrink-0 flex items-center gap-1 text-[12px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all duration-150',
                        buttonVariant === 'warning' && 'bg-amber-100 text-amber-700 hover:bg-amber-200',
                        buttonVariant === 'emerald' && 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-0.5',
                        buttonVariant === 'default' && 'bg-black text-white hover:bg-black/90 shadow-lg shadow-black/10 hover:-translate-y-0.5',
                    )}
                >
                    {buttonLabel}
                    <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
                </Link>
            </div>
        </div>
    );
}

/* ── Notification row ────────────────────────────────────────────── */

function NotificationRow() {
    const { subscription, subscribe, unsubscribe, isSupported, permission, loading } = usePushNotifications();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (!isSupported) {
        return (
            <div className="px-4 py-4 sm:px-5 bg-black/[0.01]">
                <div className="flex items-center gap-3 opacity-50">
                    <span className="w-8 h-8 rounded-xl bg-slate-900/40 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-3.5 h-3.5 text-emerald-400/40" strokeWidth={2} />
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-bold text-black">Notifications Push</p>
                        <p className="text-[12px] text-black/40 mt-0.5 font-medium">Non supportées sur ce navigateur.</p>
                    </div>
                </div>
            </div>
        );
    }

    const isDenied = permission === 'denied';

    return (
        <div className="px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-900 transition-colors duration-300">
                    <Bell className="w-3.5 h-3.5 text-emerald-400 transition-colors duration-300" strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-bold text-black">Notifications Push</p>
                    <p className="text-[12px] text-black/40 mt-0.5 font-medium">
                        {isDenied
                            ? "L'accès est bloqué dans votre navigateur."
                            : subscription
                                ? 'Activées — vous recevrez des alertes en temps réel.'
                                : 'Recevez des alertes pour vos réservations.'
                        }
                    </p>
                </div>

                <button
                    type="button"
                    onClick={subscription ? unsubscribe : subscribe}
                    disabled={loading || isDenied}
                    className={cn(
                        'flex-shrink-0 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all duration-200',
                        subscription
                            ? 'bg-black text-white hover:bg-black/80 shadow-lg shadow-black/10'
                            : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-0.5',
                        (loading || isDenied) && 'opacity-50 cursor-not-allowed transform-none'
                    )}
                >
                    {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <>
                            {subscription ? 'Désactiver' : 'Activer'}
                            {!subscription && !isDenied && <Sparkles className="w-3 h-3 ml-0.5" />}
                        </>
                    )}
                </button>
            </div>

            {isDenied && (
                <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-red-50/50 border border-red-100">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                        Les notifications sont désactivées. Pour les activer, vous devez autoriser ce site dans les réglages de votre navigateur.
                    </p>
                </div>
            )}
        </div>
    );
}

/* ── Main component ──────────────────────────────────────────────── */

interface Props {
    profile: UserProfile;
}

export function SettingsForm({ profile }: Props): React.ReactElement {
    const [prenom, setPrenom] = useState(profile.prenom ?? '');
    const [nom, setNom] = useState(profile.nom ?? '');
    const [dateNaissance, setDateNaissance] = useState(
        profile.dateNaissance ? profile.dateNaissance.split('T')[0] : '',
    );
    const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const [showKycAlert, setShowKycAlert] = useState(false);
    const [phoneEditOpen, setPhoneEditOpen] = useState(false);
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);
    const { switchToLocataire, loading: switchingToTenant } = useSwitchToLocataire();
    const { switchToProprietaire, loading: switchingToOwner } = useSwitchToProprietaire();
    const router = useRouter();

    const switching = switchingToTenant || switchingToOwner;

    const { percent, missing } = completionPercent({
        ...profile,
        prenom,
        nom,
        dateNaissance: dateNaissance || null,
    });

    const memberSince = new Date(profile.creeLe).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const fmtDate = (iso: string) =>
        iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

    async function savePrenom(v: string) {
        setGlobalError('');
        try {
            const res = await updateUserProfile({ prenom: v, nom, dateNaissance: dateNaissance || undefined });
            setPrenom(v);
            if (res.kycReset) setShowKycAlert(true);
        } catch { setGlobalError('Erreur lors de la mise à jour du prénom'); }
    }

    async function saveNom(v: string) {
        setGlobalError('');
        try {
            const res = await updateUserProfile({ prenom, nom: v, dateNaissance: dateNaissance || undefined });
            setNom(v);
            if (res.kycReset) setShowKycAlert(true);
        } catch { setGlobalError('Erreur lors de la mise à jour du nom'); }
    }

    async function saveEmail(v: string) {
        setGlobalError('');
        try {
            await updateUserProfile({ email: v });

            // L'email a changé, il faut déconnecter l'utilisateur pour regénérer le token
            alert('Email modifié avec succès ! Vous allez être déconnecté pour que les changements prennent effet.');

            // Supprimer les tokens
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

            // Rediriger vers la page de connexion
            window.location.href = '/';
        } catch (err: any) {
            setGlobalError(err?.message || 'Erreur lors de la mise à jour de l\'email');
        }
    }

    async function saveDateNaissance(v: string) {
        setGlobalError('');
        try {
            const res = await updateUserProfile({ prenom, nom, dateNaissance: v || undefined });
            setDateNaissance(v);
            if (res.kycReset) setShowKycAlert(true);
        } catch { setGlobalError('Erreur lors de la mise à jour de la date'); }
    }

    async function handleAvatarUpload(file: File) {
        setGlobalError('');
        setUploadingAvatar(true);
        try {
            const result = await uploadAvatar(file);
            setAvatarUrl(result.avatarUrl);
            router.refresh();
        } catch (err) {
            setGlobalError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
            throw err; // Re-throw to let modal handle the error display
        } finally {
            setUploadingAvatar(false);
        }
    }

    async function handleAvatarDelete() {
        if (!avatarUrl) return;
        if (!confirm('Voulez-vous vraiment supprimer votre photo de profil ?')) return;

        setGlobalError('');
        setUploadingAvatar(true);
        try {
            await deleteAvatar();
            setAvatarUrl(null);
            router.refresh();
        } catch (err) {
            setGlobalError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
        } finally {
            setUploadingAvatar(false);
        }
    }

    const kycBadge = profile.statutKyc === 'VERIFIE' ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
            <BadgeCheck className="w-2.5 h-2.5" /> Vérifié
        </span>
    ) : profile.statutKyc === 'EN_ATTENTE' ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
            <ShieldAlert className="w-2.5 h-2.5" /> En attente
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/[0.04] text-black/40 border border-black/[0.06]">
            <ShieldAlert className="w-2.5 h-2.5" /> Non vérifié
        </span>
    );

    const phoneBadge = profile.phoneVerified ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-2.5 h-2.5" /> Vérifié
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
            <AlertTriangle className="w-2.5 h-2.5" /> Non vérifié
        </span>
    );

    const roleLabel: Record<string, string> = {
        PROPRIETAIRE: 'Propriétaire',
        LOCATAIRE: 'Locataire',
        ADMIN: 'Administrateur',
    };

    return (
        <div className="space-y-6">

            {/* ── Avatar + Profile completion ───────────────────────── */}
            <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5 sm:p-6 shadow-black/[0.02]">
                <div className="flex items-center gap-4 sm:gap-5">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 select-none relative overflow-hidden">
                            {uploadingAvatar && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                </div>
                            )}
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                            ) : (
                                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    {getInitials(prenom, nom)}
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            title="Changer la photo"
                            onClick={() => setAvatarModalOpen(true)}
                            disabled={uploadingAvatar}
                            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-white border border-black/[0.1] shadow-md flex items-center justify-center hover:bg-black/[0.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Camera className="w-3 h-3 text-black/40" strokeWidth={2} />
                        </button>
                        {avatarUrl && (
                            <button
                                type="button"
                                title="Supprimer la photo"
                                onClick={handleAvatarDelete}
                                disabled={uploadingAvatar}
                                className="absolute -bottom-1.5 -left-1.5 w-7 h-7 rounded-xl bg-white border border-red-200 shadow-md flex items-center justify-center hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-3 h-3 text-red-500" strokeWidth={2} />
                            </button>
                        )}
                    </div>

                    {/* Name + completion */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[16px] sm:text-[18px] font-black text-black truncate leading-tight">
                            {prenom || nom ? `${prenom} ${nom}`.trim() : 'Votre profil'}
                        </p>
                        <p className="text-[12px] text-black/40 mt-0.5 font-medium truncate">{profile.email}</p>

                        {/* Completion */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10.5px] font-black uppercase tracking-widest text-black/40">
                                    Profil complété
                                </span>
                                <span className={cn(
                                    'text-[11px] font-bold',
                                    percent === 100 ? 'text-emerald-600' : percent >= 70 ? 'text-amber-500' : 'text-black/20',
                                )}>
                                    {percent}%
                                </span>
                            </div>
                            <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all duration-700',
                                        percent === 100 ? 'bg-emerald-500' : percent >= 70 ? 'bg-amber-400' : 'bg-black/20',
                                    )}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            {missing.length > 0 && (
                                <p className="text-[11px] text-black/30 mt-1.5 font-medium">
                                    Manquant : {missing.slice(0, 2).join(', ')}{missing.length > 2 ? ` +${missing.length - 2}` : ''}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Note / rating */}
                {(profile.noteProprietaire > 0 || profile.totalAvis > 0) && (
                    <div className="mt-5 pt-5 border-t border-black/[0.04] flex items-center gap-5">
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-[14px] font-black text-black">
                                {profile.noteProprietaire.toFixed(1)}
                            </span>
                            <span className="text-[12px] text-black/30">/ 5</span>
                        </div>
                        <div className="w-px h-4 bg-black/[0.06]" />
                        <span className="text-[13px] text-black/40 font-bold">
                            {profile.totalAvis} avis reçu{profile.totalAvis > 1 ? 's' : ''}
                        </span>
                        <div className="w-px h-4 bg-black/[0.06]" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-black/30">
                            {roleLabel[profile.role] ?? profile.role}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Identité ──────────────────────────────────────────── */}
            <Section title="Identité" subtitle="Ces informations sont visibles par les locataires.">
                <EditableRow
                    label="Prénom"
                    value={prenom}
                    onSave={savePrenom}
                    icon={User}
                    placeholder="Votre prénom"
                    description={prenom || undefined}
                />
                <EditableRow
                    label="Nom"
                    value={nom}
                    onSave={saveNom}
                    icon={User}
                    placeholder="Votre nom de famille"
                    description={nom || undefined}
                />
                <EditableRow
                    label="Date de naissance"
                    value={dateNaissance}
                    displayValue={fmtDate(dateNaissance)}
                    onSave={saveDateNaissance}
                    type="date"
                    icon={Calendar}
                    placeholder="JJ/MM/AAAA"
                    description={dateNaissance ? fmtDate(dateNaissance) : undefined}
                />
            </Section>

            {/* ── Contact ───────────────────────────────────────────── */}
            <Section title="Contact" subtitle="Vos coordonnées de contact.">
                <EditableRow
                    label="Adresse email"
                    value={profile.email}
                    onSave={saveEmail}
                    type="email"
                    icon={Mail}
                    placeholder="votre@email.com"
                    description={profile.email || undefined}
                />
                <InfoRow
                    label="Numéro de téléphone"
                    value={profile.telephone}
                    icon={Phone}
                    badge={phoneBadge}
                    action={
                        <div className="flex items-center gap-1.5">
                            {!profile.phoneVerified && (
                                <button
                                    type="button"
                                    onClick={() => setPhoneEditOpen(true)}
                                    className="flex items-center gap-1 text-[12px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1.5 rounded-lg transition-colors"
                                >
                                    Vérifier
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setPhoneEditOpen(true)}
                                className="flex items-center gap-1.5 text-[12px] font-bold text-black/40 hover:text-black bg-black/[0.04] hover:bg-black/[0.08] px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                                <Pencil className="w-3 h-3" strokeWidth={2.5} />
                                <span className="hidden sm:inline">Modifier</span>
                            </button>
                        </div>
                    }
                />
            </Section>

            {/* ── Identité & Sécurité ───────────────────────────────── */}
            <Section title="Identité & Sécurité">
                {profile.statutKyc === 'VERIFIE' ? (
                    <InfoRow
                        label="Vérification d'identité"
                        value="Identité confirmée — compte certifié"
                        icon={BadgeCheck}
                        badge={kycBadge}
                    />
                ) : (
                    <CtaRow
                        icon={profile.statutKyc === 'EN_ATTENTE' ? ShieldAlert : AlertTriangle}
                        title="Vérification d'identité"
                        subtitle={
                            profile.statutKyc === 'EN_ATTENTE'
                                ? 'Votre dossier est en cours d\'examen.'
                                : 'Vérifiez votre identité pour débloquer toutes les fonctionnalités.'
                        }
                        href="/dashboard/owner/kyc"
                        buttonLabel={profile.statutKyc === 'EN_ATTENTE' ? 'Voir le statut' : 'Commencer'}
                        buttonVariant={profile.statutKyc === 'EN_ATTENTE' ? 'warning' : 'emerald'}
                    />
                )}
                <InfoRow
                    label="Mot de passe"
                    value="Géré via votre fournisseur de connexion"
                    icon={Lock}
                    badge={
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/[0.04] text-black/30">
                            <Sparkles className="w-2.5 h-2.5" /> SSO
                        </span>
                    }
                />
            </Section>

            {/* ── Notifications ────────────────────────────────────────── */}
            <Section title="Préférences" subtitle="Configurez vos moyens de communication.">
                <NotificationRow />
            </Section>

            {/* ── Compte ────────────────────────────────────────────── */}
            <Section title="Compte">
                <InfoRow
                    label="Rôle"
                    value={roleLabel[profile.role] ?? profile.role}
                    icon={BadgeCheck}
                    action={
                        profile.role === 'PROPRIETAIRE' ? (
                            <button
                                type="button"
                                onClick={switchToLocataire}
                                disabled={switching}
                                className="flex items-center gap-1.5 text-[12px] font-bold text-black/40 bg-black/[0.04] hover:bg-black/[0.08] px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {switchingToTenant
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : <UserRound className="w-3 h-3" strokeWidth={2.5} />
                                }
                                <span className="hidden sm:inline">Mode locataire</span>
                            </button>
                        ) : profile.role === 'LOCATAIRE' ? (
                            <button
                                type="button"
                                onClick={switchToProprietaire}
                                disabled={switching}
                                className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {switchingToOwner
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : <RefreshCw className="w-3 h-3" strokeWidth={2.5} />
                                }
                                <span className="hidden sm:inline">Espace propriétaire</span>
                            </button>
                        ) : undefined
                    }
                />
                <InfoRow
                    label="Membre depuis"
                    value={memberSince}
                    icon={Calendar}
                />
            </Section>

            {/* ── Zone Dangereuse ──────────────────────────────────────── */}
            <Section
                title="Zone Dangereuse"
                subtitle="Actions irréversibles sur votre compte."
            >
                <div className="rounded-2xl border-2 border-red-100 bg-red-50/50 p-4">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[14px] font-bold text-red-900 mb-1">
                                Supprimer définitivement mon compte
                            </h4>
                            <p className="text-[12px] text-red-700 leading-relaxed">
                                Cette action supprimera toutes vos données : profil, véhicules, réservations, avis et documents KYC.
                                Cette action est <span className="font-bold">irréversible</span>.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={async () => {
                            const confirmed = confirm(
                                '⚠️ ATTENTION ⚠️\n\n' +
                                'Êtes-vous absolument certain de vouloir supprimer votre compte ?\n\n' +
                                'Cette action va :\n' +
                                '• Supprimer votre profil et toutes vos informations personnelles\n' +
                                '• Supprimer tous vos véhicules et annonces\n' +
                                '• Supprimer toutes vos réservations\n' +
                                '• Supprimer tous vos avis et commentaires\n' +
                                '• Supprimer vos documents KYC\n\n' +
                                'Cette action est IRRÉVERSIBLE et vous serez déconnecté immédiatement.\n\n' +
                                'Tapez OK pour confirmer la suppression.'
                            );

                            if (!confirmed) return;

                            // Double confirmation
                            const doubleConfirm = confirm(
                                'Dernière confirmation :\n\n' +
                                'Voulez-vous vraiment supprimer définitivement votre compte ?\n\n' +
                                'Cette action ne peut pas être annulée.'
                            );

                            if (!doubleConfirm) return;

                            setGlobalError('');
                            try {
                                await deleteAccount();

                                // Clear auth cookies and redirect to homepage
                                document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                                document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                                window.location.href = '/';
                            } catch (err: any) {
                                setGlobalError(err?.message || 'Erreur lors de la suppression du compte');
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[13px] py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-red-600/20"
                    >
                        <Trash2 className="w-4 h-4" />
                        Supprimer définitivement mon compte
                    </button>
                </div>
            </Section>

            {/* Global error - moved to bottom */}
            {globalError && (
                <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-[13px] text-red-700 font-medium">{globalError}</p>
                </div>
            )}

            {/* KYC Reset Alert */}
            <Dialog open={showKycAlert} onOpenChange={setShowKycAlert}>
                <DialogContent
                    className="p-0 overflow-hidden bg-slate-950 border border-white/8 max-w-sm w-full rounded-3xl shadow-2xl shadow-black/80"
                >
                    <button
                        type="button"
                        onClick={() => setShowKycAlert(false)}
                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4 text-white/50" />
                    </button>

                    <div className="relative pt-10 pb-8 px-7">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                            <ShieldAlert className="w-6 h-6 text-amber-500" />
                        </div>

                        <h3 className="text-[18px] font-black leading-tight text-white mb-2 tracking-tight">
                            Vérification requise
                        </h3>
                        <p className="text-[13px] font-medium text-white/60 leading-relaxed mb-6">
                            Pour des raisons de sécurité, suite à la modification de votre identité, vous devez soumettre à nouveau vos documents pour confirmer ces changements.
                        </p>

                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/owner/kyc')}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[13px] py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                <BadgeCheck className="w-4 h-4" />
                                Mettre à jour mon KYC
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowKycAlert(false)}
                                className="w-full bg-transparent hover:bg-white/5 text-white/40 hover:text-white font-semibold text-[13px] py-3 rounded-2xl transition-all"
                            >
                                Plus tard
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Modal modification / vérification du téléphone ── */}
            {phoneEditOpen && (
                <PhoneEditModal
                    currentPhone={profile.telephone ?? ''}
                    onClose={() => setPhoneEditOpen(false)}
                    onSuccess={() => { setPhoneEditOpen(false); router.refresh(); }}
                />
            )}

            {/* ── Modal upload photo de profil ── */}
            <AvatarUploadModal
                isOpen={avatarModalOpen}
                onClose={() => setAvatarModalOpen(false)}
                currentAvatarUrl={avatarUrl}
                onUpload={handleAvatarUpload}
                uploading={uploadingAvatar}
            />

        </div>
    );
}
