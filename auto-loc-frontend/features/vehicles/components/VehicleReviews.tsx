import React from 'react';
import { Star, MessageSquareQuote } from 'lucide-react';
import type { ReviewsResponse } from '@/lib/nestjs/reviews';

interface VehicleReviewsProps {
    reviewsData: ReviewsResponse | null;
}

export function VehicleReviews({ reviewsData }: VehicleReviewsProps) {
    if (!reviewsData || reviewsData.avis.length === 0) {
        return null;
    }

    const { avis, stats } = reviewsData;

    return (
        <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Avis sur le propriétaire
                        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 text-sm font-bold px-2.5 py-0.5 rounded-full">
                            {stats.total}
                        </span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= Math.round(stats.average)
                                            ? 'text-emerald-500 fill-emerald-500'
                                            : 'text-slate-200 fill-slate-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                            {stats.average.toFixed(1)} <span className="text-slate-400 font-medium">/ 5</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {avis.slice(0, 4).map((review) => (
                    <div
                        key={review.id}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50 flex flex-col justify-between gap-4"
                    >
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                                        <span className="text-emerald-700 font-bold text-sm">
                                            {review.auteur.prenom[0]}
                                            {review.auteur.nom?.[0] ?? ''}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 leading-none">
                                            {review.auteur.prenom} {review.auteur.nom}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(review.creeLe).toLocaleDateString('fr-FR', {
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-100">
                                    <Star className="w-3 h-3 text-emerald-500 fill-emerald-500 mr-1" />
                                    <span className="text-xs font-bold text-slate-700">{review.note}</span>
                                </div>
                            </div>

                            {review.commentaire ? (
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    "{review.commentaire}"
                                </p>
                            ) : (
                                <p className="text-sm text-slate-400 italic">
                                    Aucun commentaire laissé.
                                </p>
                            )}
                        </div>

                        {review.reservation?.vehicule && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 pt-3 border-t border-slate-200/60 mt-2">
                                <MessageSquareQuote className="w-3.5 h-3.5" />
                                À propos de la {review.reservation.vehicule.marque} {review.reservation.vehicule.modele}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {stats.total > 4 && (
                 <button className="w-full py-3.5 rounded-xl border-2 border-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                     Voir les {stats.total} avis
                 </button>
            )}
        </div>
    );
}
