'use client';

import React from 'react';
import { Navigation, Truck, MapPin, Plane } from 'lucide-react';
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

const STATUS_STYLES: Record<StatusTone, string> = {
  positive: 'bg-brand-main/10 text-brand-main',
  restricted: 'bg-amber-50 text-amber-700',
  neutral: 'bg-slate-100 text-slate-500',
};

const DOT_STYLES: Record<StatusTone, string> = {
  positive: 'bg-brand-main',
  restricted: 'bg-amber-600',
  neutral: 'bg-slate-400',
};

function StatusPill({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[tone]}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function IconBadge({ icon: Icon, muted }: { icon: LucideIcon; muted?: boolean }) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${muted ? 'bg-slate-100 text-slate-400' : 'bg-brand-main/10 text-brand-main'
        }`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
    </div>
  );
}

interface DestinationRowProps {
  label: string;
  icon: LucideIcon;
  available: boolean;
  fee: number;
}

function DestinationRow({ label, icon: Icon, available, fee }: DestinationRowProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 ${available ? 'bg-brand-main/5' : 'bg-slate-50'
        }`}
    >
      <span
        className={`flex items-center gap-2 text-sm font-medium ${available ? 'text-slate-800' : 'text-slate-400'
          }`}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        {label}
      </span>
      <span
        className={`font-display text-sm ${available ? 'text-brand-main' : 'text-slate-400'}`}
      >
        {available ? (fee === 0 ? 'Gratuit' : `${formatCurrency(fee)} FCFA`) : 'Non proposé'}
      </span>
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
  const isDakarAvailable =
    proposeLivraisonDakar ?? (fraisLivraison !== null && fraisLivraison !== undefined);
  const actualFraisDakar = fraisLivraisonDakar ?? fraisLivraison ?? 0;

  const isAibdAvailable = Boolean(proposeLivraisonAibd);
  const actualFraisAibd = fraisLivraisonAibd ?? 0;

  const livraisonDisponible = isDakarAvailable || isAibdAvailable;

  const supplementValue =
    supplementHorsDakarParJour && supplementHorsDakarParJour > 0
      ? `+${formatCurrency(supplementHorsDakarParJour)} FCFA`
      : 'Inclus';

  return (
    <section
      aria-label="Déplacements et livraison"
      className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm"
    >
      <h3 className="px-5 pt-5 pb-4 font-fraunces text-lg font-normal text-brand-dark sm:px-6 sm:pt-6">
        Déplacements et livraison
      </h3>

      <div className="grid grid-cols-1 divide-y divide-slate-200/80 border-t border-slate-200/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {/* Trajets hors Dakar */}
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <IconBadge icon={Navigation} muted={!autoriseHorsDakar} />
            <StatusPill
              tone={autoriseHorsDakar ? 'positive' : 'restricted'}
              label={autoriseHorsDakar ? 'Autorisé' : 'Non autorisé'}
            />
          </div>

          <div>
            <h4 className="font-fraunces font-normal text-lg sm:text-xl text-brand-dark tracking-tight">
              Trajets hors Dakar
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Rouler en dehors de la région de Dakar
            </p>
          </div>

          <div className="mt-auto rounded-2xl bg-slate-50 px-3.5 py-3">
            <p
              className={`font-display text-xl leading-tight ${
                autoriseHorsDakar ? 'text-brand-main' : 'text-slate-400'
              }`}
            >
              {autoriseHorsDakar ? supplementValue : 'Dakar uniquement'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {autoriseHorsDakar ? 'Supplément par jour' : 'Trajets limités à la région'}
            </p>
          </div>
        </div>

        {/* Service de livraison */}
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <IconBadge icon={Truck} muted={!livraisonDisponible} />
            <StatusPill
              tone={livraisonDisponible ? 'positive' : 'neutral'}
              label={livraisonDisponible ? 'Disponible' : 'Non disponible'}
            />
          </div>

          <div>
            <h4 className="font-fraunces font-normal text-lg sm:text-xl text-brand-dark tracking-tight">
              Service de livraison
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              À domicile ou à l&apos;aéroport (AIBD)
            </p>
          </div>

          <div className="mt-auto space-y-2">
            {isDakarAvailable && (
              <DestinationRow
                label="Dakar"
                icon={MapPin}
                available={isDakarAvailable}
                fee={actualFraisDakar}
              />
            )}
            {isAibdAvailable && (
              <DestinationRow
                label="AIBD"
                icon={Plane}
                available={isAibdAvailable}
                fee={actualFraisAibd}
              />
            )}
            {!isDakarAvailable && !isAibdAvailable && (
              <div className="rounded-2xl bg-slate-50 px-3.5 py-3">
                <p className="font-display text-xl leading-tight text-slate-400">
                  Sur place uniquement
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Pas de livraison à domicile ou à l&apos;aéroport
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}