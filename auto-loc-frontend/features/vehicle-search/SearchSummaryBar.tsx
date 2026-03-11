'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Car, Tag, Calendar, X, Search, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/providers/currency-provider';

/* ─── Zone labels (matches BannerSection zones) ──────────────────────────── */
const ZONE_LABELS: Record<string, string> = {
    'almadies-ngor-mamelles': 'Almadies – Ngor – Mamelles',
    'ouakam-yoff': 'Ouakam – Yoff',
    'mermoz-sacrecoeur-ckg': 'Mermoz – Sacré-Cœur – CKG',
    'plateau-medina-gueuletapee': 'Plateau – Médina – Gueule Tapée',
    'liberte-sicap-granddakar': 'Liberté – Sicap – Grand Dakar',
    'parcelles-grandyoff': 'Parcelles Assainies – Grand Yoff',
    'pikine-guediawaye': 'Pikine – Guédiawaye',
    'keurmassar-rufisque': 'Keur Massar – Rufisque',
};

const TYPE_LABELS: Record<string, string> = {
    CITADINE: 'Citadine',
    BERLINE: 'Berline',
    SUV: 'SUV',
    PICKUP: 'Pick-up',
    MINIVAN: 'Minivan',
    MONOSPACE: 'Monospace',
    MINIBUS: 'Minibus',
    UTILITAIRE: 'Utilitaire',
    LUXE: 'Luxe',
    FOUR_X_FOUR: '4×4',
};

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface ActiveFilter {
    key: string;
    label: string;
    value: string;
    icon: React.ReactNode;
}

interface SearchSummaryBarProps {
    zone?: string;
    type?: string;
    prixMax?: string;
    debut?: string;
    fin?: string;
    q?: string;
    totalResults: number;
    loading: boolean;
    onRemoveFilter: (key: string) => void;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
        });
    } catch {
        return iso;
    }
}



/* ─── Component ──────────────────────────────────────────────────────────── */
export function SearchSummaryBar({
    zone,
    type,
    prixMax,
    debut,
    fin,
    q,
    totalResults,
    loading,
    onRemoveFilter,
}: SearchSummaryBarProps) {
    const { formatPrice: currFmt } = useCurrency();
    const pills: ActiveFilter[] = [];

    if (zone) {
        pills.push({
            key: 'zone',
            label: ZONE_LABELS[zone] ?? zone,
            value: zone,
            icon: <MapPin className="h-3 w-3" strokeWidth={2.5} />,
        });
    }
    if (type) {
        pills.push({
            key: 'type',
            label: TYPE_LABELS[type] ?? type,
            value: type,
            icon: <Car className="h-3 w-3" strokeWidth={2.5} />,
        });
    }
    if (prixMax) {
        pills.push({
            key: 'prixMax',
            label: `≤ ${currFmt(Number(prixMax))}`,
            value: prixMax,
            icon: <Tag className="h-3 w-3" strokeWidth={2.5} />,
        });
    }
    if (debut) {
        pills.push({
            key: 'debut',
            label: `Du ${formatDate(debut)}`,
            value: debut,
            icon: <Calendar className="h-3 w-3" strokeWidth={2.5} />,
        });
    }
    if (fin) {
        pills.push({
            key: 'fin',
            label: `Au ${formatDate(fin)}`,
            value: fin,
            icon: <Calendar className="h-3 w-3" strokeWidth={2.5} />,
        });
    }
    if (q) {
        pills.push({
            key: 'q',
            label: `« ${q} »`,
            value: q,
            icon: <Search className="h-3 w-3" strokeWidth={2.5} />,
        });
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-white/8">
            {/* Ambient glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)' }} />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full opacity-10 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)' }} />

            <div className="relative z-10 px-5 py-4 sm:px-6 sm:py-5">

                {/* Top row: back link + results count */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/40 hover:text-emerald-400 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Modifier la recherche
                    </Link>
                    <div className="text-right">
                        {loading ? (
                            <span className="inline-block h-5 w-28 rounded-lg bg-white/8 animate-pulse" />
                        ) : (
                            <span className="text-[13px] font-bold text-white/70">
                                <span className="text-emerald-400 text-[16px] font-black">{totalResults}</span>{' '}
                                véhicule{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>

                {/* Filter pills */}
                {pills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {pills.map((pill) => (
                            <span
                                key={pill.key}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
                                    'bg-white/8 backdrop-blur-sm border border-white/10',
                                    'text-[12px] font-semibold text-white/80',
                                    'hover:border-emerald-400/30 hover:bg-emerald-400/8',
                                    'transition-all duration-200 group/pill',
                                )}
                            >
                                <span className="text-emerald-400/70">{pill.icon}</span>
                                {pill.label}
                                <button
                                    type="button"
                                    onClick={() => onRemoveFilter(pill.key)}
                                    className="ml-0.5 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-400/30 hover:text-red-300 transition-all"
                                    aria-label={`Retirer le filtre ${pill.label}`}
                                >
                                    <X className="h-2.5 w-2.5" strokeWidth={3} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
