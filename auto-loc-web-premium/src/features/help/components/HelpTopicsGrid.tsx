'use client';

import React from 'react';
import Link from 'next/link';
import { Car, Banknote, Shield, FileText, UserCheck, type LucideIcon } from 'lucide-react';

interface TopicItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

const TOPICS: TopicItem[] = [
  {
    icon: Car,
    title: 'Location de véhicules',
    description: "Comment réserver, récupérer et restituer un véhicule sur AutoLoc.",
    href: '#faq-location',
  },
  {
    icon: Banknote,
    title: 'Paiements & Tarifs',
    description: "Wave, Orange Money, frais de service et remboursements.",
    href: '#faq-paiements',
  },
  {
    icon: Shield,
    title: 'Assurance & Sécurité',
    description: "Couverture tous risques, vérification KYC et protection.",
    href: '#faq-assurance',
  },
  {
    icon: FileText,
    title: 'Annulations & Litiges',
    description: "Politique d\u2019annulation, pénalités et résolution de conflits.",
    href: '#faq-annulations',
  },
  {
    icon: UserCheck,
    title: 'Mon compte',
    description: "Inscription, profil, vérification d\u2019identité et paramètres.",
    href: '#faq-compte',
  },
  {
    icon: Car,
    title: 'Propriétaires',
    description: "Ajouter un véhicule, gérer les réservations et recevoir vos gains.",
    href: '#faq-proprietaires',
  },
];

export const HelpTopicsGrid: React.FC = () => {
  return (
    <section>
      <h2
        className="font-fraunces text-2xl font-normal text-[#041912] sm:text-3xl mb-5"
        style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
      >
        Sujets populaires
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOPICS.map((topic) => {
          const Icon = topic.icon;
          return (
            <Link
              key={topic.title}
              href={topic.href}
              className="group rounded-3xl border border-[#041912]/8 bg-white p-6 transition-all hover:shadow-lg hover:shadow-slate-200/60 hover:border-[#0A3D2E]/20"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A3D2E]/8 text-[#0A3D2E] group-hover:bg-[#0A3D2E] group-hover:text-[#F1DFB6] transition-colors">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-3.5 text-[15px] font-semibold text-[#041912]">{topic.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{topic.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
