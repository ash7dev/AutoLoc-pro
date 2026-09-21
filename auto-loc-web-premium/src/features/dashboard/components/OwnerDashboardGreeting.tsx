'use client';

import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface OwnerDashboardGreetingProps {
  prenom: string | undefined;
  checkinsCount?: number;
  checkoutsCount?: number;
  demandesCount?: number;
}

/** Accord français : 0 et 1 au singulier, à partir de 2 au pluriel. */
const plural = (n: number, one: string, many: string) => (n > 1 ? many : one);

export const OwnerDashboardGreeting: React.FC<OwnerDashboardGreetingProps> = ({
  prenom,
  checkinsCount = 0,
  checkoutsCount = 0,
  demandesCount = 0,
}) => {
  const titleId = useId();
  const reduceMotion = useReducedMotion();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  // Seule la première lettre passe en majuscule : « Lundi 21 septembre 2026 »
  // (la classe CSS `capitalize` mettrait aussi une majuscule au mois, ce qui est faux en français)
  const rawDate = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dateStr = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const stats = [
    {
      key: 'checkins',
      count: checkinsCount,
      label: plural(checkinsCount, 'Check-in prévu', 'Check-ins prévus'),
      needsAction: false,
    },
    {
      key: 'checkouts',
      count: checkoutsCount,
      label: plural(checkoutsCount, 'Check-out prévu', 'Check-outs prévus'),
      needsAction: false,
    },
    {
      key: 'demandes',
      count: demandesCount,
      label: plural(demandesCount, 'Demande en attente', 'Demandes en attente'),
      needsAction: true,
    },
  ];

  const hasActivity = stats.some((s) => s.count > 0);

  return (
    <motion.section
      aria-labelledby={titleId}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8"
    >
      <div className="min-w-0 space-y-1.5">
        <h1
          id={titleId}
          suppressHydrationWarning
          className="font-display text-3xl font-normal tracking-tight text-[#041912] sm:text-4xl"
        >
          {greeting}
          {prenom ? `, ${prenom}` : ''}
        </h1>
        <p suppressHydrationWarning className="text-sm text-slate-500">
          {dateStr}
        </p>
      </div>

      {hasActivity ? (
        <ul
          aria-label="Résumé de votre activité"
          className="grid grid-cols-3 divide-x divide-[#0A3D2E]/10 overflow-hidden rounded-2xl border border-[#0A3D2E]/10 bg-white sm:min-w-[26rem]"
        >
          {stats.map(({ key, count, label, needsAction }) => {
            const active = count > 0;
            return (
              <li
                key={key}
                className={`flex min-w-0 flex-col gap-1.5 px-4 py-3.5 sm:px-6 sm:py-4 ${active && needsAction ? 'bg-[#F1DFB6]/40' : ''
                  }`}
              >
                <span
                  className={`font-display text-3xl leading-none tabular-nums ${active ? 'text-[#0A3D2E]' : 'text-slate-300'
                    }`}
                >
                  {count}
                </span>
                <span
                  className={`text-xs leading-tight ${active ? 'font-medium text-slate-700' : 'text-slate-500'
                    }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="inline-flex items-center gap-2 self-start rounded-full border border-[#0A3D2E]/10 bg-white px-4 py-2 text-sm text-slate-600 sm:self-auto">
          <CheckCircle2 className="h-4 w-4 text-[#0A3D2E]" aria-hidden="true" />
          Aucune action urgente pour le moment
        </p>
      )}
    </motion.section>
  );
};