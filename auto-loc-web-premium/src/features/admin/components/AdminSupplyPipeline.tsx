'use client';

import React from 'react';
import { Car, AlertTriangle, CheckCircle, FileText, Star, Phone, Moon } from 'lucide-react';
import type { AdminSupplyPipelineData } from '../../../core/api/adminAnalyticsApi';

interface AdminSupplyPipelineProps {
  data?: AdminSupplyPipelineData;
  isLoading?: boolean;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

const FOREST = '#0A3D2E';
const CHAMPAGNE = '#F1DFB6';

export const AdminSupplyPipeline: React.FC<AdminSupplyPipelineProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs h-72 animate-pulse" />
    );
  }

  const { totalVehicles, statusBreakdown, bottlenecks, topOwners } = data;

  const statusCards = [
    { label: 'Vérifiées & actives', value: statusBreakdown.verifie, icon: CheckCircle, tone: FOREST, bg: 'rgba(10, 61, 46, 0.06)' },
    { label: 'En modération', value: statusBreakdown.enAttenteValidation, icon: Car, tone: '#4a5f75', bg: 'rgba(74, 95, 117, 0.07)' },
    { label: 'Brouillons hôte', value: statusBreakdown.brouillon, icon: FileText, tone: '#b27c2d', bg: 'rgba(178, 124, 45, 0.08)' },
    { label: 'Suspendues / rech.', value: statusBreakdown.suspendu, icon: AlertTriangle, tone: '#a13d3d', bg: 'rgba(161, 61, 61, 0.07)' },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs" style={fontStyle}>
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80 gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)' }}>
            <Car className="w-4.5 h-4.5" style={{ color: FOREST }} />
          </div>
          <div>
            <h3 className="text-base font-normal text-[#041912] dark:text-white">Pipeline de l'offre</h3>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
              Acquisition de véhicules, annonces en cours et flotteurs stratégiques
            </p>
          </div>
        </div>
        <span
          className="text-xs font-normal px-3 py-1.5 rounded-full shrink-0 whitespace-nowrap"
          style={{ backgroundColor: CHAMPAGNE, color: FOREST }}
        >
          {totalVehicles} véhicules
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
        {/* Left: Inventory Status & Bottlenecks */}
        <div className="space-y-4">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Répartition par statut d'annonce
          </span>

          <div className="grid grid-cols-2 gap-3">
            {statusCards.map((card) => (
              <div
                key={card.label}
                className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800"
                style={{ backgroundColor: card.bg }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-normal" style={{ color: card.tone }}>
                    {card.label}
                  </span>
                  <card.icon className="w-3.5 h-3.5" style={{ color: card.tone }} />
                </div>
                <div className="text-2xl font-normal mt-1 tabular-nums" style={{ color: card.tone }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Bottleneck Alerts */}
          <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#b27c2d' }} />
                Brouillons abandonnés (&gt; 48h)
              </span>
              <span className="font-medium tabular-nums" style={{ color: '#8a5a1f' }}>
                {bottlenecks.stuckDraftsCount} annonces
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Moon className="w-3 h-3 shrink-0" style={{ color: FOREST }} />
                Flotte dormante (0 location / 30j)
              </span>
              <span className="font-medium tabular-nums" style={{ color: FOREST }}>
                {bottlenecks.verifiedZeroBookingsCount} véhicules
              </span>
            </div>
          </div>
        </div>

        {/* Right: Top Hôtes / Suppliers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Top flotteurs & hôtes partenaires
            </span>
            <Star className="w-3.5 h-3.5" style={{ color: '#b27c2d' }} />
          </div>

          <div className="space-y-2">
            {topOwners.length === 0 ? (
              <div className="py-8 text-center text-xs font-normal text-slate-400">
                Aucun propriétaire enregistré
              </div>
            ) : (
              topOwners.map((owner, i) => (
                <div
                  key={owner.id}
                  className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-normal shrink-0"
                      style={{ backgroundColor: i === 0 ? CHAMPAGNE : 'rgba(10, 61, 46, 0.08)', color: FOREST }}
                    >
                      #{i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-normal text-[#041912] dark:text-white truncate">{owner.name}</div>
                      <div className="text-[11px] font-normal text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" style={{ color: FOREST }} /> {owner.phone || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <div className="font-medium tabular-nums" style={{ color: FOREST }}>
                      {owner.vehicleCount} véh.
                    </div>
                    <div className="text-[10px] font-normal text-slate-500 tabular-nums">
                      {owner.totalBookings} résas
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};