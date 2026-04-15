'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    CalendarDays, MapPin, Clock, Car,
    ChevronRight, ChevronDown, Search, Zap, CheckCircle2,
    Timer, Archive, AlertTriangle, XCircle, Banknote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reservation } from '@/lib/nestjs/reservations';
import { useCurrency } from '@/providers/currency-provider';
import { PhoneDisplay } from './phone-display';

interface Props {
    initialReservations: Reservation[];
}

const STATUS_CONFIG: Record<string, {
    label: string;
    icon: React.ElementType;
    accent: string;
    accentBorder: string;
    badgeBg: string;
    badgeText: string;
    badgeDot: string;
    pulse?: boolean;
    glow?: string;
}> = {
    PAYEE: {
        label: 'À valider',
        icon: Zap,
        accent: 'from-amber-500 to-orange-500',
        accentBorder: 'border-l-amber-500',
        badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
        badgeText: 'text-white',
        badgeDot: 'bg-white',
        pulse: true,
        glow: 'shadow-amber-500/10',
    },
    CONFIRMEE: {
        label: 'Confirmée',
        icon: CheckCircle2,
        accent: 'from-emerald-500 to-teal-500',
        accentBorder: 'border-l-emerald-500',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-700',
        badgeDot: 'bg-emerald-500',
        glow: 'shadow-emerald-500/5',
    },
    EN_COURS: {
        label: 'En cours',
        icon: Timer,
        accent: 'from-blue-500 to-indigo-500',
        accentBorder: 'border-l-blue-500',
        badgeBg: 'bg-blue-50',
        badgeText: 'text-blue-700',
        badgeDot: 'bg-blue-500',
        pulse: true,
        glow: 'shadow-blue-500/5',
    },
    TERMINEE: {
        label: 'Terminée',
        icon: CheckCircle2,
        accent: 'from-slate-300 to-slate-400',
        accentBorder: 'border-l-slate-300',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-500',
        badgeDot: 'bg-slate-400',
    },
    ANNULEE: {
        label: 'Annulée',
        icon: XCircle,
        accent: 'from-red-400 to-rose-500',
        accentBorder: 'border-l-red-400',
        badgeBg: 'bg-red-50',
        badgeText: 'text-red-600',
        badgeDot: 'bg-red-400',
    },
    LITIGE: {
        label: 'Litige',
        icon: AlertTriangle,
        accent: 'from-orange-400 to-amber-500',
        accentBorder: 'border-l-orange-400',
        badgeBg: 'bg-orange-50',
        badgeText: 'text-orange-700',
        badgeDot: 'bg-orange-400',
        pulse: true,
        glow: 'shadow-orange-500/5',
    },
};

const DEFAULT_STATUS = {
    label: '—',
    icon: Clock,
    accent: 'from-slate-300 to-slate-400',
    accentBorder: 'border-l-slate-300',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-500',
    badgeDot: 'bg-slate-400',
};

const SECTIONS = [
    {
        id: 'urgent',
        title: 'Action requise',
        subtitle: 'Ces réservations nécessitent votre validation',
        icon: Zap,
        statuses: ['PAYEE'],
    },
    {
        id: 'active',
        title: 'Réservations actives',
        subtitle: 'Confirmées et en cours de location',
        icon: Timer,
        statuses: ['CONFIRMEE', 'EN_COURS'],
    },
    {
        id: 'disputes',
        title: 'Litiges',
        subtitle: 'Réservations nécessitant un suivi',
        icon: AlertTriangle,
        statuses: ['LITIGE'],
    },
    {
        id: 'history',
        title: 'Historique',
        subtitle: 'Réservations terminées et annulées',
        icon: Archive,
        statuses: ['TERMINEE', 'ANNULEE'],
    },
];

