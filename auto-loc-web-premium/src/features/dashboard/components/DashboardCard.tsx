'use client';

import React, { useId } from 'react';
import type { LucideIcon } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Carte de base                                                              */
/* -------------------------------------------------------------------------- */

interface DashboardCardProps {
    title: string;
    description?: string;
    /** Contenu aligné à droite de l'en-tête (filtre, lien, boutons…). */
    action?: React.ReactNode;
    className?: string;
    bodyClassName?: string;
    children: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    description,
    action,
    className = '',
    bodyClassName = '',
    children,
}) => {
    const titleId = useId();

    return (
        <section
            aria-labelledby={titleId}
            className={`flex min-w-0 flex-col rounded-3xl border border-brand-main/10 bg-white ${className}`}
        >
            <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-6 pt-6 sm:px-7 sm:pt-7">
                <div className="min-w-0">
                    <h2 id={titleId} className="font-display text-xl font-normal tracking-tight text-brand-dark">
                        {title}
                    </h2>
                    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </header>
            <div className={`flex-1 px-6 pb-6 pt-5 sm:px-7 sm:pb-7 ${bodyClassName}`}>{children}</div>
        </section>
    );
};

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div aria-hidden="true" className={`animate-pulse rounded-lg bg-brand-main/[0.07] ${className}`} />
);

/* -------------------------------------------------------------------------- */
/* État vide                                                                  */
/* -------------------------------------------------------------------------- */

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    text: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, text, action }) => (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-main/15 px-6 py-10 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-champagne/40 text-brand-main">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="space-y-1">
            <p className="font-display text-base text-brand-dark">{title}</p>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-500">{text}</p>
        </div>
        {action}
    </div>
);