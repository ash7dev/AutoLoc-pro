'use client';

import React from 'react';
import { Navigation, Truck, CheckCircle2, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface VehicleOptionsCardProps {
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number | null;
  proposeLivraisonDakar?: boolean | null;
  fraisLivraisonDakar?: number | null;
  proposeLivraisonAibd?: boolean | null;
  fraisLivraisonAibd?: number | null;
  fraisLivraison?: number | null;
}

type StatusTone = 'positive' | 'restricted' | 'neutral';

interface OptionCellProps {
  icon: LucideIcon;
  title: string;
  description: string;
  status: { label: string; tone: StatusTone };
  value: string;
  valueLabel: string;
  muted?: boolean;
}

const STATUS_STYLES: Record<StatusTone, { className: string; icon?: LucideIcon }> = {
  positive: { className: 'text-[#0A3D2E]', icon: CheckCircle2 },
  restricted: { className: 'text-amber-700', icon: XCircle },
  neutral: { className: 'text-slate-500' },
};

function OptionCell({
  icon: Icon,
  title,
  description,
  status,
  value,
  valueLabel,
  muted = false,
}: OptionCellProps) {
  const statusStyle = STATUS_STYLES[status.tone];
  const StatusIcon = statusStyle.icon;

  return (
    <div className="flex flex-col justify-between gap-5 px-5 sm:px-6 py-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Icon
            className="w-6 h-6 shrink-0 text-[#0A3D2E]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-medium ${statusStyle.className}`}
          >
            {StatusIcon && <StatusIcon className="w-4 h-4" aria-hidden="true" />}
            {status.label}
          </span>
        </div>

        <div>
          <h4 className="text-base font-semibold text-slate-900">{title}</h4>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200/80">
        <p
          className={`text-xl leading-tight font-display ${muted ? 'text-slate-500' : 'text-[#0A3D2E]'
            }`}
        >
          {value}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">{valueLabel}</p>
      </div>
    </div>
  );
}

export function VehicleOptionsCard({
  autoriseHorsDakar = false,
  supplementHorsDakarParJour,
  proposeLivraisonDakar,
  fraisLivraisonDakar,
  proposeLivraisonAibd,
  fraisLivraisonAibd,
  fraisLivraison,
}: VehicleOptionsCardProps) {
  const isDakarAvailable = proposeLivraisonDakar ?? (fraisLivraison !== null && fraisLivraison !== undefined);
  const actualFraisDakar = fraisLivraisonDakar ?? fraisLivraison ?? 0;

  const isAibdAvailable = Boolean(proposeLivraisonAibd);
  const actualFraisAibd = fraisLivraisonAibd ?? 0;

  const supplementValue =
    supplementHorsDakarParJour && supplementHorsDakarParJour > 0
      ? `+${formatCurrency(supplementHorsDakarParJour)} FCFA`
      : 'Inclus';

  let livraisonLabel = 'Non disponible';
  if (isDakarAvailable && isAibdAvailable) {
    livraisonLabel = `Dakar (${actualFraisDakar === 0 ? 'Gratuit' : formatCurrency(actualFraisDakar) + ' F'}) | AIBD (${actualFraisAibd === 0 ? 'Gratuit' : formatCurrency(actualFraisAibd) + ' F'})`;
  } else if (isDakarAvailable) {
    livraisonLabel = `Dakar (${actualFraisDakar === 0 ? 'Gratuit' : formatCurrency(actualFraisDakar) + ' FCFA'})`;
  } else if (isAibdAvailable) {
    livraisonLabel = `AIBD (${actualFraisAibd === 0 ? 'Gratuit' : formatCurrency(actualFraisAibd) + ' FCFA'})`;
  }

  const livraisonDisponible = isDakarAvailable || isAibdAvailable;

  return (
    <section
      aria-label="Déplacements et livraison"
      className="bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-sm"
    >
      <h3 className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 text-lg text-[#041912] font-fraunces font-normal">
        Déplacements et livraison
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-slate-200/80 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
        <OptionCell
          icon={Navigation}
          title="Trajets hors Dakar"
          description="Rouler en dehors de la région de Dakar"
          status={
            autoriseHorsDakar
              ? { label: 'Autorisé', tone: 'positive' }
              : { label: 'Non autorisé', tone: 'restricted' }
          }
          value={autoriseHorsDakar ? supplementValue : 'Dakar uniquement'}
          valueLabel={
            autoriseHorsDakar ? 'Supplément par jour' : 'Trajets limités à la région'
          }
          muted={!autoriseHorsDakar}
        />

        <OptionCell
          icon={Truck}
          title="Service de livraison"
          description="À domicile (Dakar) ou à l'aéroport (AIBD)"
          status={
            livraisonDisponible
              ? { label: 'Disponible', tone: 'positive' }
              : { label: 'Non disponible', tone: 'neutral' }
          }
          value={livraisonLabel}
          valueLabel="Options de livraison configurées"
          muted={!livraisonDisponible}
        />
      </div>
    </section>
  );
}