'use client';

import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { requestWithdrawal } from '@/lib/nestjs/wallet';

interface WithdrawalFormProps {
    soldeDisponible: string;
}

const QUICK_PERCENTS = [25, 50, 75, 100] as const;

export function WithdrawalForm({ soldeDisponible }: WithdrawalFormProps) {
    const solde = Math.floor(Number(soldeDisponible));
    const [montant, setMontant] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const amount = Number(montant);
    const isValid = amount >= 500 && amount <= solde;

    function applyPercent(pct: typeof QUICK_PERCENTS[number]) {
        const val = Math.floor(solde * pct / 100);
        setMontant(val.toString());
        setStatus('idle');
        setErrorMsg('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isValid) return;
        setStatus('loading');
        setErrorMsg('');
        try {
            await requestWithdrawal(amount);
            setStatus('success');
            setMontant('');
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <div id="withdraw" className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
                        <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-400">Retrait</h3>
                </div>
                <div className="px-5 py-8 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-[14px] font-black text-slate-900">Demande envoyée</p>
                        <p className="text-[12px] text-slate-400 mt-1">
                            Votre retrait est en cours de traitement. Les fonds seront versés sous 24–48 h.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="mt-2 text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                        Faire un autre retrait
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div id="withdraw" className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </div>
                <h3 className="text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-400">Retrait</h3>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                {/* Solde disponible */}
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[11.5px] font-semibold text-emerald-700">Solde disponible</span>
                    <span className="text-[14px] font-black text-emerald-700 tabular-nums">
                        {solde.toLocaleString('fr-FR')} FCFA
                    </span>
                </div>

                {/* Quick % buttons */}
                <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">Sélection rapide</p>
                    <div className="grid grid-cols-4 gap-2">
                        {QUICK_PERCENTS.map((pct) => (
                            <button
                                key={pct}
                                type="button"
                                onClick={() => applyPercent(pct)}
                                disabled={solde === 0}
                                className="py-2 rounded-xl border border-slate-200 bg-slate-50 text-[12px] font-bold text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {pct === 100 ? 'Tout' : `${pct}%`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amount input */}
                <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">
                        Montant (FCFA)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min={500}
                            max={solde}
                            step={100}
                            value={montant}
                            onChange={(e) => {
                                setMontant(e.target.value);
                                setStatus('idle');
                                setErrorMsg('');
                            }}
                            placeholder="ex : 25 000"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-bold text-slate-900 placeholder-slate-300 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none">
                            FCFA
                        </span>
                    </div>

                    {/* Inline hints */}
                    {montant && amount < 500 && (
                        <p className="mt-1.5 text-[11px] font-medium text-red-500">Montant minimum : 500 FCFA</p>
                    )}
                    {montant && amount > solde && solde > 0 && (
                        <p className="mt-1.5 text-[11px] font-medium text-red-500">Montant supérieur au solde disponible</p>
                    )}
                    {solde === 0 && (
                        <p className="mt-1.5 text-[11px] font-medium text-slate-400">Aucun solde disponible pour le moment</p>
                    )}
                </div>

                {/* Error */}
                {status === 'error' && errorMsg && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" strokeWidth={2} />
                        <p className="text-[12px] font-medium text-red-600">{errorMsg}</p>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!isValid || status === 'loading'}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-[13px] font-bold text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                    {status === 'loading' ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                            Traitement…
                        </>
                    ) : (
                        <>
                            <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                            Demander le retrait
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
