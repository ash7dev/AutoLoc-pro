'use client';

import React from 'react';

interface GrowthKpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trendPercentage?: number; // Real percentage calculated from DB
  icon?: React.ReactNode;
  accentColor?: 'forest' | 'gold' | 'champagne' | 'rust';
}

export function GrowthKpiCard({
  title,
  value,
  subtext,
  trendPercentage,
  icon,
  accentColor = 'forest',
}: GrowthKpiCardProps) {
  const accentIconMap = {
    forest: 'bg-[#0A3D2E] text-[#F1DFB6]',
    gold: 'bg-[#C9A24B]/15 text-[#C9A24B]',
    champagne: 'bg-[#F1DFB6] text-[#0A3D2E]',
    rust: 'bg-[#9C4A32]/12 text-[#9C4A32]',
  };

  const hasTrend = typeof trendPercentage === 'number';
  const isPositive = hasTrend && trendPercentage >= 0;

  return (
    <div className="group relative rounded-[20px] border border-[#0A3D2E]/10 bg-white p-5 transition-colors duration-300 hover:border-[#0A3D2E]/20">
      <div className="flex items-start justify-between gap-3">
        <span className="font-sans text-[13px] font-medium text-[#0A3D2E]/55">
          {title}
        </span>
        {icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accentIconMap[accentColor]}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-fraunces text-[28px] font-normal leading-none tracking-tight text-[#041912] tabular-nums lg:text-[32px]">
          {value}
        </span>

        {hasTrend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isPositive
                ? 'bg-[#0A3D2E]/8 text-[#0A3D2E]'
                : 'bg-[#9C4A32]/10 text-[#9C4A32]'
              }`}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(trendPercentage)}%
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 font-sans text-[12px] text-[#0A3D2E]/45">
          {subtext}
        </p>
      )}
    </div>
  );
}