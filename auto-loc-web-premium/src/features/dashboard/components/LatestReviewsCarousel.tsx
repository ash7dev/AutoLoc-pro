'use client';

import React, { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageSquareText, Star } from 'lucide-react';
import { DashboardCard, EmptyState, Skeleton } from './DashboardCard';
import { decimal1, formatShortDate, initialsOf, toNumber, type Amount } from './dashboardUtils';

interface ReviewAuthor {
  prenom?: string;
  nom?: string;
}

/**
 * Champs attendus pour chaque avis de GET /reviews/user/:id (`reviews.data`).
 * L'auteur est lu dans `auteur` ou `locataire`.
 */
export interface OwnerReview {
  id?: string;
  note?: Amount;
  commentaire?: string | null;
  createdAt?: string;
  auteur?: ReviewAuthor;
  locataire?: ReviewAuthor;
}

interface LatestReviewsCarouselProps {
  reviews?: OwnerReview[];
  isLoading?: boolean;
}

const STAR_COLOR = '#C79A3B';

const Stars: React.FC<{ value: number }> = ({ value }) => (
  <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} sur 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className="h-4 w-4"
        style={n <= Math.round(value) ? { fill: STAR_COLOR, color: STAR_COLOR } : undefined}
        color={n <= Math.round(value) ? STAR_COLOR : '#CBD5E1'}
        aria-hidden="true"
      />
    ))}
  </span>
);

export const LatestReviewsCarousel: React.FC<LatestReviewsCarouselProps> = ({
  reviews,
  isLoading = false,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const items = reviews ?? [];
  const notes = items.map((r) => toNumber(r.note)).filter((n) => n > 0);
  const average = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const arrows = items.length > 1 && (
    <div className="hidden items-center gap-2 sm:flex">
      {([-1, 1] as const).map((dir) => {
        const Icon = dir === -1 ? ChevronLeft : ChevronRight;
        return (
          <button
            key={dir}
            type="button"
            onClick={() => scrollBy(dir)}
            aria-label={dir === -1 ? 'Avis précédents' : 'Avis suivants'}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-brand-main/15 text-brand-main transition-colors hover:bg-brand-main/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );

  return (
    <DashboardCard
      title="Avis récents"
      description={
        notes.length
          ? `${decimal1.format(average)} sur 5 en moyenne, ${notes.length} avis`
          : 'Ce que vos locataires disent de leur expérience'
      }
      action={arrows || undefined}
    >
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 w-[19rem] shrink-0" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="Pas encore d’avis"
          text="Les évaluations de vos locataires apparaîtront ici après une location terminée."
        />
      ) : (
        <div
          ref={scrollerRef}
          role="region"
          aria-roledescription="carrousel"
          aria-label="Avis des locataires"
          tabIndex={0}
          className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-1 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main sm:-mx-7 sm:scroll-px-7 sm:px-7 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((r, i) => {
            const author = r.auteur ?? r.locataire;
            const name = [author?.prenom, author?.nom ? `${author.nom.charAt(0)}.` : ''].filter(Boolean).join(' ');
            const note = toNumber(r.note);
            const date = formatShortDate(r.createdAt);

            return (
              <article
                key={r.id ?? i}
                className="flex w-[19rem] shrink-0 snap-start flex-col justify-between gap-5 rounded-2xl border border-brand-main/10 bg-white p-5 sm:w-[21rem]"
              >
                <div className="space-y-3">
                  {note > 0 && <Stars value={note} />}
                  <p className="line-clamp-4 font-display text-base leading-relaxed text-brand-dark">
                    {r.commentaire?.trim() || 'Aucun commentaire laissé.'}
                  </p>
                </div>

                <footer className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-main text-sm font-semibold text-champagne"
                  >
                    {initialsOf(author?.prenom, author?.nom)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-dark">{name || 'Locataire AutoLoc'}</p>
                    {date && <p className="text-xs text-slate-500">{date}</p>}
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
};