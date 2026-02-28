'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    CalendarX2,
    Plus,
    Trash2,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    fetchIndisponibilites,
    createIndisponibilite,
    deleteIndisponibilite,
    type Indisponibilite,
} from '@/lib/nestjs/vehicles';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AvailabilityCalendarProps {
    vehicleId: string;
    reservations?: { dateDebut: string; dateFin: string; statut: string }[];
}

interface DayInfo {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isBlocked: boolean;
    isReserved: boolean;
    indispoId?: string;
    reservationStatut?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isDateInRange(date: Date, start: Date, end: Date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    return d >= s && d <= e;
}

function getDaysInMonth(year: number, month: number): DayInfo[] {
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday=0
    const today = new Date();
    const days: DayInfo[] = [];

    // Previous month fill
    for (let i = startOffset - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        days.push({ date: d, isCurrentMonth: false, isToday: false, isBlocked: false, isReserved: false });
    }

    // Current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        days.push({
            date: d,
            isCurrentMonth: true,
            isToday: isSameDay(d, today),
            isBlocked: false,
            isReserved: false,
        });
    }

    // Next month fill
    const remainder = days.length % 7;
    if (remainder > 0) {
        for (let i = 1; i <= 7 - remainder; i++) {
            const d = new Date(year, month + 1, i);
            days.push({ date: d, isCurrentMonth: false, isToday: false, isBlocked: false, isReserved: false });
        }
    }

    return days;
}

const MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// ── Component ────────────────────────────────────────────────────────────────

