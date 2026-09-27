'use client';

import React from 'react';

interface CapiTelemetryLogProps {
  pixelId: string;
  isCapiConfigured: boolean;
}

export function CapiTelemetryLog({ pixelId, isCapiConfigured }: CapiTelemetryLogProps) {
  const eventsTracked = [
    { name: 'PageView', match: 'IP, User-Agent, fbp' },
    { name: 'Search', match: 'SearchString, City, Type' },
    { name: 'ViewContent', match: 'Vehicle ID, Value, XOF' },
    { name: 'InitiateCheckout', match: 'Reservation ID, Amount, fbc' },
    { name: 'Purchase', match: 'SHA-256 (em, ph, fn, ln), Value' },
    { name: 'Lead', match: 'SHA-256 (em, ph), KYC Doc' },
    { name: 'CompleteRegistration', match: 'SHA-256 (em, ph)' },
    { name: 'AddVehicle', match: 'Vehicle ID, Host Email, Value' },
  ];

  return (
    <div className="rounded-[20px] border border-[#0A3D2E]/10 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#F1DFB6] animate-pulse" />
          <h3 className="font-sans text-[13px] font-semibold text-[#041912]">
            Télémétrie des événements CAPI
            <span className="ml-1.5 font-normal text-[#0A3D2E]/40">— Graph API v19.0</span>
          </h3>
        </div>
        <span className="rounded-full bg-[#F1DFB6]/50 px-2.5 py-0.5 font-mono text-[11px] text-[#0A3D2E]">
          {pixelId}
        </span>
      </div>

      <div className="space-y-1.5 overflow-x-auto rounded-2xl bg-[#041912] p-4 font-mono text-[12px]">
        <div className="flex justify-between border-b border-[#F1DFB6]/10 pb-2.5 text-[10.5px] text-[#F1DFB6]/35">
          <span>Événement</span>
          <span>Hachage / match</span>
          <span>Dispatch</span>
        </div>

        {eventsTracked.map((item) => (
          <div key={item.name} className="flex items-center justify-between py-1.5">
            <span className="font-semibold text-[#F1DFB6]">{item.name}</span>
            <span className="text-[11px] text-[#F1DFB6]/45">{item.match}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${isCapiConfigured
                  ? 'bg-[#F1DFB6]/12 text-[#F1DFB6]'
                  : 'bg-[#C9A24B]/15 text-[#C9A24B]'
                }`}
            >
              {isCapiConfigured ? 'CAPI Actif' : 'Jeton CAPI non configuré'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}