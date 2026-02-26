'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Testimonials data ────────────────────────────────────────────────────────
const TESTIMONIALS = [
    {
        id: 1,
        name: 'Mamadou Diallo',
        role: 'Entrepreneur',
        city: 'Dakar',
        rating: 5,
        comment:
            "Service incroyable ! J'ai trouvé un SUV vérifié en 5 minutes. Le propriétaire était ponctuel et très pro. Je ne loue plus que sur AutoLoc.",
        avatar: 'MD',
    },
    {
        id: 2,
        name: 'Aïssatou Ndiaye',
        role: 'Consultante',
        city: 'Thiès',
        rating: 5,
        comment:
            'Première location, zéro stress. L\'application est fluide, le véhicule était nickel. Je recommande à 100% !',
        avatar: 'AN',
    },
    {
        id: 3,
        name: 'Ousmane Sow',
        role: 'Ingénieur',
        city: 'Dakar',
        rating: 5,
        comment:
            'J\'ai loué une berline pour un mariage. Véhicule impeccable, prix juste, et le support m\'a aidé à chaque étape. Bravo AutoLoc !',
        avatar: 'OS',
    },
    {
        id: 4,
        name: 'Fatou Sarr',
        role: 'Médecin',
        city: 'Saint-Louis',
        rating: 4,
        comment:
            'Très pratique pour mes déplacements professionnels. Large choix de véhicules et des propriétaires fiables. Je suis fidèle.',
        avatar: 'FS',
    },
    {
        id: 5,
        name: 'Ibrahima Ba',
        role: 'Photographe',
        city: 'Dakar',
        rating: 5,
        comment:
            'J\'avais besoin d\'un pick-up pour un shooting en brousse. Trouvé en 10 minutes, prix négocié directement. AutoLoc, c\'est le futur.',
        avatar: 'IB',
    },
];

// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        'h-3.5 w-3.5',
                        i < rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-white/10 text-white/10',
                    )}
                    strokeWidth={0}
                />
            ))}
        </div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function TestimonialsSection(): React.ReactElement {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 },
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const updateScrollButtons = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateScrollButtons, { passive: true });
        updateScrollButtons();
        return () => el.removeEventListener('scroll', updateScrollButtons);
    }, [updateScrollButtons]);

    function scroll(direction: 'left' | 'right') {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = 380;
        el.scrollBy({
            left: direction === 'left' ? -cardWidth : cardWidth,
            behavior: 'smooth',
        });
    }

    return (
        <section
            ref={sectionRef}
            className="px-4 py-10 lg:px-8 lg:py-14 overflow-hidden"
            aria-labelledby="testimonials-heading"
        >
            <div className="mx-auto max-w-7xl">
                {/* ── Header ── */}
                <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-1.5 mb-5">
                            <Star className="h-3 w-3 fill-emerald-400 text-emerald-400" strokeWidth={0} />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                                Témoignages
                            </span>
                        </div>
                        <h2
                            id="testimonials-heading"
                            className="text-4xl font-black tracking-tight text-black leading-tight lg:text-5xl"
                        >
                            Ils nous font{' '}
                            <span className="text-emerald-400">confiance</span>
                        </h2>
                        <p className="mt-4 max-w-lg text-[15px] font-medium leading-relaxed text-black/40">
                            Des milliers de locataires satisfaits partout au Sénégal.
                            Découvrez leurs retours.
                        </p>
                    </div>

                    {/* Navigation arrows */}
                    <div className="flex items-center gap-2 self-start lg:self-auto">
                        <button
                            type="button"
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={cn(
                                'flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200',
                                canScrollLeft
                                    ? 'border-slate-200 bg-white text-black hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                                    : 'border-slate-100 bg-slate-50 text-black/20 cursor-not-allowed',
                            )}
                            aria-label="Précédent"
                        >
                            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={cn(
                                'flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200',
                                canScrollRight
                                    ? 'border-slate-200 bg-white text-black hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                                    : 'border-slate-100 bg-slate-50 text-black/20 cursor-not-allowed',
                            )}
                            aria-label="Suivant"
                        >
                            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* ── Carousel ── */}
                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory -mx-4 px-4 lg:-mx-0 lg:px-0"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {TESTIMONIALS.map((t, i) => (
                        <div
                            key={t.id}
                            className={cn(
                                'flex-shrink-0 w-[340px] lg:w-[380px] snap-start',
                                'relative rounded-2xl bg-black border border-white/10',
                                'p-7 lg:p-8',
                                'transition-all duration-700 ease-out',
                                'hover:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-400/5',
                                isVisible
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-8',
                            )}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            {/* Quote icon */}
                            <Quote
                                className="absolute top-6 right-6 h-8 w-8 text-emerald-400/10"
                                strokeWidth={1.5}
                            />

                            {/* Stars */}
                            <StarRating rating={t.rating} />

                            {/* Comment */}
                            <p className="mt-5 text-[14px] font-medium leading-relaxed text-white/60">
                                &ldquo;{t.comment}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="mt-6 flex items-center gap-3 pt-5 border-t border-white/10">
                                {/* Avatar initials */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                                    <span className="text-[13px] font-bold text-emerald-400">
                                        {t.avatar}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-white">
                                        {t.name}
                                    </p>
                                    <p className="text-[12px] font-medium text-white/35">
                                        {t.role} · {t.city}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
