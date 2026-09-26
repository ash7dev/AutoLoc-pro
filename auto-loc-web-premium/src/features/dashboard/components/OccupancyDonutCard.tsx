'use client';

import React from 'react';
import { DashboardCard, Skeleton } from './DashboardCard';
import { clamp, toNumber, type Amount } from './dashboardUtils';

/**
 * Champs attendus de GET /analytics/owner/occupancy.
 * Seul le pourcentage est confirmé ; les quatre compteurs de jours sont à aligner
 * sur les noms exacts de ton API si besoin.
 */
export interface OccupancyData {
  tauxOccupationCommercialPourcentage?: Amount;
  joursLoues?: Amount;
  joursDisponibles?: Amount;
  joursBloques?: Amount;
  joursMaintenance?: Amount;
  joursDisponiblesEtNonLoues?: Amount;
  joursBloquesProprietaire?: Amount;
  joursMaintenanceOuSuspendus?: Amount;
}

interface OccupancyDonutCardProps {
  data?: OccupancyData;
  isLoading?: boolean;
}

const SIZE = 190;
const CENTER = SIZE / 2;
const RADIUS = 76;
const STROKE = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;

export const OccupancyDonutCard: React.FC<OccupancyDonutCardProps> = ({ data, isLoading = false }) => {
  const slices = [
    { key: 'loues', label: 'Loués', color: '#0A3D2E', days: toNumber(data?.joursLoues) },
    {
      key: 'dispo',
      label: 'Disponibles',
      color: '#E3CC94',
      days: toNumber(data?.joursDisponibles ?? data?.joursDisponiblesEtNonLoues),
    },
    {
      key: 'bloques',
      label: 'Bloqués par vous',
      color: '#CBD5E1',
      days: toNumber(data?.joursBloques ?? data?.joursBloquesProprietaire),
    },
    {
      key: 'maintenance',
      label: 'En maintenance',
      color: '#D98A7C',
      days: toNumber(data?.joursMaintenance ?? data?.joursMaintenanceOuSuspendus),
    },
  ];

  const total = slices.reduce((sum, s) => sum + s.days, 0);
  const rate = clamp(
    data?.tauxOccupationCommercialPourcentage !== undefined
      ? toNumber(data.tauxOccupationCommercialPourcentage)
      : total > 0
        ? (slices[0].days / total) * 100
        : 0,
    0,
    100,
  );

  const drawn = slices.filter((s) => s.days > 0);
  let offset = 0;

  return (
    <DashboardCard
      title="Occupation de la flotte"
      description="Répartition des jours sur 30 jours"
      className="h-full"
    >
      {isLoading ? (
        <div className="flex flex-col items-center gap-6" aria-busy="true">
          <Skeleton className="h-[190px] w-[190px] rounded-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-between gap-6 py-2">
          <div className="relative" style={{ width: SIZE, height: SIZE }}>
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="h-full w-full -rotate-90"
              role="img"
              aria-label={`Taux d’occupation : ${Math.round(rate)} %`}
            >
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke="#0A3D2E"
                strokeOpacity="0.08"
                strokeWidth={STROKE}
              />
              {drawn.map((s) => {
                const length = (s.days / total) * CIRCUMFERENCE;
                const segment = Math.max(0, length - (drawn.length > 1 ? GAP : 0));
                const circle = (
                  <circle
                    key={s.key}
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={STROKE}
                    strokeDasharray={`${segment} ${CIRCUMFERENCE - segment}`}
                    strokeDashoffset={-offset}
                  />
                );
                offset += length;
                return circle;
              })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-4xl leading-none tabular-nums text-brand-dark">
                {Math.round(rate)}
                <span className="text-xl text-slate-500">&nbsp;%</span>
              </p>
              <p className="mt-1.5 text-sm text-slate-500">d’occupation</p>
            </div>
          </div>

          <ul className="grid w-full grid-cols-2 gap-x-6 gap-y-4">
            {slices.map((s) => (
              <li key={s.key} className="space-y-0.5">
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </p>
                <p className="pl-[18px] font-display text-lg tabular-nums text-brand-dark">
                  {s.days}
                  <span className="ml-1 font-sans text-xs text-slate-500">{s.days > 1 ? 'jours' : 'jour'}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardCard>
  );
};