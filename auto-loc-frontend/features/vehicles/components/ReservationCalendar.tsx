'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchBlockedDates, type BlockedRange } from '@/lib/nestjs/vehicles';

/* ── Helpers ────────────────────────────────────────────────────── */

const DAYS_FR = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MONTHS_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function toDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
}

function parseDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function isDateInRange(date: Date, from: string, to: string): boolean {
    const d = toDateStr(date);
    return d >= from && d <= to;
}

function getDaysInMonth(year: number, month: number): Date[] {
    const days: Date[] = [];
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    for (let d = 1; d <= last.getDate(); d++) {
        days.push(new Date(year, month, d));
    }
    // Pad start with empty slots (Monday = 0)
    const startDay = (first.getDay() + 6) % 7;
    const padded: (Date | null)[] = Array(startDay).fill(null);
    return [...padded, ...days] as Date[];
}

/* ── Component ──────────────────────────────────────────────────── */

interface Props {
    vehicleId: string;
    joursMinimum: number;
    dateDebut: string;
    dateFin: string;
    onDateDebutChange: (v: string) => void;
    onDateFinChange: (v: string) => void;
}

export function ReservationCalendar({
    vehicleId,
    joursMinimum,
    dateDebut,
    dateFin,
    onDateDebutChange,
    onDateFinChange,
}: Props) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectingEnd, setSelectingEnd] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchBlockedDates(vehicleId)
            .then((res) => setBlockedRanges(res.blockedRanges))
            .catch(() => setBlockedRanges([]))
            .finally(() => setLoading(false));
    }, [vehicleId]);

    const blockedSet = useMemo(() => {
        const set = new Set<string>();
        for (const range of blockedRanges) {
            const start = parseDate(range.from);
            const end = parseDate(range.to);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                set.add(toDateStr(d));
            }
        }
        return set;
    }, [blockedRanges]);

    const days = useMemo(
        () => getDaysInMonth(currentYear, currentMonth),
        [currentYear, currentMonth],
    );

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // Check if range between two dates has any blocked days
    const hasBlockedBetween = (start: string, end: string): boolean => {
        const s = parseDate(start);
        const e = parseDate(end);
        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
            if (blockedSet.has(toDateStr(d))) return true;
        }
        return false;
    };

    const handleDayClick = (day: Date) => {
        const str = toDateStr(day);

        if (!selectingEnd || !dateDebut) {
            // Selecting start date
            onDateDebutChange(str);
            onDateFinChange('');
            setSelectingEnd(true);
        } else {
            // Selecting end date
            if (str <= dateDebut) {
                // Clicked before start — reset
                onDateDebutChange(str);
                onDateFinChange('');
                setSelectingEnd(true);
                return;
            }

            // Check if the range includes blocked days
            if (hasBlockedBetween(dateDebut, str)) {
                // Reset — can't span across blocked dates
                onDateDebutChange(str);
                onDateFinChange('');
                setSelectingEnd(true);
                return;
            }

            // Compute nbJours
            const diff = Math.round(
                (parseDate(str).getTime() - parseDate(dateDebut).getTime()) / 86_400_000,
            ) + 1;
            if (diff < joursMinimum) return; // Not enough days

            onDateFinChange(str);
            setSelectingEnd(false);
        }
    };

    const isBlocked = (day: Date): boolean => {
        return blockedSet.has(toDateStr(day));
    };

    const isPast = (day: Date): boolean => {
        return day < today;
    };

    const isInRange = (day: Date): boolean => {
        if (!dateDebut || !dateFin) return false;
        const str = toDateStr(day);
        return str >= dateDebut && str <= dateFin;
    };

    const isStart = (day: Date): boolean => dateDebut ? isSameDay(day, parseDate(dateDebut)) : false;
    const isEnd = (day: Date): boolean => dateFin ? isSameDay(day, parseDate(dateFin)) : false;
    const isToday = (day: Date): boolean => isSameDay(day, today);

    const canGoBack = currentYear > today.getFullYear() ||
        (currentYear === today.getFullYear() && currentMonth > today.getMonth());

    return (
        <div className="space-y-2">
            {/* Selection summary */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
                {/* Prise en charge */}
                <div className={cn(
                    "rounded-xl px-3 py-2.5 border transition-all duration-200",
                    selectingEnd && !dateFin
                        ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-400/30"
                        : dateDebut
                            ? "border-slate-200 bg-slate-50"
                            : "border-dashed border-slate-200 bg-white",
                )}>
                    <p className={cn(
                        "text-[9.5px] font-bold uppercase tracking-widest mb-0.5",
                        selectingEnd && !dateFin ? "text-emerald-500" : "text-slate-400",
                    )}>
                        Prise en charge
                    </p>
                    <p className={cn(
                        "font-bold text-[12px]",
                        dateDebut ? "text-slate-800" : "text-slate-300",
                    )}>
                        {dateDebut
                            ? parseDate(dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                            : '—'
                        }
                    </p>
                </div>
                {/* Date de retour */}
                <div className={cn(
                    "rounded-xl px-3 py-2.5 border transition-all duration-200",
                    selectingEnd && dateDebut && !dateFin
                        ? "border-dashed border-emerald-400 bg-emerald-50/60 animate-pulse"
                        : dateFin
                            ? "border-slate-200 bg-slate-50"
                            : "border-dashed border-slate-200 bg-white",
                )}>
                    <p className={cn(
                        "text-[9.5px] font-bold uppercase tracking-widest mb-0.5",
                        selectingEnd && dateDebut && !dateFin ? "text-emerald-500" : "text-slate-400",
                    )}>
                        Date de retour
                    </p>
                    <p className={cn(
                        "font-bold text-[12px]",
                        dateFin ? "text-slate-800" : "text-slate-300",
                    )}>
                        {dateFin
                            ? parseDate(dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                            : '—'
                        }
                    </p>
                </div>
            </div>

            {/* Calendar */}
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                {/* Month nav */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <button
                        type="button"
                        onClick={prevMonth}
                        disabled={!canGoBack}
                        className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200
              hover:bg-slate-100 hover:border-slate-300 transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
                    </button>
                    <span className="text-[13.5px] font-black text-slate-800 tracking-tight">
                        {MONTHS_FR[currentMonth]} {currentYear}
                    </span>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200
              hover:bg-slate-100 hover:border-slate-300 transition-all duration-150"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-14">
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                    </div>
                ) : (
                    <div className="p-3">
                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-2">
                            {DAYS_FR.map((d) => (
                                <div key={d} className="text-center text-[9.5px] font-black uppercase tracking-widest text-slate-300 py-1">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Day cells */}
                        <div className="grid grid-cols-7 gap-0.5">
                            {days.map((day, i) => {
                                if (!day) {
                                    return <div key={`empty-${i}`} className="h-9" />;
                                }

                                const blocked = isBlocked(day);
                                const past = isPast(day);
                                const disabled = blocked || past;
                                const inRange = isInRange(day);
                                const start = isStart(day);
                                const end = isEnd(day);
                                const todayMark = isToday(day);

                                return (
                                    <button
                                        key={toDateStr(day)}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleDayClick(day)}
                                        className={cn(
                                            'relative h-9 w-full rounded-xl text-[12.5px] font-semibold transition-all duration-150',

                                            // Disabled states
                                            disabled && 'cursor-not-allowed',
                                            past && !blocked && 'text-slate-200',
                                            blocked && 'rounded-none text-red-300 line-through cursor-not-allowed',
                                            blocked && 'bg-gradient-to-br from-red-50 to-rose-50/60',

                                            // Normal selectable
                                            !disabled && !inRange && !start && !end && 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 hover:scale-105',

                                            // In range (between start and end)
                                            inRange && !start && !end && 'bg-emerald-100/70 text-emerald-700 rounded-none',

                                            // Start — rounded left
                                            start && !end && 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 rounded-r-none rounded-l-xl',
                                            // End — rounded right
                                            end && !start && 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 rounded-l-none rounded-r-xl',
                                            // Single day (start === end)
                                            start && end && 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 rounded-xl',
                                        )}
                                    >
                                        {day.getDate()}
                                        {todayMark && !start && !end && (
                                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-gradient-to-br from-red-100 to-rose-100 border border-red-200/60" />
                        <span className="text-[9.5px] font-semibold text-slate-400">Indisponible</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-lg bg-emerald-500" />
                        <span className="text-[9.5px] font-semibold text-slate-400">Sélectionné</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="relative w-3 h-3 rounded border border-slate-200 bg-white">
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                        </span>
                        <span className="text-[9.5px] font-semibold text-slate-400">Aujourd&apos;hui</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
