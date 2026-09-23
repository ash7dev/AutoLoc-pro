'use client';

import React from 'react';
import { Car, AlertTriangle, CheckCircle, FileText, Star, Phone } from 'lucide-react';
import type { AdminSupplyPipelineData } from '../../../core/api/adminAnalyticsApi';

interface AdminSupplyPipelineProps {
  data?: AdminSupplyPipelineData;
  isLoading?: boolean;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export const AdminSupplyPipeline: React.FC<AdminSupplyPipelineProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm h-64 animate-pulse" />
    );
  }

  const { totalVehicles, statusBreakdown, bottlenecks, topOwners } = data;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-200 font-fraunces" style={fontStyle}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3
            className="text-base font-fraunces font-normal text-[#041912] dark:text-white flex items-center gap-2"
            style={fontStyle}
          >
            <Car className="w-5 h-5 text-emerald-600" />
            <span className="font-fraunces font-normal" style={fontStyle}>
              Pipeline de l'Offre & Flotte Hôtes
            </span>
          </h3>
          <p
            className="text-xs font-fraunces font-normal text-slate-500 dark:text-slate-400 mt-0.5"
            style={fontStyle}
          >
            Acquisition de nouveaux véhicules, annonces en cours de création et flotteurs stratégiques.
          </p>
        </div>
        <span
          className="text-xs font-fraunces font-normal px-3 py-1 rounded-full bg-emerald-100/80 text-[#041912] border border-emerald-200"
          style={fontStyle}
        >
          {totalVehicles} véhicules totaux
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
        {/* Left: Inventory Status & Bottlenecks */}
        <div className="space-y-4">
          <span
            className="text-xs font-fraunces font-normal text-slate-500 uppercase tracking-wider block"
            style={fontStyle}
          >
            Répartition par Statut d'Annonce
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-fraunces font-normal text-emerald-900" style={fontStyle}>
                  Vérifiées & Actives
                </span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-fraunces font-normal text-emerald-900 mt-1" style={fontStyle}>
                {statusBreakdown.verifie}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-fraunces font-normal text-blue-900" style={fontStyle}>
                  En Modération
                </span>
                <Car className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-fraunces font-normal text-blue-900 mt-1" style={fontStyle}>
                {statusBreakdown.enAttenteValidation}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-fraunces font-normal text-amber-900" style={fontStyle}>
                  Brouillons Hôte
                </span>
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-fraunces font-normal text-amber-900 mt-1" style={fontStyle}>
                {statusBreakdown.brouillon}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-fraunces font-normal text-rose-900" style={fontStyle}>
                  Suspendues / Rech.
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-fraunces font-normal text-rose-900 mt-1" style={fontStyle}>
                {statusBreakdown.suspendu}
              </div>
            </div>
          </div>

          {/* Bottleneck Alerts */}
          <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-slate-800/50 border border-emerald-900/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-fraunces font-normal">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-normal" style={fontStyle}>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Brouillons abandonnés (&gt; 48h) :
              </span>
              <span className="font-fraunces font-normal text-amber-800 dark:text-amber-400" style={fontStyle}>
                {bottlenecks.stuckDraftsCount} annonces
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-fraunces font-normal">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-normal" style={fontStyle}>
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Flotte dormante (0 location en 30j) :
              </span>
              <span className="font-fraunces font-normal text-purple-800 dark:text-purple-400" style={fontStyle}>
                {bottlenecks.verifiedZeroBookingsCount} véhicules
              </span>
            </div>
          </div>
        </div>

        {/* Right: Top Hôtes / Suppliers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-fraunces font-normal text-slate-500 uppercase tracking-wider"
              style={fontStyle}
            >
              Top Flotteurs & Hôtes Partenaires
            </span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-2">
            {topOwners.length === 0 ? (
              <div className="py-8 text-center text-xs font-fraunces font-normal text-slate-400" style={fontStyle}>
                Aucun propriétaire enregistré
              </div>
            ) : (
              topOwners.map((owner, i) => (
                <div
                  key={owner.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-fraunces"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-fraunces font-normal flex items-center justify-center text-[11px] border border-emerald-200"
                      style={fontStyle}
                    >
                      #{i + 1}
                    </span>
                    <div>
                      <div className="font-fraunces font-normal text-[#041912] dark:text-white" style={fontStyle}>
                        {owner.name}
                      </div>
                      <div className="text-[11px] font-fraunces font-normal text-slate-500 flex items-center gap-1" style={fontStyle}>
                        <Phone className="w-3 h-3 text-emerald-600" /> {owner.phone || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-fraunces font-normal text-emerald-800 dark:text-emerald-400" style={fontStyle}>
                        {owner.vehicleCount} vél.
                      </div>
                      <div className="text-[10px] font-fraunces font-normal text-slate-500" style={fontStyle}>
                        {owner.totalBookings} résas
                      </div>
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