export function AvailabilityCalendar({ vehicleId, reservations = [] }: AvailabilityCalendarProps) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [indispos, setIndispos] = useState<Indisponibilite[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectStart, setSelectStart] = useState<Date | null>(null);
    const [selectEnd, setSelectEnd] = useState<Date | null>(null);
    const [motif, setMotif] = useState('');
    const [error, setError] = useState('');

    // Get token from cookie
    const getToken = useCallback(() => {
        const match = document.cookie.match(/(?:^|;\s*)nest_access=([^;]*)/);
        return match?.[1] ?? '';
    }, []);

    // Fetch indisponibilités
    const loadIndispos = useCallback(async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetchIndisponibilites(vehicleId, token);
            setIndispos(res.data);
        } catch {
            setError('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, [vehicleId, getToken]);

    useEffect(() => { loadIndispos(); }, [loadIndispos]);

    // Build calendar days
    const rawDays = getDaysInMonth(year, month);
    const days = rawDays.map((day) => {
        const d = day.date;
        let isBlocked = false;
        let indispoId: string | undefined;
        let isReserved = false;
        let reservationStatut: string | undefined;

        for (const ind of indispos) {
            if (isDateInRange(d, new Date(ind.dateDebut), new Date(ind.dateFin))) {
                isBlocked = true;
                indispoId = ind.id;
                break;
            }
        }

        for (const r of reservations) {
            if (['PAYEE', 'CONFIRMEE', 'EN_COURS'].includes(r.statut) &&
                isDateInRange(d, new Date(r.dateDebut), new Date(r.dateFin))) {
                isReserved = true;
                reservationStatut = r.statut;
                break;
            }
        }

        return { ...day, isBlocked, indispoId, isReserved, reservationStatut };
    });

    // Navigation
    const prevMonth = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
    };

    // Selection
    const handleDayClick = (day: DayInfo) => {
        if (!day.isCurrentMonth || day.isReserved) return;
        if (day.date < today && !isSameDay(day.date, today)) return;

        if (!selectStart || (selectStart && selectEnd)) {
            setSelectStart(day.date);
            setSelectEnd(null);
        } else {
            if (day.date < selectStart) {
                setSelectEnd(selectStart);
                setSelectStart(day.date);
            } else {
                setSelectEnd(day.date);
            }
        }
    };

    const isInSelection = (d: Date) => {
        if (!selectStart) return false;
        if (!selectEnd) return isSameDay(d, selectStart);
        return isDateInRange(d, selectStart, selectEnd);
    };

    // Create block
    const handleBlock = async () => {
        if (!selectStart) return;
        setSaving(true);
        setError('');
        try {
            const token = getToken();
            await createIndisponibilite(vehicleId, {
                dateDebut: (selectStart).toISOString().split('T')[0],
                dateFin: (selectEnd ?? selectStart).toISOString().split('T')[0],
                motif: motif.trim() || undefined,
            }, token);
            setSelectStart(null);
            setSelectEnd(null);
            setMotif('');
            await loadIndispos();
        } catch (e: any) {
            setError(e?.message ?? 'Erreur lors de la création');
        } finally {
            setSaving(false);
        }
    };

    // Delete block
    const handleUnblock = async (indispoId: string) => {
        setSaving(true);
        setError('');
        try {
            const token = getToken();
            await deleteIndisponibilite(vehicleId, indispoId, token);
            await loadIndispos();
        } catch (e: any) {
            setError(e?.message ?? 'Erreur lors de la suppression');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Calendrier de disponibilité</h3>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <ChevronLeft className="w-4 h-4 text-white/60" />
                    </button>
                    <span className="text-sm font-semibold text-white/80 min-w-[140px] text-center">
                        {MONTHS[month]} {year}
                    </span>
                    <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <ChevronRight className="w-4 h-4 text-white/60" />
                    </button>
                </div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/10">
                {/* Weekday headers */}
                {WEEKDAYS.map((w) => (
                    <div key={w} className="text-center text-[10px] font-bold text-white/30 uppercase tracking-wider py-2 bg-white/5">
                        {w}
                    </div>
                ))}

                {/* Days */}
                {loading ? (
                    <div className="col-span-7 flex items-center justify-center py-20">
                        <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                    </div>
                ) : (
                    days.map((day, i) => {
                        const isPast = day.date < today && !isSameDay(day.date, today);
                        const selected = isInSelection(day.date);

                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleDayClick(day)}
                                disabled={!day.isCurrentMonth || day.isReserved || isPast}
                                className={cn(
                                    'relative h-10 flex items-center justify-center text-[12px] font-medium transition-all',
                                    !day.isCurrentMonth && 'text-white/10',
                                    day.isCurrentMonth && !day.isBlocked && !day.isReserved && !selected && !isPast && 'text-white/70 hover:bg-white/10',
                                    day.isToday && 'ring-1 ring-inset ring-emerald-400/50',
                                    day.isBlocked && day.isCurrentMonth && 'bg-red-500/20 text-red-300',
                                    day.isReserved && day.isCurrentMonth && 'bg-blue-500/20 text-blue-300',
                                    selected && 'bg-emerald-400/30 text-emerald-300',
                                    isPast && day.isCurrentMonth && 'text-white/15',
                                )}
                            >
                                {day.date.getDate()}
                                {day.isBlocked && day.isCurrentMonth && (
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
                                )}
                                {day.isReserved && day.isCurrentMonth && (
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                                )}
                            </button>
                        );
                    })
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-[10px] text-white/40">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Bloqué</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Réservé</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Sélectionné</span>
            </div>

            {/* Selection action */}
            {selectStart && (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 space-y-3">
                    <p className="text-xs font-semibold text-emerald-300">
                        {selectEnd
                            ? `Bloquer du ${selectStart.toLocaleDateString('fr-FR')} au ${selectEnd.toLocaleDateString('fr-FR')}`
                            : `Bloquer le ${selectStart.toLocaleDateString('fr-FR')}`}
                    </p>
                    <input
                        type="text"
                        placeholder="Motif (optionnel)"
                        value={motif}
                        onChange={(e) => setMotif(e.target.value)}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50"
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleBlock}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CalendarX2 className="w-3 h-3" />}
                            Bloquer ces dates
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSelectStart(null); setSelectEnd(null); setMotif(''); }}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-medium hover:text-white transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

            {/* Blocked periods list */}
            {indispos.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Périodes bloquées</p>
                    {indispos.map((ind) => (
                        <div
                            key={ind.id}
                            className="flex items-center justify-between rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2"
                        >
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-red-300">
                                    {new Date(ind.dateDebut).toLocaleDateString('fr-FR')} — {new Date(ind.dateFin).toLocaleDateString('fr-FR')}
                                </p>
                                {ind.motif && <p className="text-[10px] text-red-300/60 truncate">{ind.motif}</p>}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleUnblock(ind.id)}
                                disabled={saving}
                                className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors disabled:opacity-50 shrink-0"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
