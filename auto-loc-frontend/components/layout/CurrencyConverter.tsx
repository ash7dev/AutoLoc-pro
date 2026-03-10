'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowRightLeft, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CURRENCIES = [
    { code: 'XOF', label: 'CFA', flag: '🇸🇳', rate: 1 },
    { code: 'EUR', label: 'EUR', flag: '🇪🇺', rate: 0.00152 },
    { code: 'USD', label: 'USD', flag: '🇺🇸', rate: 0.00166 },
    { code: 'GBP', label: 'GBP', flag: '🇬🇧', rate: 0.00131 },
    { code: 'CAD', label: 'CAD', flag: '🇨🇦', rate: 0.00228 },
    { code: 'CHF', label: 'CHF', flag: '🇨🇭', rate: 0.00146 },
] as const;

type CurrencyCode = (typeof CURRENCIES)[number]['code'];

function formatConverted(amount: number): string {
    if (amount >= 1) return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(amount);
    return amount.toFixed(4);
}

export function CurrencyConverter() {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('10000');
    const [from, setFrom] = useState<CurrencyCode>('XOF');
    const [to, setTo] = useState<CurrencyCode>('EUR');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

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
            {/* ── Trigger ───────────────────────────────────────── */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={cn(
                    'flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-[12px] font-bold transition-all duration-200',
                    open
                        ? 'bg-black text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-black',
                )}
                title="Convertisseur de devise"
            >
                <span className="font-black tracking-tight">CFA</span>
            </button>

            {/* ── Dropdown ──────────────────────────────────────── */}
            {open && (
                <div className="absolute right-0 top-full mt-2.5
                    w-[calc(100vw-2rem)] sm:w-80 max-w-[320px]
                    rounded-2xl border border-slate-100 bg-white
                    shadow-2xl shadow-slate-300/50 z-[60]
                    animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100
                        bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.5} />
                            </div>
                            <div>
                                <span className="text-[13px] font-black text-black tracking-tight">Convertisseur</span>
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Taux indicatifs</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400
                                hover:text-black hover:bg-slate-100 transition-all"
                        >
                            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="p-4 space-y-3">
                        {/* Amount */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Montant</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="10 000"
                                    autoFocus
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 pr-16
                                        text-[15px] font-black text-black tabular-nums
                                        placeholder-slate-300 outline-none
                                        focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/15 transition-all"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                                    {fromCurrency.flag} {fromCurrency.label}
                                </span>
                            </div>
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
                                    active:scale-90 transition-all duration-150"
                                title="Inverser"
                            >
                                <ArrowRightLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                            <CurrencySelect
                                label="Vers"
                                value={to}
                                onChange={(v) => { setTo(v); if (v === from) setFrom(to); }}
                            />
                        </div>

                        {/* Result */}
                        {numAmount > 0 && (
                            <div className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-center
                                ring-1 ring-white/5">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">Résultat</p>
                                <p className="text-[24px] font-black text-emerald-400 tabular-nums leading-none">
                                    {formatConverted(converted)}
                                    <span className="text-[13px] font-bold text-emerald-400/50 ml-1.5">
                                        {toCurrency.label}
                                    </span>
                                </p>
                                <p className="text-[11px] font-medium text-white/25 mt-2">
                                    {new Intl.NumberFormat('fr-FR').format(numAmount)} {fromCurrency.flag} {fromCurrency.label}
                                    {' → '}
                                    {toCurrency.flag} {toCurrency.label}
                                </p>
                            </div>
                        )}
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
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value as CurrencyCode)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-3 pr-8
                        text-[13px] font-bold text-black appearance-none cursor-pointer
                        focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/15 transition-all"
                >
                    {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>
                            {c.flag} {c.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
        </div>
    );
}
