'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Lightbulb, Tag, TrendingUp, Wrench, type LucideIcon } from 'lucide-react';
import { DashboardCard, EmptyState, Skeleton } from './DashboardCard';
import { OWNER_ROUTES } from './dashboardUtils';

/**
 * Champs attendus pour chaque conseil de GET /analytics/owner/insights.
 * Le texte est lu dans `message` ou `description`.
 */
export interface OwnerInsight {
  id?: string;
  categorie?: string;
  titre?: string;
  message?: string;
  description?: string;
  actionCode?: string;
}

interface InsightsPanelProps {
  insights?: OwnerInsight[];
  isLoading?: boolean;
}

const MAX_ITEMS = 4;

function categoryMeta(raw?: string): { label: string; icon: LucideIcon } {
  const key = (raw ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  if (key.includes('PERF')) return { label: 'Performance', icon: TrendingUp };
  if (/TARIF|PRIC|PRIX/.test(key)) return { label: 'Tarification', icon: Tag };
  if (/QUALIT|ANNONCE|LISTING/.test(key)) return { label: 'Qualité de l’annonce', icon: Camera };
  if (key.includes('OPER')) return { label: 'Opérationnel', icon: Wrench };
  return { label: 'Conseil', icon: Lightbulb };
}

/**
 * Transforme un code d'action de l'API en lien.
 * Repli volontairement tolérant : adapte les motifs à tes codes réels.
 */
function resolveAction(code?: string): { label: string; href: string } | null {
  if (!code) return null;
  const key = code.toUpperCase();

  if (/WITHDRAW|WALLET|SOLDE/.test(key)) return { label: 'Retirer mes gains', href: OWNER_ROUTES.wallet };
  if (/SHARE|PARTAGE|LINK/.test(key)) return { label: 'Partager mes annonces', href: OWNER_ROUTES.fleet };
  if (/PRIX|PRICE|TARIF/.test(key)) return { label: 'Ajuster le prix', href: OWNER_ROUTES.fleet };
  if (/PHOTO|IMAGE/.test(key)) return { label: 'Ajouter des photos', href: OWNER_ROUTES.fleet };
  if (/CALEND|DISPO|AVAIL/.test(key)) return { label: 'Ouvrir le calendrier', href: OWNER_ROUTES.fleet };
  if (/RESERV|CONFIRM|DEMAND/.test(key)) return { label: 'Voir les demandes', href: OWNER_ROUTES.reservations };
  return { label: 'Voir le détail', href: OWNER_ROUTES.fleet };
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, isLoading = false }) => {
  const items = (insights ?? []).slice(0, MAX_ITEMS);

  return (
    <DashboardCard
      title="Recommandations"
      description="Des pistes concrètes pour augmenter vos revenus"
      className="h-full"
    >
      {isLoading ? (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Rien à améliorer pour l’instant"
          text="Nous vous proposerons des conseils dès que vos annonces auront assez d’activité."
        />
      ) : (
        <ul className="divide-y divide-[#0A3D2E]/10">
          {items.map((item, i) => {
            const meta = categoryMeta(item.categorie);
            const action = resolveAction(item.actionCode);
            const body = item.message ?? item.description;
            const Icon = meta.icon;

            return (
              <li key={item.id ?? `${item.titre}-${i}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagne/40 text-brand-main">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs text-slate-500">{meta.label}</p>
                  {item.titre && <p className="font-medium text-brand-dark">{item.titre}</p>}
                  {body && <p className="text-sm leading-relaxed text-slate-600">{body}</p>}
                  {action && (
                    <Link
                      href={action.href}
                      className="inline-block rounded-md pt-1 text-sm font-semibold text-brand-main underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2"
                    >
                      {action.label}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
};