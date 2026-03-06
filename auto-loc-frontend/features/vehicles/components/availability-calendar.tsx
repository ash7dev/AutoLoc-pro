'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, CalendarX2,
    Trash2, Loader2, CalendarDays, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    fetchIndisponibilites,
    createIndisponibilite,
    deleteIndisponibilite,
    type Indisponibilite,
} from '@/lib/nestjs/vehicles';

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

function isInRange(date: Date, start: Date, end: Date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    return d >= s && d <= e;
}

function buildMonth(year: number, month: number): DayInfo[] {
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const today = new Date();
    const days: DayInfo[] = [];

    for (let i = offset - 1; i >= 0; i--) {
        days.push({ date: new Date(year, month, -i), isCurrentMonth: false, isToday: false, isBlocked: false, isReserved: false });
    }
    const count = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= count; i++) {
        const d = new Date(year, month, i);
        days.push({ date: d, isCurrentMonth: true, isToday: isSameDay(d, today), isBlocked: false, isReserved: false });
    }
    const rem = days.length % 7;
    if (rem > 0) {
        for (let i = 1; i <= 7 - rem; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false, isToday: false, isBlocked: false, isReserved: false });
        }
    }
    return days;
}

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
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

    const getToken = useCallback(() => {
        return document.cookie.match(/(?:^|;\s*)nest_access=([^;]*)/)?.[1] ?? '';
    }, []);

    const loadIndispos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchIndisponibilites(vehicleId, getToken());
            setIndispos(res.data);
        } catch {
            setError('Erreur de chargement des disponibilités');
        } finally {
            setLoading(false);
        }
    }, [vehicleId, getToken]);

    useEffect(() => { loadIndispos(); }, [loadIndispos]);

    /* Build days with blocking/reservation overlay */
    const days = buildMonth(year, month).map(day => {
        let isBlocked = false, indispoId: string | undefined;
        let isReserved = false, reservationStatut: string | undefined;

        for (const ind of indispos) {
            if (isInRange(day.date, new Date(ind.dateDebut), new Date(ind.dateFin))) {
                isBlocked = true; indispoId = ind.id; break;
            }
        }
        for (const r of reservations) {
            if (['PAYEE', 'CONFIRMEE', 'EN_COURS'].includes(r.statut) &&
                isInRange(day.date, new Date(r.dateDebut), new Date(r.dateFin))) {
                isReserved = true; reservationStatut = r.statut; break;
            }
        }
        return { ...day, isBlocked, indispoId, isReserved, reservationStatut };
    });

    /* Navigation */
    const prev = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
    const next = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

    /* Day click */
    const handleDayClick = (day: DayInfo) => {
        if (!day.isCurrentMonth || day.isReserved) return;
        if (day.date < today && !isSameDay(day.date, today)) return;

        if (!selectStart || (selectStart && selectEnd)) {
            setSelectStart(day.date); setSelectEnd(null);
        } else {
            if (day.date < selectStart) { setSelectEnd(selectStart); setSelectStart(day.date); }
            else setSelectEnd(day.date);
        }
    };

    const isSelected = (d: Date) => {
        if (!selectStart) return false;
        if (!selectEnd) return isSameDay(d, selectStart);
        return isInRange(d, selectStart, selectEnd);
    };

    /* Block */
    const handleBlock = async () => {
        if (!selectStart) return;
        setSaving(true); setError('');
        try {
            await createIndisponibilite(vehicleId, {
                dateDebut: selectStart.toISOString().split('T')[0],
                dateFin: (selectEnd ?? selectStart).toISOString().split('T')[0],
                motif: motif.trim() || undefined,
            }, getToken());
            setSelectStart(null); setSelectEnd(null); setMotif('');
            await loadIndispos();
        } catch (e: any) {
            setError(e?.message ?? 'Erreur lors du blocage');
        } finally { setSaving(false); }
    };

    /* Unblock */
    const handleUnblock = async (id: string) => {
        setSaving(true); setError('');
        try {
            await deleteIndisponibilite(vehicleId, id, getToken());
            await loadIndispos();
        } catch (e: any) {
            setError(e?.message ?? 'Erreur lors de la suppression');
        } finally { setSaving(false); }
    };

    return (
        <div className="space-y-4">

            {/* ── Calendar panel ─────────────────────────────────── */}
            <div className="rounded-2xl bg-slate-950 border border-white/8 overflow-hidden">

                {/* Month nav */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                    <button type="button" onClick={prev}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                        <ChevronLeft className="w-4 h-4 text-white/50" strokeWidth={2} />
                    </button>
                    <span className="text-[13px] font-black text-white tracking-tight">
                        {MONTHS[month]} {year}
                    </span>
                    <button type="button" onClick={next}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4 text-white/50" strokeWidth={2} />
                    </button>
                </div>

                {/* Grid */}
                <div className="p-3">

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-1">
                        {WEEKDAYS.map(w => (
                            <div key={w} className="text-center text-[9.5px] font-black uppercase tracking-widest text-white/20 py-1.5">
                                {w}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-5 h-5 text-emerald-400/50 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-px">
                            {days.map((day, i) => {
                                const isPast = day.date < today && !isSameDay(day.date, today);
                                const sel = isSelected(day.date);
                                const isStart = selectStart && isSameDay(day.date, selectStart);
                                const isEnd = selectEnd && isSameDay(day.date, selectEnd);

                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleDayClick(day)}
                                        disabled={!day.isCurrentMonth || day.isReserved || isPast}
                                        className={cn(
                                            'relative h-9 w-full flex items-center justify-center text-[12px] font-semibold rounded-lg transition-all duration-150',
                                            /* out-of-month */
                                            !day.isCurrentMonth && 'text-white/10 cursor-default',
                                            /* past */
                                            isPast && day.isCurrentMonth && 'text-white/15 cursor-default',
                                            /* available */
                                            day.isCurrentMonth && !day.isBlocked && !day.isReserved && !sel && !isPast &&
                                            'text-white/60 hover:bg-white/8 hover:text-white cursor-pointer',
                                            /* today ring */
                                            day.isToday && 'ring-1 ring-inset ring-emerald-400/40',
                                            /* blocked */
                                            day.isBlocked && day.isCurrentMonth && 'bg-red-500/15 text-red-400',
                                            /* reserved */
                                            day.isReserved && day.isCurrentMonth && 'bg-blue-500/15 text-blue-400 cursor-not-allowed',
                                            /* selected range */
                                            sel && !isStart && !isEnd && 'bg-emerald-400/10 text-emerald-300 rounded-none',
                                            /* start / end */
                                            (isStart || isEnd) && 'bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/30',
                                        )}
                                    >
                                        {day.date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 px-4 py-3 border-t border-white/5">
                    {[
                        { dot: 'bg-emerald-500', label: 'Disponible' },
                        { dot: 'bg-red-400', label: 'Bloqué' },
                        { dot: 'bg-blue-400', label: 'Réservé' },
                    ].map(l => (
                        <span key={l.label} className="flex items-center gap-1.5 text-[10px] font-semibold text-white/30">
                            <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                            {l.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Selection panel ─────────────────────────────────── */}
            {selectStart && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                        <p className="text-[13px] font-bold text-emerald-800">
                            {selectEnd
                                ? `Du ${selectStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au ${selectEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                : `Le ${selectStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                        </p>
                    </div>
                    <input
                        type="text"
                        placeholder="Motif (optionnel) — ex: entretien, usage personnel…"
                        value={motif}
                        onChange={e => setMotif(e.target.value)}
                        className="w-full rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition-all"
                    />
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleBlock}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-[12px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarX2 className="w-3.5 h-3.5" strokeWidth={2} />}
                            Bloquer ces dates
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSelectStart(null); setSelectEnd(null); setMotif(''); }}
                            className="px-4 py-2.5 rounded-xl border border-emerald-200 text-[12px] font-semibold text-emerald-700 hover:bg-white transition-all"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* ── Error ───────────────────────────────────────────── */}
            {error && (
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-red-500">
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                    {error}
                </p>
            )}

            {/* ── Blocked periods ─────────────────────────────────── */}
            {indispos.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Périodes bloquées ({indispos.length})
                    </p>
                    <div className="space-y-1.5">
                        {indispos.map(ind => (
                            <div
                                key={ind.id}
                                className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5"
                            >
                                <div className="min-w-0">
                                    <p className="text-[12.5px] font-bold text-red-700">
                                        {new Date(ind.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        {' → '}
                                        {new Date(ind.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                    {ind.motif && (
                                        <p className="text-[11px] text-red-400 truncate mt-0.5">{ind.motif}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleUnblock(ind.id)}
                                    disabled={saving}
                                    className="w-7 h-7 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-500 transition-colors disabled:opacity-50 flex-shrink-0 ml-3"
                                >
                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}