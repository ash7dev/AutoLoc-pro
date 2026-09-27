'use client';

import React, { useState } from 'react';

interface CampaignSourceItem {
  source: string;
  bookingsCount: number;
  gmv: number;
  netCommission: number;
}

interface CampaignPerformanceTableProps {
  sources: CampaignSourceItem[];
}

export function CampaignPerformanceTable({ sources }: CampaignPerformanceTableProps) {
  const [search, setSearch] = useState('');

  const filteredSources = sources.filter((item) =>
    item.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-[20px] border border-[#0A3D2E]/10 bg-white p-6">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-fraunces font-normal tracking-tight text-[18px] text-[#041912]">
            Performance des canaux d&apos;acquisition
          </h3>
          <p className="mt-1 font-sans text-[12.5px] text-[#0A3D2E]/50">
            Réservations et revenus générés par source (attribution UTM / Meta)
          </p>
        </div>

        <input
          type="text"
          placeholder="Rechercher une source…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-[#0A3D2E]/12 bg-[#0A3D2E]/[0.03] px-4 py-2 font-sans text-[13px] text-[#041912] placeholder:text-[#0A3D2E]/35 focus:border-[#0A3D2E]/30 focus:bg-white focus:outline-none sm:w-64"
        />
      </div>

      {filteredSources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#0A3D2E]/15 p-8 text-center font-sans text-[12.5px] italic text-[#0A3D2E]/40">
          Aucune source d&apos;acquisition enregistrée pour cette période.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-[13px]">
            <thead>
              <tr className="border-b border-[#0A3D2E]/10">
                <th className="py-3 pr-4 font-normal text-[#0A3D2E]/50">Source</th>
                <th className="px-4 py-3 text-center font-normal text-[#0A3D2E]/50">
                  Réservations
                </th>
                <th className="px-4 py-3 text-right font-normal text-[#0A3D2E]/50">GMV</th>
                <th className="pl-4 py-3 text-right font-normal text-[#0A3D2E]/50">
                  Commission nette
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0A3D2E]/6">
              {filteredSources.map((item) => (
                <tr key={item.source} className="transition-colors hover:bg-[#0A3D2E]/[0.02]">
                  <td className="py-3.5 pr-4">
                    <span className="rounded-full bg-[#F1DFB6]/50 px-2.5 py-1 font-mono text-[12px] font-normal text-[#0A3D2E]">
                      {item.source}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-fraunces font-normal tabular-nums text-[#041912]">
                    {item.bookingsCount}
                  </td>
                  <td className="px-4 py-3.5 text-right font-fraunces font-normal tabular-nums text-[#041912]">
                    {item.gmv.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="pl-4 py-3.5 text-right font-fraunces font-normal tabular-nums text-[#0A3D2E]">
                    {item.netCommission.toLocaleString('fr-FR')} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}