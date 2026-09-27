'use client';

import React from 'react';

interface UnmetDemandHeatmapProps {
  totalFailedSearches: number;
  topFailedCities: Array<{ ville: string; count: number }>;
  topFailedTypes: Array<{ type: string; count: number }>;
}

export function UnmetDemandHeatmap({
  totalFailedSearches,
  topFailedCities,
  topFailedTypes,
}: UnmetDemandHeatmapProps) {
  return (
    <div className="rounded-[20px] border border-[#0A3D2E]/10 bg-white p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-[17px] font-semibold text-[#041912]">
              Demande non satisfaite
            </h3>
            <span className="rounded-full bg-[#C9A24B]/12 px-2 py-0.5 font-sans text-[11px] font-medium text-[#C9A24B]">
              Opportunité
            </span>
          </div>
          <p className="mt-1 max-w-md font-sans text-[12.5px] text-[#0A3D2E]/50">
            Recherches sans résultat disponible — pistes d&apos;acquisition d&apos;hôtes
          </p>
        </div>

        <div className="shrink-0 text-right">
          <span className="block font-sans text-[11px] text-[#0A3D2E]/40">
            Recherches infructueuses
          </span>
          <span className="font-serif text-2xl font-semibold tabular-nums text-[#041912]">
            {totalFailedSearches.toLocaleString('fr-FR')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-sans text-[12.5px] font-medium text-[#0A3D2E]/55">
            Villes en forte pénurie
          </h4>
          {topFailedCities.length === 0 ? (
            <p className="font-sans text-[12.5px] italic text-[#0A3D2E]/35">
              Aucune donnée de pénurie enregistrée
            </p>
          ) : (
            <div className="space-y-1.5">
              {topFailedCities.map((item) => (
                <div
                  key={item.ville}
                  className="flex items-center justify-between rounded-xl bg-[#0A3D2E]/[0.03] px-3.5 py-2.5"
                >
                  <span className="font-sans text-[13px] font-medium text-[#041912]">
                    {item.ville}
                  </span>
                  <span className="font-mono text-[12px] font-semibold text-[#C9A24B]">
                    {item.count} sans véhicule
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-3 font-sans text-[12.5px] font-medium text-[#0A3D2E]/55">
            Catégories recherchées et indisponibles
          </h4>
          {topFailedTypes.length === 0 ? (
            <p className="font-sans text-[12.5px] italic text-[#0A3D2E]/35">
              Aucun type spécifique en manque
            </p>
          ) : (
            <div className="space-y-1.5">
              {topFailedTypes.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between rounded-xl bg-[#0A3D2E]/[0.03] px-3.5 py-2.5"
                >
                  <span className="font-sans text-[13px] font-medium text-[#041912]">
                    {item.type}
                  </span>
                  <span className="font-mono text-[12px] font-semibold text-[#C9A24B]">
                    {item.count} requêtes
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}