'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchBlockedDates, type BlockedRange } from '@/lib/nestjs/vehicles';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';

/* ── Helpers ─────────────────────────────────────────────────────── */

function parseDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtShort(iso: string): string {
    return parseDate(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/* ── Props ───────────────────────────────────────────────────────── */

interface Props {
    vehicleId: string;
    joursMinimum: number;
    dateDebut: string;
    dateFin: string;
    onDateDebutChange: (v: string) => void;
    onDateFinChange: (v: string) => void;
}

/* ── Calendar classNames (shared style tokens) ───────────────────── */

const calendarClassNames = {
    months: 'flex flex-col',
    month: 'space-y-2 p-4',
    caption: 'flex justify-center pt-1 relative items-center mb-1',
    caption_label: 'text-[13.5px] font-black text-slate-800 tracking-tight',
    nav: 'flex items-center',
    nav_button: cn(
        'h-8 w-8 p-0 rounded-xl border border-slate-200 bg-white',
        'hover:bg-slate-100 hover:border-slate-300 transition-all duration-150',
        'text-slate-500 inline-flex items-center justify-center',
    ),
    nav_button_previous: 'absolute left-1',
    nav_button_next: 'absolute right-1',
    table: 'w-full border-collapse',
    head_row: 'flex',
    head_cell: 'text-slate-300 w-9 text-center font-black text-[9.5px] uppercase tracking-widest py-1',
    row: 'flex w-full mt-0.5',
    cell: 'h-9 w-9 text-center p-0 relative focus-within:z-20',
    // Base day
    day: cn(
        'h-9 w-9 p-0 font-semibold text-[12.5px] text-slate-700',
        'transition-all duration-150 inline-flex items-center justify-center',
        'hover:bg-emerald-50 hover:text-emerald-700',
    ),
    // Start / end of range — solid emerald circles
    day_selected: cn(
        'bg-emerald-500 !text-white font-bold rounded-xl',
        'hover:bg-emerald-500 hover:!text-white',
        'shadow-md shadow-emerald-500/30',
    ),
    // Middle days of range — soft emerald fill, no rounded corners on sides
    day_range_middle: cn(
        '!rounded-none bg-emerald-50 !text-emerald-700 font-semibold',
        'hover:bg-emerald-100 hover:!text-emerald-800',
    ),
    // Round only the outer edges of the range band
    day_range_start: 'rounded-l-xl rounded-r-none',
    day_range_end: 'rounded-r-xl rounded-l-none',
    day_today: 'border border-emerald-400/50 text-emerald-600 font-bold',
    day_outside: 'text-slate-200 opacity-60',
    day_disabled: cn(
        '!text-red-400 line-through opacity-70 cursor-not-allowed',
        '!bg-red-50 hover:!bg-red-50 hover:!text-red-400 !rounded-none',
    ),
    day_hidden: 'invisible',
};

/* ── Main Component ──────────────────────────────────────────────── */

export function ReservationCalendar({
    vehicleId,
    joursMinimum,
    dateDebut,
    dateFin,
    onDateDebutChange,
    onDateFinChange,
}: Props) {
    const [open, setOpen] = useState(false);
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);

    useEffect(() => {
        fetchBlockedDates(vehicleId)
            .then((res) => setBlockedRanges(res.blockedRanges))
            .catch(() => setBlockedRanges([]));
    }, [vehicleId]);

    /* Build a Set<string> of blocked dates for O(1) lookup */
    const blockedSet = useMemo(() => {
        const set = new Set<string>();
        for (const range of blockedRanges) {
            const start = parseDate(range.from);
            const end = parseDate(range.to);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                set.add(toDateStr(new Date(d)));
            }
        }
        return set;
    }, [blockedRanges]);

    /* Disabled function for range mode */
    const isDisabled = (date: Date): boolean => {
        if (date < today) return true;
        if (blockedSet.has(toDateStr(date))) return true;
        return false;
    };

    /* Current range selection (react-day-picker DateRange) */
    const rangeValue: DateRange | undefined = useMemo(() => {
        if (!dateDebut) return undefined;
        return {
            from: parseDate(dateDebut),
            to: dateFin ? parseDate(dateFin) : undefined,
        };
    }, [dateDebut, dateFin]);

    /* Handle range selection from react-day-picker */
    function handleRangeSelect(range: DateRange | undefined) {
        if (!range) {
            onDateDebutChange('');
            onDateFinChange('');
            return;
        }

        const { from, to } = range;

        if (from) {
            const fromStr = toDateStr(from);
            onDateDebutChange(fromStr);
        }

        if (to) {
            const toStr = toDateStr(to);

            // Enforce joursMinimum: silently bump end date if too close
            if (from) {
                const minEnd = new Date(from);
                minEnd.setDate(minEnd.getDate() + joursMinimum - 1);
                if (to < minEnd) {
                    onDateFinChange(toDateStr(minEnd));
                    return;
                }
            }

            // Block range if any day inside is blocked
            if (from) {
                for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
                    if (blockedSet.has(toDateStr(new Date(d)))) {
                        // Reset fin — blocked day inside the range
                        onDateFinChange('');
                        return;
                    }
                }
            }

            onDateFinChange(toStr);
            // Close popover once both dates are picked
            if (from) setOpen(false);
        } else {
            // Only from was selected (user clicked first date)
            onDateFinChange('');
        }
    }

    const hasRange = !!dateDebut && !!dateFin;
    const hasStart = !!dateDebut && !dateFin;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {/* ── Trigger — two zones in one button ───────────────── */}
                <button
                    type="button"
                    className={cn(
                        'w-full flex items-center gap-0 rounded-xl overflow-hidden',
                        'border text-[12.5px] font-medium transition-all duration-200',
                        'focus:outline-none focus:ring-1 focus:ring-emerald-400/30',
                        hasRange ? 'border-emerald-300/60' : 'border-dashed border-slate-200',
                        open && 'border-emerald-400/60 ring-1 ring-emerald-400/20',
                    )}
                >
                    {/* Start date zone */}
                    <span className={cn(
                        'flex-1 flex items-center gap-2 px-3.5 py-2.5',
                        'border-r border-slate-200',
                        hasStart || hasRange
                            ? 'bg-emerald-50/60 text-emerald-800'
                            : 'bg-white text-slate-400',
                    )}>
                        <CalendarIcon className={cn(
                            'w-3.5 h-3.5 shrink-0',
                            dateDebut ? 'text-emerald-500' : 'text-slate-300',
                        )} strokeWidth={1.75} />
                        <span className="flex flex-col text-left leading-tight">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Départ</span>
                            <span className="truncate">
                                {dateDebut ? fmtShort(dateDebut) : 'Date départ'}
                            </span>
                        </span>
                    </span>

                    {/* Arrow separator */}
                    <span className={cn(
                        'flex-shrink-0 px-2',
                        hasRange ? 'text-emerald-400' : 'text-slate-300',
                    )}>
                        <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                    </span>

                    {/* End date zone */}
                    <span className={cn(
                        'flex-1 flex items-center gap-2 px-3.5 py-2.5',
                        'border-l border-slate-200',
                        hasRange
                            ? 'bg-emerald-50/60 text-emerald-800'
                            : hasStart
                                ? 'bg-emerald-50/30 text-emerald-600 animate-pulse'
                                : 'bg-white text-slate-400',
                    )}>
                        <CalendarIcon className={cn(
                            'w-3.5 h-3.5 shrink-0',
                            dateFin ? 'text-emerald-500' : 'text-slate-300',
                        )} strokeWidth={1.75} />
                        <span className="flex flex-col text-left leading-tight">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Retour</span>
                            <span className="truncate">
                                {dateFin ? fmtShort(dateFin) : (hasStart ? 'Choisir…' : 'Date retour')}
                            </span>
                        </span>
                    </span>
                </button>
            </PopoverTrigger>

            {/* ── Popover calendar ─────────────────────────────────── */}
            <PopoverContent
                className={cn(
                    'w-auto p-0 z-50',
                    'border border-slate-100 bg-white',
                    'shadow-2xl shadow-slate-200/60 rounded-2xl overflow-hidden',
                )}
                align="start"
                sideOffset={6}
            >
                {/* Helper hint */}
                <div className="px-4 pt-3.5 pb-1">
                    <p className="text-[10.5px] font-semibold text-slate-400">
                        {!dateDebut
                            ? '① Choisissez la date de départ'
                            : !dateFin
                                ? `② Choisissez la date de retour (min. ${joursMinimum}j)`
                                : '✓ Plage sélectionnée — modifiez si besoin'}
                    </p>
                </div>

                <Calendar
                    mode="range"
                    selected={rangeValue}
                    onSelect={handleRangeSelect}
                    disabled={isDisabled}
                    numberOfMonths={1}
                    initialFocus
                    classNames={calendarClassNames}
                />

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-red-50 border border-red-200/60" />
                        <span className="text-[9.5px] font-semibold text-slate-400">Indisponible</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-lg bg-emerald-500" />
                        <span className="text-[9.5px] font-semibold text-slate-400">Départ / Retour</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200/60" />
                        <span className="text-[9.5px] font-semibold text-slate-400">Plage réservée</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded border border-emerald-400/50 bg-white" />
                        <span className="text-[9.5px] font-semibold text-slate-400">Aujourd&apos;hui</span>
                    </div>
                </div>

                {/* Reset link */}
                {(dateDebut || dateFin) && (
                    <div className="px-4 pb-3 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                onDateDebutChange('');
                                onDateFinChange('');
                            }}
                            className="text-[10.5px] font-semibold text-slate-400 hover:text-red-500 transition-colors"
                        >
                            Effacer les dates
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
