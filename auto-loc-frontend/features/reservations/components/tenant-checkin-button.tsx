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
    const [verifiedPhotos, setVerifiedPhotos] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* Déjà confirmé (depuis DB ou après action réussie) */
    if (alreadyConfirmed || confirmed) {
        return (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                </div>
                <div>
                    <p className="text-[12.5px] font-black text-emerald-900 leading-tight">Vous avez confirmé le check-in</p>
                    <p className="text-[11.5px] text-emerald-700/80 mt-1 leading-relaxed font-medium">
                        {ownerConfirmed || confirmed
                            ? 'Les deux parties ont confirmé — la location est officiellement en cours.'
                            : 'En attente de confirmation finale du système.'}
                    </p>
                </div>
            </div>
        );
    }

    const handleConfirm = async () => {
        if (!ownerConfirmed) return;
        if (!verifiedPhotos) {
            setError("Veuillez confirmer que vous avez vérifié l'état du véhicule.");
            return;
        }
        setError(null);
        setLoading(true);
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
        <div className="space-y-3">
            {!ownerConfirmed && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200/60 shadow-sm animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5" strokeWidth={2.5} />
                    <p className="text-[11.5px] font-bold text-slate-500 leading-tight">
                        Le propriétaire doit certifier l'état du véhicule avant que vous ne puissiez valider le départ.
                    </p>
                </div>
            )}

            {!confirming ? (
                <button
                    type="button"
                    onClick={() => ownerConfirmed && setConfirming(true)}
                    disabled={!ownerConfirmed}
                    className={`flex items-center gap-3 rounded-2xl px-5 py-4 border text-left w-full sm:w-auto transition-all duration-300 group
                        ${ownerConfirmed 
                            ? 'bg-slate-900 text-white border-slate-900 hover:bg-emerald-600 hover:border-emerald-600 shadow-md hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed grayscale-[0.5]'}`}
                >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                        ${ownerConfirmed ? 'bg-white/10 group-hover:bg-white/20' : 'bg-slate-200 opacity-50'}`}>
                        <LogIn className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-black leading-none tracking-tight">Confirmer le trajet</span>
                        <span className={`text-[11px] font-bold leading-none tracking-wide uppercase ${ownerConfirmed ? 'text-white/40' : 'text-slate-400/50'}`}>
                            {ownerConfirmed ? 'Prendre possession du véhicule' : 'En attente du propriétaire'}
                        </span>
                    </div>
                </button>
            ) : (
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[14px] font-black text-slate-900 leading-tight">
                                Confirmation de départ
                            </p>
                            <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                                Le propriétaire a déjà certifié l'état. Vérifiez bien le véhicule avant de confirmer.
                            </p>
                        </div>
                    </div>

                    {/* Step: Verify photos */}
                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors group">
                        <div className="relative flex items-center mt-0.5">
                            <input
                                type="checkbox"
                                checked={verifiedPhotos}
                                onChange={(e) => setVerifiedPhotos(e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:bg-emerald-500 checked:border-emerald-500 transition-all duration-200 shadow-sm"
                            />
                            <CheckCircle2 className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5 top-0.5" strokeWidth={3} />
                        </div>
                        <span className="text-[12.5px] font-bold text-slate-700 leading-tight group-hover:text-slate-900">
                            J'ai inspecté le véhicule et vérifié les photos d'état des lieux soumises par le propriétaire.
                        </span>
                    </label>

                    <div className="flex items-center gap-2 justify-end pt-1">
                        <button
                            type="button"
                            onClick={() => { setConfirming(false); setVerifiedPhotos(false); }}
                            disabled={loading}
                            className="px-4 py-2 rounded-xl text-[12.5px] font-black text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={loading || !verifiedPhotos}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[12.5px] font-black bg-slate-900 hover:bg-emerald-600 text-white shadow-md transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
                        >
                            {loading
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <LogIn className="w-4 h-4" strokeWidth={2.5} />
                            }
                            Valider la prise en charge
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
