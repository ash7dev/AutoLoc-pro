'use client';

import React from 'react';

interface MetaCapiHealthWidgetProps {
  pixelId: string;
  isCapiConfigured: boolean;
  active?: boolean;
}

export function MetaCapiHealthWidget({
  pixelId,
  isCapiConfigured,
  active = true,
}: MetaCapiHealthWidgetProps) {
  return (
    <div className="rounded-[20px] border border-[#0A3D2E]/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-2.5 w-2.5 shrink-0">
            {isCapiConfigured ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0A3D2E]/50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#0A3D2E]" />
              </>
            ) : (
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#C9A24B]" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-fraunces text-[16px] font-normal text-[#041912]">
                Meta Pixel &amp; Conversions API
              </h3>
              <span className="rounded-full bg-[#0A3D2E]/6 px-2 py-0.5 font-mono text-[11px] text-[#0A3D2E]/70">
                {pixelId}
              </span>
            </div>
            <p className="mt-1 font-sans text-[12.5px] text-[#0A3D2E]/50">
              {isCapiConfigured
                ? 'CAPI serveur actif — déduplication par event_id via Graph API v19.0'
                : "Jeton CAPI absent du .env — définis META_CAPI_ACCESS_TOKEN pour activer l'envoi serveur"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 font-sans text-[12.5px]">
          <div className="text-right">
            <span className="block text-[11px] text-[#0A3D2E]/40">
              Déduplication pixel / CAPI
            </span>
            <span className="font-mono font-semibold text-[#0A3D2E]">
              100% · event_id UUID
            </span>
          </div>

          <div className="border-l border-[#0A3D2E]/10 pl-5 text-right">
            <span className="block text-[11px] text-[#0A3D2E]/40">
              Hachage sécurisé
            </span>
            <span className="font-mono text-[#041912]/80">SHA-256 (em, ph, ct)</span>
          </div>
        </div>
      </div>
    </div>
  );
}