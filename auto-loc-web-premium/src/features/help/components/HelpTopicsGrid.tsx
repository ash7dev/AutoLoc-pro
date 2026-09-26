'use client';

import React from 'react';
import Link from 'next/link';
import {
  Car,
  Banknote,
  Shield,
  FileText,
  UserCheck,
  KeyRound,
  type LucideIcon,
} from 'lucide-react';

interface TopicItem {
  /** Doit correspondre à l'id de la catégorie dans la FAQ */
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface HelpTopicsGridProps {
  /** Nombre de questions par catégorie, indexé par id (facultatif) */
  counts?: Record<string, number>;
}

const DISPLAY_FONT = { fontFamily: 'var(--font-gloock, Georgia, "Times New Roman", serif)' };

const TOPICS: TopicItem[] = [
  {
    id: 'faq-location',
    icon: Car,
    title: 'Location de véhicules',
    description: 'Comment réserver, récupérer et restituer un véhicule sur AutoLoc.',
  },
  {
    id: 'faq-paiements',
    icon: Banknote,
    title: 'Paiements & Tarifs',
    description: 'Wave, Orange Money, frais de service et remboursements.',
  },
  {
    id: 'faq-assurance',
    icon: Shield,
    title: 'Assurance & Sécurité',
    description: 'Couverture tous risques, vérification KYC et protection.',
  },
  {
    id: 'faq-annulations',
    icon: FileText,
    title: 'Annulations & Litiges',
    description: 'Politique d’annulation, pénalités et résolution de conflits.',
  },
  {
    id: 'faq-compte',
    icon: UserCheck,
    title: 'Mon compte',
    description: 'Inscription, profil, vérification d’identité et paramètres.',
  },
  {
    id: 'faq-proprietaires',
    icon: KeyRound,
    title: 'Propriétaires',
    description: 'Ajouter un véhicule, gérer les réservations et recevoir vos gains.',
  },
];

export const HelpTopicsGrid: React.FC<HelpTopicsGridProps> = ({ counts }) => {
  return (
    <section aria-labelledby="help-topics-title">
      <h2
        id="help-topics-title"
        style={DISPLAY_FONT}
        className="mb-5 text-2xl font-normal text-brand-dark sm:text-3xl"
      >
        Sujets populaires
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((topic) => {
          const Icon = topic.icon;
          const count = counts?.[topic.id];
          return (
            <Link
              key={topic.id}
              href={`#${topic.id}`}
              className="group relative flex flex-col rounded-[28px] border border-brand-dark/[0.08] bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-brand-main/25 hover:shadow-[0_18px_40px_-24px_rgba(10,61,46,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-main text-champagne">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                {count ? (
                  <span className="rounded-full bg-brand-main/[0.07] px-2.5 py-1 text-xs font-medium tabular-nums text-brand-main">
                    {count} question{count > 1 ? 's' : ''}
                  </span>
                ) : null}
              </div>

              <h3
                style={DISPLAY_FONT}
                className="mt-4 text-lg font-normal leading-snug text-brand-dark"
              >
                {topic.title}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{topic.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};