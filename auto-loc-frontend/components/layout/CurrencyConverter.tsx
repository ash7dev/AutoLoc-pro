'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowRightLeft, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CURRENCIES = [
    { code: 'XOF', label: 'FCFA', flag: '🇸🇳', rate: 1 },
    { code: 'EUR', label: 'Euro', flag: '🇪🇺', rate: 0.00152 },
    { code: 'USD', label: 'Dollar', flag: '🇺🇸', rate: 0.00166 },
    { code: 'GBP', label: 'Livre', flag: '🇬🇧', rate: 0.00131 },
    { code: 'CAD', label: 'CAD', flag: '🇨🇦', rate: 0.00228 },
    { code: 'CHF', label: 'Franc CH', flag: '🇨🇭', rate: 0.00146 },
] as const;

type CurrencyCode = (typeof CURRENCIES)[number]['code'];

function formatConverted(amount: number): string {
    if (amount >= 1) return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(amount);
    return amount.toFixed(4);
}

export function CurrencyConverter() {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [from, setFrom] = useState<CurrencyCode>('XOF');
    const [to, setTo] = useState<CurrencyCode>('EUR');
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

    const fromCurrency = CURRENCIES.find(c => c.code === from)!;
    const toCurrency = CURRENCIES.find(c => c.code === to)!;
    const numAmount = parseFloat(amount) || 0;
    const converted = numAmount * (toCurrency.rate / fromCurrency.rate);

    const swap = () => { setFrom(to); setTo(from); };

    return (
        <div ref={ref} className="relative">
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200',
                    open
                        ? 'bg-black text-emerald-400 shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-black',
                )}
                title="Convertisseur de devise"
            >
                <ArrowRightLeft className="h-3.5 w-3.5" strokeWidth={2} />
                <span className="hidden sm:inline">Devises</span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-100 bg-white
          shadow-2xl shadow-slate-300/40 z-[60] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                        <div className="flex items-center gap-2">
                            <ArrowRightLeft className="h-4 w-4 text-emerald-500" strokeWidth={2} />
                            <span className="text-[13px] font-bold text-black tracking-tight">Convertisseur</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400
                hover:text-black hover:bg-slate-100 transition-all"
                        >
                            <X className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                    </div>

                    <div className="p-4 space-y-3">
                        {/* Amount input */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Montant</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Ex : 25 000"
                                autoFocus
                                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5
                  text-[15px] font-bold text-black tabular-nums
                  placeholder-slate-300 outline-none
                  focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all"
                            />
                        </div>

                        {/* From → To */}
                        <div className="flex items-center gap-2">
                            <CurrencySelect
                                label="De"
                                value={from}
                                onChange={(v) => { setFrom(v); if (v === to) setTo(from); }}
                            />
                            <button
                                type="button"
                                onClick={swap}
                                className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl
                  border border-slate-200 bg-white text-slate-400 mt-4
                  hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200
                  active:scale-95 transition-all duration-150"
                                title="Inverser"
                            >
                                <ArrowRightLeft className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                            <CurrencySelect
                                label="Vers"
                                value={to}
                                onChange={(v) => { setTo(v); if (v === from) setFrom(to); }}
                            />
                        </div>

                        {/* Result */}
                        {numAmount > 0 && (
                            <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-center">
                                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Résultat</p>
                                <p className="text-[22px] font-black text-emerald-400 tabular-nums leading-none">
                                    {formatConverted(converted)}
                                    <span className="text-[13px] font-semibold text-emerald-400/60 ml-1.5">
                                        {toCurrency.label}
                                    </span>
                                </p>
                                <p className="text-[11px] font-medium text-white/30 mt-1.5">
                                    {new Intl.NumberFormat('fr-FR').format(numAmount)} {fromCurrency.label} → {toCurrency.label}
                                </p>
                            </div>
                        )}

                        {/* Rates info */}
                        <p className="text-[10px] text-center text-slate-400 font-medium">
                            Taux indicatifs · Mis à jour périodiquement
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function CurrencySelect({
    label,
    value,
    onChange,
}: {
    label: string;
    value: CurrencyCode;
    onChange: (v: CurrencyCode) => void;
}) {
    const selected = CURRENCIES.find(c => c.code === value)!;
    return (
        <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value as CurrencyCode)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-3 pr-8
            text-[13px] font-semibold text-black appearance-none cursor-pointer
            focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition-all"
                >
                    {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>
                            {c.flag} {c.label} ({c.code})
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
        </div>
    );
}
