'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface CategoryOption {
  key: string;
  label: string;
  href: string;
}

export const DEFAULT_VEHICLE_CATEGORIES: CategoryOption[] = [
  { key: 'all', label: 'Tous', href: '/explorer' },
  { key: 'SUV', label: 'SUV & 4×4', href: '/explorer?type=SUV' },
  { key: 'BERLINE', label: 'Berline Prestige', href: '/explorer?type=BERLINE' },
  { key: 'LUXE', label: 'Luxe & VIP', href: '/explorer?type=LUXE' },
  { key: 'PICKUP', label: 'Pick-up', href: '/explorer?type=PICKUP' },
  { key: 'CITADINE', label: 'Citadine Éco', href: '/explorer?type=CITADINE' },
  { key: 'UTILITAIRE', label: 'Utilitaire', href: '/explorer?type=UTILITAIRE' },
  { key: 'MINIVAN', label: 'Minivan & Bus', href: '/explorer?type=MINIVAN' },
];

interface CategoryPillBarProps {
  selectedKey?: string;
  onSelect?: (key: string) => void;
  categories?: CategoryOption[];
  className?: string;
}

export function CategoryPillBar({
  selectedKey,
  onSelect,
  categories = DEFAULT_VEHICLE_CATEGORIES,
  className,
}: CategoryPillBarProps): React.ReactElement {
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type') ?? 'all';
  const activeKey = selectedKey ?? (currentType ? currentType : 'all');

  return (
    <div className={cn('w-full overflow-hidden py-3', className)}>
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none px-4 lg:px-8 py-1 [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((cat) => {
          const isActive = activeKey === cat.key || (cat.key === 'all' && (!activeKey || activeKey === 'all'));

          if (onSelect) {
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onSelect(cat.key)}
                className={cn(
                  'shrink-0 px-6 py-2.5 rounded-full text-[14px] font-extrabold tracking-tight transition-all duration-200 select-none shadow-xs',
                  isActive
                    ? 'bg-[#0B1E17] text-white border border-[#0B1E17] shadow-md'
                    : 'bg-white text-slate-800 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 active:scale-95'
                )}
              >
                {cat.label}
              </button>
            );
          }

          return (
            <Link
              key={cat.key}
              href={cat.href}
              className={cn(
                'shrink-0 px-6 py-2.5 rounded-full text-[14px] font-extrabold tracking-tight transition-all duration-200 select-none shadow-xs inline-flex items-center justify-center',
                isActive
                  ? 'bg-[#0B1E17] text-white border border-[#0B1E17] shadow-md'
                  : 'bg-white text-slate-800 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 active:scale-95'
              )}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
