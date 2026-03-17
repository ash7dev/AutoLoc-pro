'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';
import { translateError } from '@/lib/utils/api-error-fr';

interface Props {
    reservationId: string;
}

export function TenantDisputeButton({ reservationId }: Props) {
    const router = useRouter();
    const { authFetch } = useAuthFetch();
    const [open, setOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const canSubmit = description.trim().length >= 10 && !loading;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setLoading(true);
        setError(null);
        try {
            await authFetch(`/reservations/${reservationId}/dispute`, {
                method: 'POST',
                body: { description: description.trim() },
            });
            setDone(true);
            setTimeout(() => { router.refresh(); }, 1800);
        } catch (err) {
            setError(translateError(err));
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3.5">
                <div className="w-7 h-7 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-600" strokeWidth={2} />
                </div>
                <div>
                    <p className="text-[12.5px] font-bold text-orange-800">Litige déclaré</p>
                    <p className="text-[11.5px] text-orange-700 mt-0.5 leading-relaxed">
                        Votre signalement a été transmis. La réservation est annulée et notre équipe vous contactera.
                    </p>
                </div>
            </div>
        );
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 border text-left w-full sm:w-auto
                    bg-white text-orange-600 border-orange-200
                    hover:bg-orange-500 hover:text-white hover:border-orange-500
                    shadow-sm hover:shadow-md hover:shadow-orange-500/15
                    hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
                <div className="w-7 h-7 rounded-lg bg-orange-50 group-hover:bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold leading-none">Signaler un problème</span>
                    <span className="text-[11px] font-medium leading-none text-orange-400">
                        Véhicule non conforme — je refuse la prise en charge
                    </span>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0 opacity-40" strokeWidth={2.5} />
            </button>
        );
    }

    return (
        <div className="rounded-2xl border border-orange-200 bg-white overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 bg-orange-50 border-b border-orange-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-orange-200 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-orange-500" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-[13px] font-black text-slate-900">Signaler un problème</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">La réservation sera annulée et un litige ouvert</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => { setOpen(false); setError(null); setDescription(''); }}
                    disabled={loading}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-all disabled:opacity-30"
                >
                    <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
            </div>

            <div className="p-5 space-y-4">
                {/* Warning */}
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <p className="text-[12px] font-medium text-amber-800 leading-relaxed">
                        Cette action est définitive. La réservation sera annulée et notre équipe examinera votre signalement pour le remboursement.
                    </p>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                        Décrivez le problème <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Ex : La voiture a un pare-choc abîmé non mentionné, kilométrage différent, modèle différent…"
                        rows={3}
                        disabled={loading}
                        className={cn(
                            'w-full rounded-xl border bg-white px-4 py-3 text-[13px] text-slate-800 placeholder-slate-400',
                            'focus:outline-none focus:ring-2 resize-none transition-all duration-200 disabled:opacity-50',
                            error
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-400/15'
                                : 'border-slate-200 focus:border-orange-400 focus:ring-orange-400/15',
                        )}
                    />
                    <div className="flex items-center justify-between">
                        <span className={cn(
                            'text-[10.5px] font-medium',
                            description.trim().length > 0 && description.trim().length < 10
                                ? 'text-red-500' : 'text-slate-300',
                        )}>
                            {description.trim().length > 0 && description.trim().length < 10 && 'Minimum 10 caractères'}
                        </span>
                        <span className="text-[10.5px] text-slate-300 tabular-nums">{description.length} car.</span>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" strokeWidth={2} />
                        <p className="text-[12px] font-semibold text-red-600">{error}</p>
                    </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                    <button
                        type="button"
                        onClick={() => { setOpen(false); setError(null); setDescription(''); }}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all',
                            canSubmit
                                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 hover:-translate-y-0.5'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed',
                        )}
                    >
                        {loading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                        }
                        {loading ? 'Envoi…' : 'Confirmer le signalement'}
                    </button>
                </div>
            </div>
        </div>
    );
}
