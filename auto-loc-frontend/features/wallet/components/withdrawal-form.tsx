'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { requestWithdrawalAction } from '@/features/wallet/actions/request-withdrawal';
import { cn } from '@/lib/utils';

type Methode = 'WAVE' | 'ORANGE_MONEY';

interface WithdrawalFormProps {
    soldeDisponible: string;
    soldeWave: string;
    soldeOrangeMoney: string;
}

const METHODS: { value: Methode; label: string; logo: string; color: string; border: string; bg: string; activeBorder: string; activeBg: string }[] = [
    {
        value: 'WAVE',
        label: 'Wave',
        logo: '/wavelogo.jpeg',
        color: 'text-blue-700',
        border: 'border-slate-200',
        bg: 'bg-slate-50',
        activeBorder: 'border-blue-400',
        activeBg: 'bg-blue-50',
    },
    {
        value: 'ORANGE_MONEY',
        label: 'Orange Money',
        logo: '/orangeMoneylogo.jpg',
        color: 'text-orange-700',
        border: 'border-slate-200',
        bg: 'bg-slate-50',
        activeBorder: 'border-orange-400',
        activeBg: 'bg-orange-50',
    },
];

const QUICK_PERCENTS = [25, 50, 75, 100] as const;

export function WithdrawalForm({ soldeDisponible, soldeWave, soldeOrangeMoney }: WithdrawalFormProps) {
    const solde = Math.floor(Number(soldeDisponible));
    const soldeWaveNum = Math.floor(Number(soldeWave));
    const soldeOMNum = Math.floor(Number(soldeOrangeMoney));
    const [methode, setMethode] = useState<Methode | null>(null);
    const [numero, setNumero] = useState('');
    const [montant, setMontant] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // Solde disponible selon la méthode sélectionnée
    const soldeMethode = methode === 'WAVE' ? soldeWaveNum : methode === 'ORANGE_MONEY' ? soldeOMNum : solde;

    const amount = Number(montant);
    const numeroClean = numero.replace(/\s/g, '');
    const numeroValid = /^[0-9]{9,12}$/.test(numeroClean);
    const isValid = methode !== null && numeroValid && amount >= 500 && amount <= soldeMethode;

    function applyPercent(pct: typeof QUICK_PERCENTS[number]) {
        setMontant(Math.floor(soldeMethode * pct / 100).toString());
        setStatus('idle');
        setErrorMsg('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isValid || !methode) return;
        setStatus('loading');
        setErrorMsg('');
        try {
            await requestWithdrawalAction({ montant: amount, methode, numeroDestinataire: numeroClean });
            setStatus('success');
            setMontant('');
            setNumero('');
            setMethode(null);
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <div id="withdraw" className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 sm:px-6 py-4 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 ring-1 ring-emerald-100">
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Retrait</h3>
                </div>
                <div className="px-6 py-10 sm:py-8 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-7 h-7 sm:w-6 sm:h-6 text-emerald-500" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-[16px] sm:text-[15px] font-black text-slate-900 tracking-tight">Demande envoyée</p>
                        <p className="text-[13px] sm:text-[12px] text-slate-500 font-medium mt-2 max-w-[280px] sm:max-w-[260px] mx-auto leading-relaxed">
                            Votre retrait est en cours de traitement. Les fonds seront versés sous 24–48 h.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="mt-2 text-[13px] sm:text-[12px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors px-4 py-2 rounded-lg hover:bg-emerald-50"
                    >
                        Faire un autre retrait
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div id="withdraw" className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 sm:px-6 py-4 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 ring-1 ring-emerald-100">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Retrait</h3>
            </div>

            <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 sm:py-4 space-y-5 sm:space-y-4">
                {/* Solde disponible */}
                <div className="flex items-center justify-between px-4 py-3 sm:px-3.5 sm:py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
                    <span className="text-[12px] sm:text-[11.5px] font-bold text-emerald-700">
                        {methode === 'WAVE' ? 'Solde Wave disponible' : methode === 'ORANGE_MONEY' ? 'Solde Orange Money disponible' : 'Solde disponible'}
                    </span>
                    <span className="text-[16px] sm:text-[14px] font-black text-emerald-700 tabular-nums tracking-tight">
                        {soldeMethode.toLocaleString('fr-FR')} FCFA
                    </span>
                </div>

                {/* Méthode */}
                <div>
                    <p className="text-[11px] sm:text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2.5 sm:mb-2">
                        Méthode de réception
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:gap-2">
                        {METHODS.map((m) => {
                            const active = methode === m.value;
                            return (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => { setMethode(m.value); setStatus('idle'); }}
                                    className={cn(
                                        'flex items-center gap-3 sm:gap-2.5 px-4 py-3.5 sm:px-3.5 sm:py-3 rounded-xl border text-left transition-all shadow-sm',
                                        active ? `${m.activeBorder} ${m.activeBg} ring-1 ${m.activeBorder}` : `${m.border} ${m.bg} hover:border-slate-300`,
                                    )}
                                >
                                    <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg overflow-hidden flex-shrink-0 relative">
                                        <Image
                                            src={m.logo}
                                            alt={m.label}
                                            width={28}
                                            height={28}
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className={cn('text-[14px] sm:text-[13px] font-bold', active ? m.color : 'text-slate-600')}>
                                        {m.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Numéro */}
                <div>
                    <label className="block text-[11px] sm:text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2.5 sm:mb-2">
                        {methode === 'WAVE' ? 'Numéro Wave' : methode === 'ORANGE_MONEY' ? 'Numéro Orange Money' : 'Numéro de réception'}
                    </label>
                    <input
                        type="tel"
                        inputMode="numeric"
                        value={numero}
                        onChange={(e) => { setNumero(e.target.value); setStatus('idle'); }}
                        placeholder="ex : 77 000 00 00"
                        className="w-full h-12 sm:h-11 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[16px] font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                    />
                    {numero && !numeroValid && (
                        <p className="mt-2 text-[12px] sm:text-[11px] font-bold text-red-600 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">!</span>
                            Numéro invalide (9 à 12 chiffres)
                        </p>
                    )}
                </div>

                {/* Montant */}
                <div>
                    <p className="text-[11px] sm:text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2.5 sm:mb-2">Sélection rapide</p>
                    <div className="grid grid-cols-4 gap-2.5 sm:gap-2 mb-4 sm:mb-3">
                        {QUICK_PERCENTS.map((pct) => (
                            <button
                                key={pct}
                                type="button"
                                onClick={() => applyPercent(pct)}
                                disabled={soldeMethode === 0}
                                className="py-2.5 sm:py-2 rounded-xl border border-slate-200 bg-white text-[13px] sm:text-[12px] font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                                {pct === 100 ? 'Tout' : `${pct}%`}
                            </button>
                        ))}
                    </div>

                    <label className="block text-[11px] sm:text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2.5 sm:mb-2">
                        Montant (FCFA)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min={500}
                            max={soldeMethode}
                            step={100}
                            value={montant}
                            onChange={(e) => { setMontant(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                            placeholder="ex : 25 000"
                            className="w-full h-12 sm:h-11 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[16px] font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] sm:text-[11px] font-bold text-slate-400 pointer-events-none">
                            FCFA
                        </span>
                    </div>
                    {montant && amount < 500 && (
                        <p className="mt-2 text-[12px] sm:text-[11px] font-bold text-red-600 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">!</span>
                            Montant minimum : 500 FCFA
                        </p>
                    )}
                    {montant && amount > soldeMethode && soldeMethode > 0 && (
                        <p className="mt-2 text-[12px] sm:text-[11px] font-bold text-red-600 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">!</span>
                            Montant supérieur au solde {methode === 'WAVE' ? 'Wave' : methode === 'ORANGE_MONEY' ? 'Orange Money' : ''} disponible
                        </p>
                    )}
                    {soldeMethode === 0 && methode && (
                        <p className="mt-2 text-[12px] sm:text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                            Aucun solde {methode === 'WAVE' ? 'Wave' : 'Orange Money'} disponible pour le moment
                        </p>
                    )}
                </div>

                {/* Error */}
                {status === 'error' && errorMsg && (
                    <div className="flex items-center gap-2.5 px-4 py-3 sm:px-3.5 sm:py-2.5 rounded-xl bg-red-50 border border-red-200 shadow-sm">
                        <AlertCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-red-500 flex-shrink-0" strokeWidth={2} />
                        <p className="text-[13px] sm:text-[12px] font-bold text-red-600">{errorMsg}</p>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!isValid || status === 'loading'}
                    className="w-full inline-flex items-center justify-center gap-2 h-12 sm:h-11 rounded-xl bg-slate-900 px-5 py-3 text-[14px] sm:text-[13px] font-black text-emerald-400 shadow-md shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                    {status === 'loading' ? (
                        <>
                            <Loader2 className="w-4.5 h-4.5 sm:w-4 sm:h-4 animate-spin" strokeWidth={2.5} />
                            Traitement…
                        </>
                    ) : (
                        <>
                            <ArrowUpRight className="w-4.5 h-4.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                            Demander le retrait
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
