'use client';

import { Star, CheckCircle2, Calendar } from 'lucide-react';

interface ExistingReviewDisplayProps {
    review: {
        id: string;
        note: number;
        commentaire?: string | null;
        creeLe: string;
    };
    title: string;
    subtitle?: string;
}

export function ExistingReviewDisplay({ review, title, subtitle }: ExistingReviewDisplayProps) {
    return (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-50/30 border border-emerald-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-emerald-200 bg-emerald-100/40">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-[10.5px] font-black uppercase tracking-[0.14em] text-emerald-700">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-[10px] text-emerald-600 mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-4">
                {/* Rating */}
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                        Votre note
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${
                                        star <= review.note
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-slate-200 fill-slate-100'
                                    }`}
                                    strokeWidth={1.5}
                                />
                            ))}
                        </div>
                        <span className="text-[15px] font-black text-emerald-700 tabular-nums ml-1">
                            {review.note}<span className="text-[11px] text-emerald-500">/5</span>
                        </span>
                    </div>
                </div>

                {/* Comment */}
                {review.commentaire && (
                    <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                            Votre commentaire
                        </span>
                        <div className="rounded-xl bg-white border border-emerald-200 px-4 py-3">
                            <p className="text-[13px] text-slate-700 leading-relaxed">
                                {review.commentaire}
                            </p>
                        </div>
                    </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-[11px] text-emerald-600 pt-2 border-t border-emerald-200">
                    <Calendar className="w-3 h-3" strokeWidth={2} />
                    <span>
                        Publié le {new Date(review.creeLe).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>

                {/* Success message */}
                <div className="flex items-start gap-2 rounded-xl bg-emerald-100 border border-emerald-200 px-3.5 py-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-[11px] font-medium text-emerald-700 leading-relaxed">
                        Votre avis a été publié avec succès. Il aide la communauté AutoLoc à faire des choix éclairés.
                    </p>
                </div>
            </div>
        </div>
    );
}
