"use client";

import { Star, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewsResponse, Review } from "@/lib/nestjs/reviews";

// ── Component ──────────────────────────────────────────────────────────────────

interface ReviewsListProps {
    data: ReviewsResponse | null;
}

export function ReviewsList({ data }: ReviewsListProps) {
    if (!data || data.avis.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-card p-12 text-center">
                <Star className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">Aucun avis pour le moment</p>
                <p className="text-xs text-muted-foreground">
                    Les avis apparaîtront ici une fois qu&apos;un locataire aura terminé une location.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── Stats Summary ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label="Note moyenne"
                    value={data.stats.average.toFixed(1)}
                    suffix="/5"
                    icon={<StarsDisplay rating={data.stats.average} />}
                />
                <StatCard
                    label="Total avis"
                    value={String(data.stats.total)}
                    suffix="avis"
                    icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
                />
                <StatCard
                    label="Note 5 étoiles"
                    value={String(data.avis.filter((a) => a.note === 5).length)}
                    suffix={`/ ${data.stats.total}`}
                    icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                />
            </div>

            {/* ── Reviews List ─────────────────────────────────────────────── */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-card divide-y divide-[hsl(var(--border))]">
                {data.avis.map((review) => (
                    <ReviewRow key={review.id} review={review} />
                ))}
            </div>
        </div>
    );
}

// ── Stat Card ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, suffix, icon }: {
    label: string;
    value: string;
    suffix: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-card p-5">
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold">
                {value} <span className="text-sm font-normal text-muted-foreground">{suffix}</span>
            </p>
        </div>
    );
}

// ── Review Row ──────────────────────────────────────────────────────────────────

function ReviewRow({ review }: { review: Review }) {
    const date = new Date(review.creeLe).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
                {/* Author + Stars */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 shrink-0">
                        <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">{review.auteur.prenom} {review.auteur.nom}</p>
                        <div className="flex items-center gap-2">
                            <StarsDisplay rating={review.note} size="sm" />
                            <span className="text-xs text-muted-foreground">· {date}</span>
                        </div>
                    </div>
                </div>

                {/* Vehicle */}
                {review.reservation?.vehicule && (
                    <span className="text-xs text-muted-foreground shrink-0">
                        {review.reservation.vehicule.marque} {review.reservation.vehicule.modele}
                    </span>
                )}
            </div>

            {/* Comment */}
            {review.commentaire && (
                <p className="mt-2 ml-12 text-sm text-muted-foreground leading-relaxed">
                    {review.commentaire}
                </p>
            )}
        </div>
    );
}

// ── Stars Display ───────────────────────────────────────────────────────────────

function StarsDisplay({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
    const stars = [1, 2, 3, 4, 5];
    return (
        <div className="flex items-center gap-0.5">
            {stars.map((s) => (
                <Star
                    key={s}
                    className={cn(
                        size === "sm" ? "w-3 h-3" : "w-4 h-4",
                        s <= Math.round(rating)
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-200 fill-slate-200",
                    )}
                />
            ))}
        </div>
    );
}
