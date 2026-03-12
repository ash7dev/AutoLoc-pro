'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/nestjs/auth';
import { updateUserProfile } from '@/lib/nestjs/auth';

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
        { done: p.statutKyc === 'APPROUVE', label: 'Identité vérifiée' },
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
            <div className="mb-3 px-0.5">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{title}</h3>
                {subtitle && <p className="text-[12px] text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
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
                <span className={cn(
                    'mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200',
                    editing ? 'bg-emerald-50' : 'bg-slate-50',
                )}>
                    <Icon className={cn('w-3.5 h-3.5', editing ? 'text-emerald-500' : 'text-slate-400')} strokeWidth={2} />
                </span>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[13.5px] font-semibold text-slate-800 leading-tight">{label}</p>
                            {description && !editing && (
                                <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>
                            )}
                        </div>
                        {!editing && (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="flex-shrink-0 flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 group"
                            >
                                <Pencil className="w-3 h-3 transition-transform group-hover:scale-110" strokeWidth={2} />
                                <span className="hidden sm:inline">Modifier</span>
                            </button>
                        )}
                    </div>

                    {/* Current value */}
                    {!editing && (
                        <p className={cn(
                            'text-[13px] font-medium mt-1.5',
                            value ? 'text-slate-600' : 'text-slate-300 italic',
                        )}>
                            {flash
                                ? <span className="flex items-center gap-1.5 text-emerald-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" />Enregistré</span>
                                : (displayValue ?? value || 'Non renseigné')}
                        </p>
                    )}

                    {/* Inline edit form */}
                    {editing && (
                        <div className="mt-2 flex items-center gap-2">
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
                                className="flex-1 min-w-0 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-[13.5px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                            />
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
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
                <span className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[13.5px] font-semibold text-slate-800 leading-tight">{label}</p>
                        {badge}
                    </div>
                    <p className="text-[13px] font-medium text-slate-500 mt-1 truncate">{value || '—'}</p>
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
                {!action && <Lock className="w-3 h-3 text-slate-200 flex-shrink-0" />}
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
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    href: string;
    buttonLabel: string;
    buttonVariant?: 'default' | 'warning' | 'emerald';
}) {
    return (
        <div className="px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
                <span className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
                    <Icon className={cn('w-3.5 h-3.5', iconColor)} strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-slate-800">{title}</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">{subtitle}</p>
                </div>
                <Link
                    href={href}
                    className={cn(
                        'flex-shrink-0 flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-xl transition-all duration-150',
                        buttonVariant === 'warning' && 'bg-amber-100 text-amber-700 hover:bg-amber-200',
                        buttonVariant === 'emerald' && 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600',
                        buttonVariant === 'default' && 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                    )}
                >
                    {buttonLabel}
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
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
    const [globalError, setGlobalError] = useState('');

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
            await updateUserProfile({ prenom: v, nom, dateNaissance: dateNaissance || undefined });
            setPrenom(v);
        } catch { setGlobalError('Erreur lors de la mise à jour du prénom'); }
    }

    async function saveNom(v: string) {
        setGlobalError('');
        try {
            await updateUserProfile({ prenom, nom: v, dateNaissance: dateNaissance || undefined });
            setNom(v);
        } catch { setGlobalError('Erreur lors de la mise à jour du nom'); }
    }

    async function saveDateNaissance(v: string) {
        setGlobalError('');
        try {
            await updateUserProfile({ prenom, nom, dateNaissance: v || undefined });
            setDateNaissance(v);
        } catch { setGlobalError('Erreur lors de la mise à jour de la date'); }
    }

    const kycBadge = profile.statutKyc === 'APPROUVE' ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
            <BadgeCheck className="w-2.5 h-2.5" /> Vérifié
        </span>
    ) : profile.statutKyc === 'EN_ATTENTE' ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
            <ShieldAlert className="w-2.5 h-2.5" /> En attente
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
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
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-4 sm:gap-5">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 select-none">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                            ) : (
                                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    {getInitials(prenom, nom)}
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            title="Changer la photo"
                            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
                        >
                            <Camera className="w-3 h-3 text-slate-500" strokeWidth={2} />
                        </button>
                    </div>

                    {/* Name + completion */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[16px] sm:text-[18px] font-black text-slate-900 truncate leading-tight">
                            {prenom || nom ? `${prenom} ${nom}`.trim() : 'Votre profil'}
                        </p>
                        <p className="text-[12px] text-slate-400 mt-0.5 truncate">{profile.email}</p>

                        {/* Completion */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400">
                                    Profil complété
                                </span>
                                <span className={cn(
                                    'text-[11px] font-black',
                                    percent === 100 ? 'text-emerald-600' : percent >= 70 ? 'text-amber-500' : 'text-slate-400',
                                )}>
                                    {percent}%
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all duration-700',
                                        percent === 100 ? 'bg-emerald-500' : percent >= 70 ? 'bg-amber-400' : 'bg-slate-300',
                                    )}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            {missing.length > 0 && (
                                <p className="text-[11px] text-slate-400 mt-1.5">
                                    Manquant : {missing.slice(0, 2).join(', ')}{missing.length > 2 ? ` +${missing.length - 2}` : ''}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Note / rating */}
                {(profile.noteProprietaire > 0 || profile.totalAvis > 0) && (
                    <div className="mt-5 pt-5 border-t border-slate-50 flex items-center gap-5">
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-[14px] font-black text-slate-800">
                                {profile.noteProprietaire.toFixed(1)}
                            </span>
                            <span className="text-[12px] text-slate-400">/ 5</span>
                        </div>
                        <div className="w-px h-4 bg-slate-100" />
                        <span className="text-[13px] text-slate-500 font-medium">
                            {profile.totalAvis} avis reçu{profile.totalAvis > 1 ? 's' : ''}
                        </span>
                        <div className="w-px h-4 bg-slate-100" />
                        <span className="text-[12px] font-semibold text-slate-500">
                            {roleLabel[profile.role] ?? profile.role}
                        </span>
                    </div>
                )}
            </div>

            {/* Global error */}
            {globalError && (
                <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-[13px] text-red-700 font-medium">{globalError}</p>
                </div>
            )}

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
                <InfoRow
                    label="Adresse email"
                    value={profile.email}
                    icon={Mail}
                    action={
                        <a
                            href="mailto:support@autoloc.sn?subject=Modification email"
                            className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                            <Mail className="w-3 h-3" />
                            <span className="hidden sm:inline">Support</span>
                        </a>
                    }
                />
                <InfoRow
                    label="Numéro de téléphone"
                    value={profile.telephone}
                    icon={Phone}
                    badge={phoneBadge}
                    action={
                        !profile.phoneVerified ? (
                            <Link
                                href="/dashboard/owner/kyc"
                                className="flex items-center gap-1 text-[12px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                                Vérifier
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                        ) : undefined
                    }
                />
            </Section>

            {/* ── Identité & Sécurité ───────────────────────────────── */}
            <Section title="Identité & Sécurité">
                {profile.statutKyc === 'APPROUVE' ? (
                    <InfoRow
                        label="Vérification d'identité"
                        value="Identité confirmée — compte certifié"
                        icon={BadgeCheck}
                        badge={kycBadge}
                    />
                ) : (
                    <CtaRow
                        icon={profile.statutKyc === 'EN_ATTENTE' ? ShieldAlert : AlertTriangle}
                        iconBg={profile.statutKyc === 'EN_ATTENTE' ? 'bg-amber-50' : 'bg-red-50'}
                        iconColor={profile.statutKyc === 'EN_ATTENTE' ? 'text-amber-500' : 'text-red-400'}
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
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            <Sparkles className="w-2.5 h-2.5" /> SSO
                        </span>
                    }
                />
            </Section>

            {/* ── Compte ────────────────────────────────────────────── */}
            <Section title="Compte">
                <InfoRow
                    label="Rôle"
                    value={roleLabel[profile.role] ?? profile.role}
                    icon={BadgeCheck}
                    action={
                        profile.role === 'PROPRIETAIRE' ? (
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                                <span className="hidden sm:inline">Mode locataire</span>
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                        ) : undefined
                    }
                />
                <InfoRow
                    label="Membre depuis"
                    value={memberSince}
                    icon={Calendar}
                />
            </Section>

        </div>
    );
}
