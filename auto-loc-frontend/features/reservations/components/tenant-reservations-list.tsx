'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    CalendarDays, MapPin, Clock, Car,
    ChevronRight, Search, Zap, CheckCircle2,
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
        id: 'upcoming',
        title: 'Prochaines étapes',
        subtitle: 'Vos locations en cours ou à venir',
        icon: Zap,
        statuses: ['PAYEE', 'CONFIRMEE', 'EN_COURS'],
    },
    {
        id: 'history',
        title: 'Historique & Suivi',
        subtitle: 'Réservations terminées, annulées ou en litige',
        icon: Archive,
        statuses: ['TERMINEE', 'ANNULEE', 'LITIGE'],
    },
];

export function TenantReservationsList({ initialReservations }: Props): React.ReactElement {
    const [search, setSearch] = useState('');

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

    return (
        <div className="space-y-8 font-inter">
            {/* Search bar - Premium Style */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" strokeWidth={2.5} />
                <input
                    type="text"
                    placeholder="Chercher une marque, un modèle, une ville..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border-2 border-black/5 bg-white pl-12 pr-4 py-3 text-[14px] font-medium focus:outline-none focus:border-black transition-all placeholder:text-black/20 text-black"
                />
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-6 py-24 rounded-[2.5rem] border-2 border-dashed border-black/5 bg-white">
                    <div className="w-20 h-20 rounded-3xl bg-black/5 flex items-center justify-center">
                        <Car className="w-10 h-10 text-black/10" strokeWidth={1} />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-xl font-bold text-black">Aucune réservation trouvée</p>
                        <p className="text-black/40 text-sm max-w-xs mx-auto">
                            Commencez par explorer nos véhicules disponibles pour votre prochain trajet.
                        </p>
                    </div>
                    <Link
                        href="/explorer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-black text-emerald-400 px-8 py-4 text-[14px] font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                    >
                        Explorer les véhicules
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-12">
                    {grouped.map((group) => (
                        <section key={group.id} className="space-y-6">
                            <div className="flex items-center gap-4 border-b border-black/5 pb-4">
                                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center flex-shrink-0">
                                    <group.icon className="w-6 h-6 text-emerald-400" strokeWidth={2} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-black tracking-tight leading-none">
                                        {group.title}
                                    </h2>
                                    <p className="text-[13px] text-black/40 mt-1 font-medium">
                                        {group.subtitle} • {group.reservations.length}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                                {group.reservations.map((reservation) => (
                                    <TenantReservationCard
                                        key={reservation.id}
                                        reservation={reservation}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
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
