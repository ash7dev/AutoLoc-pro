'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchBlockedDates, type BlockedRange } from '@/lib/nestjs/vehicles';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

/* ── Helpers ─────────────────────────────────────────────────────── */

function parseDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDisplay(iso: string): string {
    return parseDate(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ── Single Date Picker ──────────────────────────────────────────── */

interface DatePickerProps {
    label: string;
    value: string;
    placeholder: string;
    onChange: (iso: string) => void;
    disabledFn: (date: Date) => boolean;
    isActive?: boolean;
}

function VehicleDatePicker({ label, value, placeholder, onChange, disabledFn, isActive }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const selected = value ? parseDate(value) : undefined;

    return (
        <div className="flex-1 min-w-0">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                {label}
            </p>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            'w-full flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5',
                            'border text-[13px] font-medium transition-all duration-200',
                            'hover:border-emerald-400/60 hover:bg-emerald-50/40',
                            'focus:outline-none focus:ring-1 focus:ring-emerald-400/30',
                            value
                                ? 'border-slate-200 bg-slate-50 text-slate-800'
                                : 'border-dashed border-slate-200 bg-white text-slate-400',
                            isActive && !value && 'border-emerald-400/60 bg-emerald-50/40 text-emerald-600',
                            open && 'border-emerald-400/60 ring-1 ring-emerald-400/20',
                        )}
                    >
                        <span className="truncate">
                            {value ? fmtDisplay(value) : placeholder}
                        </span>
                        <CalendarIcon
                            className={cn(
                                'h-3.5 w-3.5 shrink-0 transition-colors',
                                value ? 'text-emerald-500' : 'text-slate-300',
                            )}
                            strokeWidth={1.75}
                        />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className={cn(
                        'w-auto p-0 z-50',
                        'border border-slate-100 bg-white',
                        'shadow-2xl shadow-slate-200/60 rounded-2xl overflow-hidden',
                    )}
                    align="start"
                    sideOffset={6}
                >
                    <Calendar
                        mode="single"
                        selected={selected}
                        onSelect={(date) => {
                            if (date) {
                                onChange(toDateStr(date));
                                setOpen(false);
                            }
                        }}
                        disabled={disabledFn}
                        initialFocus
                        classNames={{
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
                            day: cn(
                                'h-9 w-9 p-0 font-semibold rounded-xl text-[12.5px] text-slate-700',
                                'hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-150',
                                'inline-flex items-center justify-center',
                            ),
                            day_selected: cn(
                                'bg-emerald-500 !text-white font-bold rounded-xl',
                                'hover:bg-emerald-500 hover:!text-white',
                                'shadow-md shadow-emerald-500/25',
                            ),
                            day_today: 'border border-emerald-400/50 text-emerald-600 font-bold',
                            day_outside: 'text-slate-200 opacity-60',
                            day_disabled: cn(
                                'text-red-500 line-through opacity-80 cursor-not-allowed',
                                'bg-red-100 hover:bg-red-100 hover:text-red-500 rounded-none',
                            ),
                            day_range_middle: '',
                            day_hidden: 'invisible',
                        }}
                    />
                    {/* Legend */}
                    <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-red-50 border border-red-200/60" />
                            <span className="text-[9.5px] font-semibold text-slate-400">Indisponible</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-lg bg-emerald-500" />
                            <span className="text-[9.5px] font-semibold text-slate-400">Sélectionné</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded border border-emerald-400/50 bg-white" />
                            <span className="text-[9.5px] font-semibold text-slate-400">Aujourd&apos;hui</span>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

/* ── Main Component ──────────────────────────────────────────────── */

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

    const isBlockedOrPast = (date: Date): boolean => {
        return date < today || blockedSet.has(toDateStr(date));
    };

    const isBlockedOrBeforeStart = (date: Date): boolean => {
        if (date < today || blockedSet.has(toDateStr(date))) return true;
        if (dateDebut) {
            const start = parseDate(dateDebut);
            const minEnd = new Date(start);
            minEnd.setDate(minEnd.getDate() + joursMinimum - 1);
            if (date < minEnd) return true;
            // Also block if any date in range is blocked
            for (let d = new Date(start); d <= date; d.setDate(d.getDate() + 1)) {
                if (blockedSet.has(toDateStr(new Date(d)))) return true;
            }
        }
        return false;
    };

    return (
        <div className="flex gap-2">
            <VehicleDatePicker
                label="Prise en charge"
                value={dateDebut}
                placeholder="Choisir une date"
                onChange={(iso) => {
                    onDateDebutChange(iso);
                    // Reset fin if it's no longer valid
                    if (dateFin && dateFin <= iso) {
                        onDateFinChange('');
                    }
                }}
                disabledFn={isBlockedOrPast}
                isActive={!dateDebut}
            />
            <VehicleDatePicker
                label="Date de retour"
                value={dateFin}
                placeholder="Choisir une date"
                onChange={onDateFinChange}
                disabledFn={isBlockedOrBeforeStart}
                isActive={!!dateDebut && !dateFin}
            />
        </div>
    );
}
