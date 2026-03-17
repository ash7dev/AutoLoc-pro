'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';
import { translateError } from '@/lib/utils/api-error-fr';

interface Props {
    reservationId: string;
    /** Déjà confirmé par le locataire (protège contre le double clic) */
    alreadyConfirmed: boolean;
    /** Propriétaire a déjà confirmé (pour l'info contextuelle) */
    ownerConfirmed: boolean;
}

export function TenantCheckinButton({ reservationId, alreadyConfirmed, ownerConfirmed }: Props) {
    const router = useRouter();
    const { authFetch } = useAuthFetch();
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* Déjà confirmé (depuis DB ou après action réussie) */
    if (alreadyConfirmed || confirmed) {
        return (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
                </div>
                <div>
                    <p className="text-[12.5px] font-bold text-emerald-800">Vous avez confirmé le check-in</p>
                    <p className="text-[11.5px] text-emerald-700 mt-0.5 leading-relaxed">
                        {ownerConfirmed || confirmed
                            ? 'Les deux parties ont confirmé — la location est maintenant en cours.'
                            : 'En attente de confirmation du propriétaire pour démarrer la location.'}
                    </p>
                </div>
            </div>
        );
    }

    const handleConfirm = async () => {
        setError(null);
        setLoading(true);
        setConfirming(false);
        try {
            await authFetch(`/reservations/${reservationId}/checkin?role=LOCATAIRE`, { method: 'PATCH' });
            setConfirmed(true);
            router.refresh();
        } catch (err) {
            setError(translateError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            {/* Contexte : proprio déjà confirmé */}
            {ownerConfirmed && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" strokeWidth={2} />
                    <p className="text-[12px] font-semibold text-blue-700">
                        Le propriétaire a déjà confirmé — confirmez à votre tour pour démarrer la location.
                    </p>
                </div>
            )}

            {!confirming ? (
                <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 border text-left w-full sm:w-auto
                        bg-slate-900 text-white border-slate-900
                        hover:bg-emerald-500 hover:border-emerald-500
                        shadow-sm hover:shadow-md hover:shadow-emerald-500/20
                        hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                    <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                        <LogIn className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-bold leading-none">Confirmer le check-in</span>
                        <span className="text-[11px] font-medium leading-none text-white/50">
                            Confirmez la remise des clés
                        </span>
                    </div>
                </button>
            ) : (
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                            <LogIn className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />
                        </div>
                        <p className="text-[13px] font-semibold text-slate-700 leading-tight">
                            Confirmer la remise des clés — êtes-vous sûr ?
                        </p>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                        <button
                            type="button"
                            onClick={() => setConfirming(false)}
                            disabled={loading}
                            className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-bold bg-slate-900 hover:bg-emerald-500 text-white shadow-sm transition-all disabled:opacity-40"
                        >
                            {loading
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                            }
                            Confirmer le check-in
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" strokeWidth={2} />
                    <p className="text-[12px] font-semibold text-red-600">{error}</p>
                </div>
            )}
        </div>
    );
}
