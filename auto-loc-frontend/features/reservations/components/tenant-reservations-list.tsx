'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    CalendarDays, MapPin, Clock, Car,
    ChevronRight, Search, Zap, CheckCircle2,
    Timer, Archive, AlertTriangle, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reservation } from '@/lib/nestjs/reservations';
import { useCurrency } from '@/providers/currency-provider';
import { PhoneDisplay } from './phone-display';

interface Props {
    initialReservations: Reservation[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    PAYEE: { label: 'En attente validation', color: 'text-black', bg: 'bg-white border-black', dot: 'bg-amber-500' },
    CONFIRMEE: { label: 'Confirmée', color: 'text-emerald-500', bg: 'bg-white border-emerald-500', dot: 'bg-emerald-500' },
    EN_COURS: { label: 'En cours', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-500', dot: 'bg-emerald-500' },
    TERMINEE: { label: 'Terminée', color: 'text-black/40', bg: 'bg-white border-black/10', dot: 'bg-black/20' },
    ANNULEE: { label: 'Annulée', color: 'text-red-600', bg: 'bg-white border-red-200', dot: 'bg-red-500' },
    LITIGE: { label: 'Litige', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
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

// ── Reservation Card (Premium Style) ──────────────────────────────────────────

function TenantReservationCard({ reservation }: { reservation: Reservation }) {
    const { formatPrice } = useCurrency();
    const { vehicule } = reservation;
    const mainPhoto = vehicule?.photos?.[0]?.url ?? null;
    const statusCfg = STATUS_CONFIG[reservation.statut] || {
        label: reservation.statut,
        color: 'text-black',
        bg: 'bg-white border-black/10',
        dot: 'bg-black/20',
    };

    const dateDebut = new Date(reservation.dateDebut).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const dateFin = new Date(reservation.dateFin).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return (
        <Link href={`/dashboard/reservations/${reservation.id}`} className="block group">
            <div className="flex flex-col lg:flex-row gap-6 p-5 rounded-[2rem] border-2 border-black/5 bg-white transition-all duration-300 hover:border-black hover:shadow-2xl hover:shadow-black/5 relative overflow-hidden">
                
                {/* Image Section */}
                <div className="relative w-full lg:w-48 h-40 rounded-2xl overflow-hidden flex-shrink-0 bg-black/5">
                    {mainPhoto ? (
                        <Image 
                            src={mainPhoto} 
                            alt="" 
                            fill 
                            sizes="(max-width: 1024px) 100vw, 192px" 
                            className="object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <Car className="w-10 h-10 text-black/10" strokeWidth={1} />
                        </div>
                    )}
                    {/* Floating status on mobile image */}
                    <div className="absolute top-3 right-3 lg:hidden">
                        <span className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md",
                            statusCfg.bg,
                            statusCfg.color
                        )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusCfg.dot)} />
                            {statusCfg.label}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h3 className="text-xl font-black text-black truncate uppercase tracking-tighter italic">
                                    {vehicule?.marque ?? '—'} {vehicule?.modele ?? ''}
                                </h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-black/60">
                                        <MapPin className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                                        {vehicule?.ville ?? '—'}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-black/60">
                                        <CalendarDays className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                                        {dateDebut} — {dateFin}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Status badge - Desktop only */}
                            <div className="hidden lg:block">
                                <span className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border",
                                    statusCfg.bg,
                                    statusCfg.color
                                )}>
                                    <span className={cn("w-2 h-2 rounded-full", statusCfg.dot)} />
                                    {statusCfg.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-5 border-t border-black/5">
                        <div className="flex items-baseline gap-2">
                            <span className="text-[11px] font-black text-black/20 uppercase tracking-widest">Total</span>
                            <p className="text-2xl font-black text-black tracking-tighter">
                                {Number.isFinite(Number(reservation.prixTotal))
                                    ? formatPrice(Number(reservation.prixTotal))
                                    : '—'}
                            </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6">
                            <PhoneDisplay 
                                telephone={reservation.proprietaire?.telephone} 
                                dateDebut={reservation.dateDebut}
                                statut={reservation.statut}
                                className="text-[12px] font-black"
                                showLabel={true}
                            />
                            <div className="flex items-center gap-2 text-[11px] font-black text-black/20 uppercase">
                                <Clock className="w-3.5 h-3.5" />
                                REF: {reservation.id.slice(0, 8)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
