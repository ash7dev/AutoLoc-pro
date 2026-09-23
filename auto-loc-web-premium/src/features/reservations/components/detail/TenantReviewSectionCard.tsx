'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, Lock, Sparkles, Send } from 'lucide-react';
import { fetchApi } from '@/lib/config';

interface TenantReviewSectionCardProps {
  reservationId: string;
  bookingStatus: string;
  existingReview?: {
    note: number;
    commentaire?: string;
    createdAt?: string;
  };
  onReviewSubmitted?: () => void;
}

const REVIEW_TAGS = [
  'Véhicule propre',
  'Hôte ponctuel',
  'Conduite agréable',
  'Conforme à l\'annonce',
  'Communication fluide',
];

export const TenantReviewSectionCard: React.FC<TenantReviewSectionCardProps> = ({
  reservationId,
  bookingStatus,
  existingReview,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(existingReview?.note || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(existingReview?.commentaire || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(Boolean(existingReview));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCompleted = bookingStatus === 'TERMINEE';
  const hasReview = Boolean(existingReview) || submitted;
  const isLocked = !isCompleted && !hasReview;

  // Masquer totalement la carte d'avis tant que la réservation n'est pas terminée (sauf si un avis existe déjà)
  if (!isCompleted && !hasReview) {
    return null;
  }

  const toggleTag = (tag: string) => {
    if (submitted || isLocked) return;
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    if (!rating) {
      setErrorMsg('Veuillez sélectionner une note de 1 à 5 étoiles.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const fullComment = selectedTags.length > 0
        ? `[${selectedTags.join(' • ')}] ${comment.trim()}`
        : comment.trim();

      await fetchApi('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          reservationId,
          note: rating,
          commentaire: fullComment || undefined,
        }),
      });

      setSubmitted(true);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
        'Impossible d\'enregistrer votre avis. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={`bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm transition-all duration-200 ${
        isLocked ? 'bg-slate-50/50' : ''
      }`}
      aria-label="Avis et évaluation du véhicule"
    >
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
              isLocked
                ? 'bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-amber-50 border-amber-200/60 text-amber-600'
            }`}
          >
            {isLocked ? (
              <Lock className="w-5 h-5 text-slate-400" />
            ) : (
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            )}
          </div>
          <div>
            <h2
              className="font-fraunces text-xl font-normal text-[#041912] tracking-tight"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              Avis & Évaluation
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {submitted
                ? 'Votre avis a été enregistré pour ce trajet'
                : isLocked
                ? 'Réservé aux trajets terminés'
                : 'Partagez votre expérience avec cet hôte'}
            </p>
          </div>
        </div>

        {submitted ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Avis publié
          </span>
        ) : isLocked ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Verrouillé
          </span>
        ) : null}
      </div>

      {isLocked ? (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">
              Évaluation disponible après le Check-out
            </p>
            <p className="text-amber-800/90">
              L'avis et la note sur 5 étoiles se débloqueront automatiquement dès que le voyage sera marqué comme <strong>Terminé</strong> par l'hôte.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Étoiles */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Note globale
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    disabled={submitted}
                    onMouseEnter={() => !submitted && setHoverRating(star)}
                    onMouseLeave={() => !submitted && setHoverRating(0)}
                    onClick={() => !submitted && setRating(star)}
                    className={`p-1.5 rounded-xl transition-all ${
                      submitted
                        ? 'cursor-default'
                        : 'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400/50'
                    }`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        active
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-slate-300 fill-slate-100'
                      }`}
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="ml-2 text-sm font-semibold text-slate-700">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Tags d'appréciation */}
          {!submitted && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Points forts de l'expérience
              </label>
              <div className="flex flex-wrap gap-2">
                {REVIEW_TAGS.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        selected
                          ? 'bg-[#041912] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Commentaire texte */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Commentaire & Détails
            </label>
            {submitted ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700 leading-relaxed italic">
                {comment || 'Aucun commentaire rédigé.'}
              </div>
            ) : (
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Racontez comment s'est déroulée la prise en charge, la conduite et la remise des clés..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#041912]/20 focus:border-[#041912] text-sm text-slate-800 placeholder-slate-400 resize-none transition-all"
              />
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {errorMsg}
            </div>
          )}

          {!submitted && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#041912] text-white font-semibold text-sm hover:bg-[#072a1f] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isSubmitting ? (
                <span>Publication...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publier mon avis</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
};
