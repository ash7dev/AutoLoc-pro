'use client';

/* ════════════════════════════════════════════════════════════════
   VehicleReviews — 2026 Verified Tenant Reviews
════════════════════════════════════════════════════════════════ */

import React from 'react';
import { Star, MessageSquareQuote, ShieldCheck } from 'lucide-react';
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
    <div className="mt-12 space-y-6 pt-6 border-t border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-[22px] font-black text-slate-900 font-brand tracking-tight flex items-center gap-2.5">
            Avis des locataires
            <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full">
              {stats.total}
            </span>
          </h3>
          <p className="text-[13px] text-slate-500 font-medium mt-0.5">
            Retours d&apos;expérience certifiés par AutoLoc Sénégal
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl self-start sm:self-auto">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(stats.average)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200 fill-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[15px] font-black text-slate-900 tabular-nums">
            {stats.average.toFixed(1)} <span className="text-[12px] font-semibold text-slate-400">/ 5</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {avis.slice(0, 4).map((review) => (
          <div
            key={review.id}
            className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between gap-4 hover:border-slate-300 transition-all shadow-2xs"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-xs font-black text-sm">
                    {review.auteur.prenom[0]}
                    {review.auteur.nom?.[0] ?? ''}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[14px] font-extrabold text-slate-900 leading-none font-brand">
                        {review.auteur.prenom} {review.auteur.nom}
                      </p>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <p className="text-[11.5px] text-slate-400 font-semibold mt-1">
                      {new Date(review.creeLe).toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-slate-200/80">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-[12px] font-black text-slate-900 tabular-nums">{review.note}</span>
                </div>
              </div>

              {review.commentaire ? (
                <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                  &ldquo;{review.commentaire}&rdquo;
                </p>
              ) : (
                <p className="text-[12.5px] text-slate-400 italic font-medium">
                  Aucun commentaire textuel laissé.
                </p>
              )}
            </div>

            {review.reservation?.vehicule && (
              <div className="flex items-center gap-2 text-[11.5px] font-bold text-slate-400 pt-3 border-t border-slate-200/60 mt-1">
                <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600" />
                <span>À propos de la {review.reservation.vehicule.marque} {review.reservation.vehicule.modele}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {stats.total > 4 && (
        <button className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-[14px] font-extrabold text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs">
          Voir les {stats.total} avis certifiés
        </button>
      )}
    </div>
  );
}
