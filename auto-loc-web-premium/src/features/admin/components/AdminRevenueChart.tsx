'use client';

import React, { useState } from 'react';
import { AreaChart as ChartIcon } from 'lucide-react';
import type { AdminRevenueTrendsData, RevenueTrendPoint } from '../../../core/api/adminAnalyticsApi';
import { formatXOF } from './AdminExecutiveMetrics';

interface AdminRevenueChartProps {
  data?: AdminRevenueTrendsData;
  isLoading?: boolean;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

const FOREST = '#0A3D2E';
const GOLD = '#b27c2d';

export const AdminRevenueChart: React.FC<AdminRevenueChartProps> = ({ data, isLoading }) => {
  const [hoveredPoint, setHoveredPoint] = useState<RevenueTrendPoint | null>(null);

  if (isLoading || !data || !data.series || data.series.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs h-80 flex flex-col justify-between animate-pulse">
        <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="w-full h-48 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  const { series, summary } = data;
  const maxGmv = Math.max(...series.map((s) => s.gmv), 1);

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

  const pathGmv = pointsGmv.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaGmv = `${pathGmv} L ${pointsGmv[pointsGmv.length - 1].x} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;
  const pathNet = pointsNet.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  const activeDataPoint = hoveredPoint || series[series.length - 1];
  const activeIdx = pointsGmv.findIndex((p) => p.data.date === activeDataPoint.date);
  const activePointGmv = pointsGmv[activeIdx];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs" style={fontStyle}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)' }}>
            <ChartIcon className="w-4.5 h-4.5" style={{ color: FOREST }} />
          </div>
          <div>
            <h2 className="text-base font-normal text-[#041912] dark:text-white">Volume d'affaires & revenus nets</h2>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
              GMV total vs commission nette AutoLoc, au prorata quotidien
            </p>
          </div>
        </div>

        {/* Legend & Hover Info */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: GOLD }} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              GMV <span className="font-medium tabular-nums" style={{ color: GOLD }}>{formatXOF(activeDataPoint.gmv)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: FOREST }} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Commissions <span className="font-medium tabular-nums" style={{ color: FOREST }}>{formatXOF(activeDataPoint.netRevenue)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden mt-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOLD} stopOpacity="0.18" />
              <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
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
          <path d={pathGmv} fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Net Revenue Line */}
          <path d={pathNet} fill="none" stroke={FOREST} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Hover guide + dots */}
          {activePointGmv && (
            <line
              x1={activePointGmv.x}
              y1={paddingY}
              x2={activePointGmv.x}
              y2={height - paddingY}
              stroke={FOREST}
              strokeOpacity={hoveredPoint ? 0.35 : 0}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {pointsGmv.map((p, idx) => {
            const isHovered = activeDataPoint.date === p.data.date;
            const netY = pointsNet[idx].y;
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p.data)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <rect x={p.x - width / (series.length * 2)} y={0} width={width / series.length} height={height} fill="transparent" />
                <circle cx={p.x} cy={p.y} r={isHovered ? 5 : 2.5} fill={GOLD} stroke="white" strokeWidth={isHovered ? 2 : 0} />
                <circle cx={p.x} cy={netY} r={isHovered ? 5 : 2.5} fill={FOREST} stroke="white" strokeWidth={isHovered ? 2 : 0} />
              </g>
            );
          })}
        </svg>

        {/* Date Labels */}
        <div className="flex justify-between px-10 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span>{series[0]?.date}</span>
          {series.length > 2 && <span>{series[Math.floor(series.length / 2)]?.date}</span>}
          <span>{series[series.length - 1]?.date}</span>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
        <div>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total GMV période
          </span>
          <div className="text-base font-normal mt-0.5 tabular-nums" style={{ color: GOLD }}>
            {formatXOF(summary.totalGmv)}
          </div>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total commission nette
          </span>
          <div className="text-base font-normal mt-0.5 tabular-nums" style={{ color: FOREST }}>
            {formatXOF(summary.totalNetRevenue)}
          </div>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total réservations
          </span>
          <div className="text-base font-normal text-[#041912] dark:text-white mt-0.5 tabular-nums">
            {summary.totalBookings} contrats
          </div>
        </div>
      </div>
    </div>
  );
};