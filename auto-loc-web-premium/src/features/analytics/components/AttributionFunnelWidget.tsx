'use client';

import React from 'react';

interface FunnelStep {
  name: string;
  count: number;
  conversion: number; // percentage
}

interface AttributionFunnelWidgetProps {
  steps: FunnelStep[];
  overallConversion: number;
}

export function AttributionFunnelWidget({
  steps,
  overallConversion,
}: AttributionFunnelWidgetProps) {
  return (
    <div className="rounded-[20px] border border-[#0A3D2E]/10 bg-white p-6">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-[17px] font-semibold text-[#041912]">
            Entonnoir de conversion
          </h3>
          <p className="mt-1 max-w-md font-sans text-[12.5px] text-[#0A3D2E]/50">
            Flux cumulé, de la recherche initiale au paiement confirmé
          </p>
        </div>

        <div className="shrink-0 text-right">
          <span className="block font-sans text-[11px] text-[#0A3D2E]/40">
            Conversion globale
          </span>
          <span className="font-serif text-2xl font-semibold tabular-nums text-[#0A3D2E]">
            {overallConversion}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const isFirst = index === 0;
          const prevCount = isFirst ? step.count : steps[index - 1].count;
          const stepDropOff = prevCount > 0 && !isFirst ? prevCount - step.count : 0;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.name} className="relative flex items-center">
              <div className="flex w-full flex-col justify-between rounded-2xl border border-[#0A3D2E]/8 bg-[#0A3D2E]/[0.025] p-4">
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0A3D2E] font-mono text-[10px] font-medium text-[#F1DFB6]">
                      {index + 1}
                    </span>
                    <h4 className="font-sans text-[13px] font-medium text-[#041912]">
                      {step.name}
                    </h4>
                  </div>
                  <span className="font-mono text-[11px] text-[#0A3D2E]/45">
                    {step.conversion}% des visiteurs
                  </span>
                </div>

                <div className="mt-4">
                  <div className="font-serif text-xl font-semibold tabular-nums text-[#041912]">
                    {step.count.toLocaleString('fr-FR')}
                  </div>
                  {!isFirst && stepDropOff > 0 && (
                    <span className="mt-1 block font-sans text-[11px] text-[#9C4A32]">
                      −{stepDropOff.toLocaleString('fr-FR')} abandons
                    </span>
                  )}
                </div>
              </div>

              {!isLast && (
                <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7H12M12 7L8 3M12 7L8 11"
                      stroke="#0A3D2E"
                      strokeOpacity="0.25"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}