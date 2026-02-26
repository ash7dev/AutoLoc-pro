'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    CalendarDays, MapPin, Clock, Car,
    ChevronRight, Search, Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reservation } from '@/lib/nestjs/reservations';
import { formatPrice } from '@/features/vehicles/owner/vehicle-helpers';

interface Props {
    initialReservations: Reservation[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    EN_ATTENTE_PAIEMENT: { label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
    PAYEE: { label: 'Payée', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100' },
    CONFIRMEE: { label: 'Confirmée', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
    EN_COURS: { label: 'En cours', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-100' },
    TERMINEE: { label: 'Terminée', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
    ANNULEE: { label: 'Annulée', color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
};

const TABS = [
    { key: 'all', label: 'Tout' },
    { key: 'active', label: 'Actives' },
    { key: 'completed', label: 'Terminées' },
    { key: 'cancelled', label: 'Annulées' },
];

const ACTIVE_STATUSES = new Set(['EN_ATTENTE_PAIEMENT', 'PAYEE', 'CONFIRMEE', 'EN_COURS']);

export function TenantReservationsList({ initialReservations }: Props): React.ReactElement {
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        let result = initialReservations;
        if (tab === 'active') result = result.filter((r) => ACTIVE_STATUSES.has(r.statut));
        else if (tab === 'completed') result = result.filter((r) => r.statut === 'TERMINEE');
        else if (tab === 'cancelled') result = result.filter((r) => r.statut === 'ANNULEE');

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (r) =>
                    r.vehicule?.marque?.toLowerCase().includes(q) ||
                    r.vehicule?.modele?.toLowerCase().includes(q) ||
                    r.vehicule?.ville?.toLowerCase().includes(q),
            );
        }
        return result;
    }, [initialReservations, tab, search]);

    return (
        <div className="space-y-6">
            {/* Tabs + search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl p-1">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={cn(
                                'px-4 py-2 text-[12px] font-semibold rounded-lg transition-all duration-200',
                                tab === t.key
                                    ? 'bg-black text-emerald-400 shadow-sm'
                                    : 'text-black/50 hover:text-black',
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" strokeWidth={2} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                    />
                </div>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Car className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <p className="text-[14px] font-bold text-black/40">
                        Aucune réservation
                    </p>
                    <Link
                        href="/explorer"
                        className="inline-flex items-center gap-2 rounded-xl bg-black text-emerald-400 px-5 py-2.5 text-[13px] font-semibold hover:bg-emerald-400 hover:text-black transition-all"
                    >
                        Explorer les véhicules
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map((reservation) => (
                        <TenantReservationCard
                            key={reservation.id}
                            reservation={reservation}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Reservation Card ──────────────────────────────────────────────────────────

function TenantReservationCard({ reservation }: { reservation: Reservation }) {
    const { vehicule } = reservation;
    const mainPhoto = vehicule?.photos?.[0]?.url ?? null;
    const statusCfg = STATUS_CONFIG[reservation.statut] ?? {
        label: reservation.statut,
        color: 'text-slate-600',
        bg: 'bg-slate-50 border-slate-200',
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
        <div className="group flex flex-col sm:flex-row gap-4 rounded-2xl border border-slate-100 bg-white p-4 hover:border-slate-200 hover:shadow-md transition-all duration-200">
            {/* Photo */}
            <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                {mainPhoto ? (
                    <Image src={mainPhoto} alt="" fill sizes="144px" className="object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Car className="w-8 h-8 text-slate-300" strokeWidth={1.2} />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[15px] font-bold text-black truncate">
                            {vehicule?.marque ?? '—'} {vehicule?.modele ?? ''}
                        </p>
                        <span
                            className={cn(
                                'inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border flex-shrink-0',
                                statusCfg.bg,
                                statusCfg.color,
                            )}
                        >
                            {statusCfg.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[12px] text-black/40">
                            <MapPin className="w-3 h-3" strokeWidth={2} />
                            {vehicule?.ville ?? '—'}
                        </span>
                        <span className="flex items-center gap-1 text-[12px] text-black/40">
                            <CalendarDays className="w-3 h-3" strokeWidth={2} />
                            {dateDebut} → {dateFin}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <p className="text-[15px] font-black text-emerald-600 tabular-nums">
                        {formatPrice(Number(reservation.prixTotal))} FCFA
                    </p>
                    <span className="flex items-center gap-1 text-[12px] font-medium text-black/30">
                        <Clock className="w-3 h-3" />
                        Réf: {reservation.id.slice(0, 8).toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
}
