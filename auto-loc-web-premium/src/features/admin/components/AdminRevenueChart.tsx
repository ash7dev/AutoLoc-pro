'use client';

import React, { useState } from 'react';
import { AreaChart as ChartIcon } from 'lucide-react';
import type { AdminRevenueTrendsData, RevenueTrendPoint } from '../../../core/api/adminAnalyticsApi';
import { formatXOF } from './AdminExecutiveMetrics';

interface AdminRevenueChartProps {
  data?: AdminRevenueTrendsData;
  isLoading?: boolean;
}

export const AdminRevenueChart: React.FC<AdminRevenueChartProps> = ({ data, isLoading }) => {
  const [hoveredPoint, setHoveredPoint] = useState<RevenueTrendPoint | null>(null);

  if (isLoading || !data || !data.series || data.series.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm h-80 flex flex-col justify-between animate-pulse">
        <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="w-full h-48 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  const { series, summary } = data;
  const maxGmv = Math.max(...series.map((s) => s.gmv), 1);

  // SVG Dimensions
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 20;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const pointsGmv = series.map((s, idx) => {
    const x = paddingX + (idx / Math.max(series.length - 1, 1)) * chartWidth;
    const y = height - paddingY - (s.gmv / maxGmv) * chartHeight;
    return { x, y, data: s };
  });

  const pointsNet = series.map((s, idx) => {
    const x = paddingX + (idx / Math.max(series.length - 1, 1)) * chartWidth;
    const y = height - paddingY - (s.netRevenue / maxGmv) * chartHeight;
    return { x, y, data: s };
  });

  const pathGmv = pointsGmv.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const areaGmv = `${pathGmv} L ${pointsGmv[pointsGmv.length - 1].x} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

  const pathNet = pointsNet.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const activeDataPoint = hoveredPoint || series[series.length - 1];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-200 font-fraunces" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-emerald-600" />
            <h2
              className="text-lg font-fraunces font-normal text-[#041912] dark:text-white"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              Évolution du Volume d'Affaires & Revenus Nets
            </h2>
          </div>
          <p
            className="text-xs font-fraunces text-slate-500 dark:text-slate-400 mt-0.5"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
          >
            Séries temporelles au prorata quotidien • GMV total vs Nette Commission AutoLoc
          </p>
        </div>

        {/* Legend & Hover Info */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span
              className="text-xs font-fraunces font-bold text-slate-700 dark:text-slate-300"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              GMV : <span className="font-fraunces font-bold text-blue-600 dark:text-blue-400">{formatXOF(activeDataPoint.gmv)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span
              className="text-xs font-fraunces font-bold text-slate-700 dark:text-slate-300"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              Commissions : <span className="font-fraunces font-bold text-emerald-600 dark:text-emerald-400">{formatXOF(activeDataPoint.netRevenue)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={paddingX}
              y1={paddingY + ratio * chartHeight}
              x2={width - paddingX}
              y2={paddingY + ratio * chartHeight}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800/80"
              strokeDasharray="4 4"
            />
          ))}

          {/* GMV Area & Line */}
          <path d={areaGmv} fill="url(#gmvGradient)" />
          <path d={pathGmv} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Net Revenue Line */}
          <path d={pathNet} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive Dots */}
          {pointsGmv.map((p, idx) => {
            const isHovered = hoveredPoint?.date === p.data.date;
            return (
              <g
                key={idx}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredPoint(p.data)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <rect x={p.x - width / (series.length * 2)} y={0} width={width / series.length} height={height} fill="transparent" />
                {isHovered && (
                  <line x1={p.x} y1={paddingY} x2={p.x} y2={height - paddingY} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 3}
                  className={isHovered ? 'fill-blue-600 stroke-white stroke-2' : 'fill-blue-500'}
                />
              </g>
            );
          })}
        </svg>

        {/* Date Labels */}
        <div className="flex justify-between px-10 mt-2 text-xs font-fraunces text-slate-500" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
          <span>{series[0]?.date}</span>
          {series.length > 2 && <span>{series[Math.floor(series.length / 2)]?.date}</span>}
          <span>{series[series.length - 1]?.date}</span>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
        <div>
          <span className="text-xs font-fraunces text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
            Total GMV Période
          </span>
          <div className="text-base font-fraunces font-bold text-[#041912] dark:text-white mt-0.5" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
            {formatXOF(summary.totalGmv)}
          </div>
        </div>
        <div>
          <span className="text-xs font-fraunces text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
            Total Nette Commission
          </span>
          <div className="text-base font-fraunces font-bold text-emerald-700 dark:text-emerald-400 mt-0.5" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
            {formatXOF(summary.totalNetRevenue)}
          </div>
        </div>
        <div>
          <span className="text-xs font-fraunces text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
            Total Réservations
          </span>
          <div className="text-base font-fraunces font-bold text-blue-700 dark:text-blue-400 mt-0.5" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
            {summary.totalBookings} contrats
          </div>
        </div>
      </div>
    </div>
  );
};