export function TenantReservationsList({ initialReservations }: Props): React.ReactElement {
    const [search, setSearch] = useState('');
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(SECTIONS.map(s => [s.id, s.id === 'urgent' || s.id === 'active' || s.id === 'disputes'])),
    );

    const toggleSection = (id: string) =>
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

    const filtered = useMemo(() => {
        if (!search.trim()) return initialReservations;
        const q = search.toLowerCase();
        return initialReservations.filter(
            (r) =>
                r.vehicule?.marque?.toLowerCase().includes(q) ||
                r.vehicule?.modele?.toLowerCase().includes(q) ||
                r.vehicule?.ville?.toLowerCase().includes(q),
        );
    }, [initialReservations, search]);

    const grouped = useMemo(() => {
        return SECTIONS.map(section => ({
            ...section,
            reservations: filtered.filter(r => section.statuses.includes(r.statut)),
        })).filter(g => g.reservations.length > 0);
    }, [filtered]);

    const urgent = filtered.filter(r => r.statut === 'PAYEE').length;
    const active = filtered.filter(r => ['CONFIRMEE', 'EN_COURS'].includes(r.statut)).length;
    const litiges = filtered.filter(r => r.statut === 'LITIGE').length;

    return (
        <div className="space-y-5">
            {/* Stats strip */}
            {filtered.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {urgent > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-[11.5px] font-bold text-white shadow-md shadow-amber-500/20">
                            <Zap className="w-3 h-3" strokeWidth={2.5} />
                            {urgent} à valider
                        </span>
                    )}
                    {active > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11.5px] font-bold text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {active} active{active > 1 ? "s" : ""}
                        </span>
                    )}
                    {litiges > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-[11.5px] font-bold text-orange-700">
                            <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />
                            {litiges} litige{litiges > 1 ? "s" : ""}
                        </span>
                    )}
                    <span className="ml-auto text-[12px] font-medium text-slate-400 tabular-nums">
                        {filtered.length} réservation{filtered.length > 1 ? "s" : ""}
                    </span>
                </div>
            )}

            {/* Search bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2.5} />
                <input
                    type="text"
                    placeholder="Chercher une marque, un modèle, une ville..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-sm pl-12 pr-4 py-3 text-[14px] font-medium focus:outline-none focus:border-slate-300 transition-all placeholder:text-slate-400 text-slate-900"
                />
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-6 py-24 rounded-2xl border border-dashed border-slate-200 bg-white/60 backdrop-blur-sm">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                        <Archive className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                        <p className="text-[13.5px] font-bold text-slate-500">Aucune réservation trouvée</p>
                        <p className="text-[12px] text-slate-400 mt-1 max-w-xs mx-auto">
                            Essayez de chercher avec d'autres critères.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map((group) => {
                        const isOpen = openSections[group.id] ?? true;
                        const Icon = group.icon;

                        return (
                            <section key={group.id}>
                                {/* Section header */}
                                <button
                                    type="button"
                                    onClick={() => toggleSection(group.id)}
                                    className="flex items-center gap-3 w-full py-3 group cursor-pointer"
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0",
                                        group.id === 'urgent' ? "bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200" :
                                        group.id === 'active' ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200" :
                                        group.id === 'disputes' ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200" :
                                        "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200",
                                    group.id === 'urgent' ? "text-amber-600" :
                                        group.id === 'active' ? "text-emerald-600" :
                                        group.id === 'disputes' ? "text-orange-600" :
                                        "text-slate-500",
                                    )}>
                                        <Icon className="w-4 h-4" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[13px] font-black text-slate-800 tracking-tight">
                                                {group.title}
                                            </h3>
                                            <span className="text-[10px] font-bold tabular-nums text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                {group.reservations.length}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 hidden sm:block">
                                            {group.subtitle}
                                        </p>
                                    </div>
                                    <ChevronDown className={cn(
                                        "w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0",
                                        isOpen && "rotate-180",
                                    )} strokeWidth={2} />
                                </button>

                                {/* Animated content area */}
                                <div className={cn(
                                    "transition-all duration-300 ease-out overflow-hidden",
                                    isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0",
                                )}>
                                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 pt-1">
                                        {group.reservations.map((reservation) => (
                                            <TenantReservationCard
                                                key={reservation.id}
                                                reservation={reservation}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Section divider */}
                                <div className="mt-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Reservation Card (Glassmorphism Style - Match Owner) ──────────────────────────────────────────

function TenantReservationCard({ reservation }: { reservation: Reservation }) {
    const { formatPrice } = useCurrency();
    const { vehicule } = reservation;
    const mainPhoto = vehicule?.photos?.[0]?.url ?? null;
    const st = STATUS_CONFIG[reservation.statut] || DEFAULT_STATUS;
    const StatusIcon = st.icon;
    const isUrgent = reservation.statut === 'PAYEE';
    const isDimmed = reservation.statut === 'ANNULEE' || reservation.statut === 'TERMINEE';

    const dateDebut = new Date(reservation.dateDebut).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
    });
    const dateFin = new Date(reservation.dateFin).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
    });
    const initials = `${reservation.proprietaire?.prenom?.[0] || ''}${reservation.proprietaire?.nom?.[0] || ''}`.toUpperCase();

    return (
        <Link href={`/dashboard/reservations/${reservation.id}`} className="block group">
            <div className={cn(
                'group relative flex flex-col rounded-2xl overflow-hidden',
                'border border-white/60 border-l-[3px]',
                st.accentBorder,
                /* Glass */
                'bg-white/70 backdrop-blur-xl',
                'shadow-sm',
                st.glow,
                /* Hover */
                'hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-[3px] hover:border-white/80',
                'transition-all duration-300 ease-out',
                isDimmed && 'opacity-70 hover:opacity-100',
            )}>
                {/* ── Urgent ribbon ─────────────────────────── */}
                {isUrgent && (
                    <div className="absolute top-0 right-0 z-10">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-[0.12em] px-3 py-1 rounded-bl-xl shadow-lg shadow-amber-500/20">
                            Action requise
                        </div>
                    </div>
                )}

                {/* ── Vehicle photo strip (top) ────────────── */}
                {mainPhoto && (
                    <div className="relative w-full h-28 overflow-hidden bg-slate-100">
                        <Image
                            src={mainPhoto}
                            alt={`${vehicule?.marque} ${vehicule?.modele}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className={cn(
                                'object-cover transition-transform duration-500 group-hover:scale-105',
                                isDimmed && 'grayscale-[40%]',
                            )}
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        {/* Vehicle name on photo */}
                        <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between gap-2">
                            <div>
                                <p className="text-[15px] font-black text-white leading-tight drop-shadow-md">
                                    {vehicule?.marque}{' '}
                                    <span className="text-emerald-300">{vehicule?.modele}</span>
                                </p>
                            </div>
                            {/* Duration pill on photo */}
                            <span className="flex-shrink-0 text-[10px] font-black text-white/90 tabular-nums bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                {reservation.nbJours}j
                            </span>
                        </div>
                    </div>
                )}

                {/* ── No photo fallback header ──────────────── */}
                {!mainPhoto && (
                    <div className="px-4 pt-4 pb-2">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-[14.5px] font-black text-slate-900 truncate leading-tight tracking-[-0.01em]">
                                    {vehicule?.marque}{' '}
                                    <span className="text-emerald-500">{vehicule?.modele}</span>
                                </p>
                            </div>
                            <span className="flex-shrink-0 text-[10px] font-black text-slate-500 tabular-nums bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                                {reservation.nbJours}j
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Body ──────────────────────────────────── */}
                <div className="px-4 py-3 flex-1 space-y-2.5">
                    {/* Status badge */}
                    <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold border border-transparent',
                            st.badgeBg, st.badgeText,
                        )}>
                            <span className={cn(
                                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                                st.badgeDot,
                                st.pulse && 'animate-pulse',
                            )} />
                            {st.label}
                        </span>

                        {/* Dates */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                            <CalendarDays className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
                            {dateDebut}
                            <span className="text-slate-300">→</span>
                            {dateFin}
                        </span>
                    </div>

                    {/* Owner row */}
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-50/80 border border-slate-100/80">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-200/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-[9px] font-black text-emerald-700 leading-none">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-slate-700 truncate leading-tight">
                                {reservation.proprietaire?.prenom} {reservation.proprietaire?.nom}
                            </p>
                        </div>
                        <PhoneDisplay
                            telephone={reservation.proprietaire?.telephone}
                            dateDebut={reservation.dateDebut}
                            statut={reservation.statut}
                            className="text-[11px]"
                            showLabel={false}
                        />
                    </div>
                </div>

                {/* ── Footer — Price ──────────────────────── */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100/80 bg-gradient-to-r from-slate-50/50 to-transparent mt-auto">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Banknote className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
                        </div>
                        <div>
                            <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Total
                            </p>
                            <p className={cn(
                                'text-[17px] font-black tabular-nums leading-none mt-0.5',
                                isDimmed ? 'text-slate-400' : 'text-emerald-600',
                            )}>
                                {Number.isFinite(Number(reservation.prixTotal))
                                    ? formatPrice(Number(reservation.prixTotal))
                                    : '—'}
                            </p>
                        </div>
                    </div>

                    <div className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
                        'bg-white border border-slate-200',
                        'group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:border-emerald-500 group-hover:shadow-lg group-hover:shadow-emerald-500/20',
                    )}>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
