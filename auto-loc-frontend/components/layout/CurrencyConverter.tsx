'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency, CURRENCIES, type CurrencyCode } from '@/providers/currency-provider';

export function CurrencySelector() {
    const { currency, setCurrency, info } = useCurrency();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            {/* ── Trigger ───────────────────────────────────────── */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={cn(
                    'flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-[12px] font-bold transition-all duration-200',
                    open
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-black',
                )}
                title="Changer la devise"
            >
                <Globe className="w-3.5 h-3.5 opacity-60" strokeWidth={2.5} />
                <span className="font-black tracking-tight">{info.flag} {info.short}</span>
                <ChevronDown className={cn(
                    'w-3 h-3 transition-transform duration-200 opacity-50',
                    open && 'rotate-180',
                )} />
            </button>

            {/* ── Dropdown ──────────────────────────────────────── */}
            {open && (
                <div className="absolute right-0 top-full mt-2
                    w-56 rounded-2xl border border-slate-100 bg-white
                    shadow-2xl shadow-slate-300/50 z-[60]
                    animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">

                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100
                        bg-gradient-to-r from-slate-50 to-white">
                        <p className="text-[11px] font-black text-slate-900 tracking-tight">Devise d&apos;affichage</p>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                            Taux indicatifs
                        </p>
                    </div>

                    {/* Currency list */}
                    <div className="py-1.5">
                        {CURRENCIES.map((c) => {
                            const isActive = c.code === currency;
                            return (
                                <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => {
                                        setCurrency(c.code as CurrencyCode);
                                        setOpen(false);
                                    }}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150',
                                        isActive
                                            ? 'bg-emerald-50'
                                            : 'hover:bg-slate-50',
                                    )}
                                >
                                    {/* Flag */}
                                    <span className="text-lg leading-none">{c.flag}</span>

                                    {/* Label */}
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            'text-[13px] font-bold leading-none',
                                            isActive ? 'text-emerald-700' : 'text-slate-700',
                                        )}>
                                            {c.short}
                                        </p>
                                        <p className={cn(
                                            'text-[10px] font-medium mt-0.5 leading-none',
                                            isActive ? 'text-emerald-500' : 'text-slate-400',
                                        )}>
                                            {c.label}
                                        </p>
                                    </div>

                                    {/* Check */}
                                    {isActive && (
                                        <div className="w-5 h-5 rounded-lg bg-emerald-500 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
