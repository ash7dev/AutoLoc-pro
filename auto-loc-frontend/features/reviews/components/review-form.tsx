'use client';

import { useState } from 'react';
import { Star, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { createReview } from '@/lib/nestjs/reviews';

interface ReviewFormProps {
    reservationId: string;
}

const LABELS: Record<number, string> = {
    1: 'Mauvais',
    2: 'Passable',
    3: 'Bien',
    4: 'Très bien',
    5: 'Excellent',
};

export function ReviewForm({ reservationId }: ReviewFormProps) {
    const [note, setNote] = useState(0);
    const [hover, setHover] = useState(0);
    const [commentaire, setCommentaire] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (note === 0) return;
        setStatus('loading');
        setErrorMsg('');
        try {
            await createReview({
                reservationId,
                note,
                commentaire: commentaire.trim() || undefined,
            });
            setStatus('success');
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50 text-amber-500">
                        <Star className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-400">Votre avis</h3>
                </div>
                <div className="px-5 py-8 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-[14px] font-black text-slate-900">Merci pour votre avis !</p>
                        <p className="text-[12px] text-slate-400 mt-1">
                            Votre retour aide la communauté AutoLoc à choisir en confiance.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const displayed = hover || note;

    return (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50 text-amber-500">
                    <Star className="w-3.5 h-3.5" strokeWidth={1.75} />
                </div>
                <h3 className="text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-400">Votre avis</h3>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                {/* Star rating */}
                <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">Note globale</p>
                    <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setNote(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                                className="focus:outline-none"
                            >
                                <Star
                                    className={`w-8 h-8 transition-all duration-100 ${
                                        star <= displayed
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-slate-200 fill-slate-100'
                                    }`}
                                    strokeWidth={1.5}
                                />
                            </button>
                        ))}
                        {displayed > 0 && (
                            <span className="ml-2 text-[12px] font-bold text-slate-500">
                                {LABELS[displayed]}
                            </span>
                        )}
                    </div>
                    {note === 0 && status === 'error' && (
                        <p className="mt-1.5 text-[11px] font-medium text-red-500">Veuillez sélectionner une note</p>
                    )}
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">
                        Commentaire <span className="normal-case font-normal">(facultatif)</span>
                    </label>
                    <textarea
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="Décrivez votre expérience avec ce véhicule…"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-800 placeholder-slate-300 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
                    />
                    <p className="mt-1 text-right text-[10px] text-slate-300 tabular-nums">
                        {commentaire.length}/500
                    </p>
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
                    disabled={note === 0 || status === 'loading'}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-[13px] font-bold text-white shadow-sm shadow-amber-400/20 hover:bg-amber-500 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                    {status === 'loading' ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                            Envoi…
                        </>
                    ) : (
                        <>
                            <Star className="w-4 h-4" strokeWidth={2.5} />
                            Publier mon avis
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
