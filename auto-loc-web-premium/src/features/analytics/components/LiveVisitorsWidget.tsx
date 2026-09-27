'use client';

import React, { useState, useEffect } from 'react';
import { adminAnalyticsApi, LiveVisitorsData } from '@/src/core/api/adminAnalyticsApi';

const PAGE_NAMES_MAP: Record<string, string> = {
  '/': 'Accueil',
  '/recherche': 'Recherche de Véhicules',
  '/vehicules': 'Catalogue des Véhicules',
  '/auth/login': 'Connexion',
  '/auth/register': 'Inscription',
  '/checkout': 'Réservation & Paiement',
  '/admin/growth': 'Dashboard Growth Admin',
};

export function LiveVisitorsWidget() {
  const [data, setData] = useState<LiveVisitorsData | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveVisitors = async () => {
      try {
        setIsUpdating(true);
        const res = await adminAnalyticsApi.getLiveVisitors();
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        // Silently fallback on network error
      } finally {
        if (isMounted) {
          setTimeout(() => setIsUpdating(false), 400);
        }
      }
    };

    fetchLiveVisitors();
    const interval = setInterval(fetchLiveVisitors, 4000); // 4 seconds polling

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeCount = data?.activeVisitorsCount ?? 0;
  const activePages = data?.activePages ?? [];
  const activeCities = data?.activeCities ?? [];

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#0A3D2E]/10 bg-gradient-to-br from-white via-[#FAF9F6] to-[#0A3D2E]/[0.02] p-6 shadow-sm">
      {/* Top Header Row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3 shrink-0 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-fraunces font-normal tracking-tight text-[18px] text-[#041912]">
                Visiteurs en temps réel
              </h3>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-sans text-[11px] font-normal text-emerald-800 border border-emerald-500/20">
                EN DIRECT
              </span>
            </div>
            <p className="mt-0.5 font-sans text-[12.5px] text-[#0A3D2E]/50">
              Détection active des utilisateurs sur la plateforme — Style Spotify Traffic
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full bg-[#0A3D2E] transition-opacity duration-300 ${
              isUpdating ? 'opacity-100' : 'opacity-20'
            }`}
          />
          <span className="font-sans text-[11px] text-[#0A3D2E]/40">
            Mise à jour automatique (4s)
          </span>
        </div>
      </div>

      {/* Main Metric Counter */}
      <div className="mb-6 flex flex-wrap items-baseline gap-4 rounded-2xl border border-[#0A3D2E]/8 bg-white p-5">
        <div className="flex items-baseline gap-3">
          <span className="font-fraunces font-normal tracking-tight text-4xl tabular-nums text-[#041912] lg:text-5xl">
            {activeCount.toLocaleString('fr-FR')}
          </span>
          <span className="font-sans text-[14px] font-normal text-[#0A3D2E]/60">
            {activeCount > 1 ? 'personnes connectées actuellement' : 'personne connectée actuellement'}
          </span>
        </div>

        <div className="ml-auto hidden sm:block text-right">
          <span className="block font-sans text-[11px] text-[#0A3D2E]/40">
            Fiche active principale
          </span>
          <span className="font-sans text-[12.5px] font-normal text-[#0A3D2E]">
            {activePages[0] ? (PAGE_NAMES_MAP[activePages[0].url] || activePages[0].url) : 'Aucune page active'}
          </span>
        </div>
      </div>

      {/* Pages & Cities Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Active Pages Breakdown */}
        <div>
          <h4 className="mb-3 font-sans text-[12.5px] font-normal text-[#0A3D2E]/55">
            Pages actuellement consultées
          </h4>
          {activePages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#0A3D2E]/10 p-4 text-center font-sans text-[12.5px] italic text-[#0A3D2E]/35">
              En attente d&apos;activité visiteur sur le site…
            </div>
          ) : (
            <div className="space-y-2">
              {activePages.map((p) => {
                const percentage = activeCount > 0 ? Math.round((p.count / activeCount) * 100) : 0;
                const displayName = PAGE_NAMES_MAP[p.url] || p.url;

                return (
                  <div key={p.url} className="rounded-xl bg-[#0A3D2E]/[0.03] p-3">
                    <div className="mb-1.5 flex items-center justify-between font-sans text-[13px]">
                      <span className="truncate font-normal text-[#041912]" title={p.url}>
                        {displayName}
                      </span>
                      <span className="ml-2 font-mono text-[12px] font-normal text-[#0A3D2E]">
                        {p.count} {p.count > 1 ? 'visiteurs' : 'visiteur'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0A3D2E]/10">
                      <div
                        className="h-full rounded-full bg-[#0A3D2E] transition-all duration-500"
                        style={{ width: `${Math.max(8, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Cities Breakdown */}
        <div>
          <h4 className="mb-3 font-sans text-[12.5px] font-normal text-[#0A3D2E]/55">
            Zones géographiques actives
          </h4>
          {activeCities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#0A3D2E]/10 p-4 text-center font-sans text-[12.5px] italic text-[#0A3D2E]/35">
              Localisation par ville en cours d&apos;agrégation…
            </div>
          ) : (
            <div className="space-y-2">
              {activeCities.map((c) => (
                <div
                  key={c.city}
                  className="flex items-center justify-between rounded-xl bg-[#0A3D2E]/[0.03] px-3.5 py-3 font-sans text-[13px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    <span className="font-normal text-[#041912]">{c.city}</span>
                  </div>
                  <span className="font-mono text-[12px] font-normal text-[#0A3D2E]">
                    {c.count} session{c.count > 1 ? 's' : ''}
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
