'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Car, Package, Shield, Truck, Sparkles, Gem, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'SUV', label: 'SUV & 4×4', icon: Shield, desc: 'Tout-terrain', badge: 'Populaire', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { value: 'BERLINE', label: 'Berlines', icon: Sparkles, desc: 'Confort VIP', badge: 'Élégance', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { value: 'LUXE', label: 'Luxe & VIP', icon: Gem, desc: 'Haut de gamme', badge: 'Prestige', color: 'text-purple-600 bg-purple-50 border-purple-100' },
  { value: 'PICKUP', label: 'Pick-ups', icon: Truck, desc: 'Résistants', badge: 'Pistes', color: 'text-amber-700 bg-amber-50 border-amber-100' },
  { value: 'CITADINE', label: 'Citadines', icon: Zap, desc: 'Agiles & Éco', badge: 'Ville', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { value: 'UTILITAIRE', label: 'Utilitaires', icon: Package, desc: 'Grands volumes', badge: 'Pro', color: 'text-slate-700 bg-slate-100 border-slate-200' },
];

export function MobileCategoriesCarousel(): React.ReactElement {
  const router = useRouter();

  const handleCategoryClick = (val: string) => {
    router.push(`/explorer?type=${val}`);
  };

  return (
    <div className="py-5 border-t border-slate-100">
      {/* Header */}
      <div className="px-4 mb-3.5 flex items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/80 border border-slate-200/50 mb-1">
            <Car className="h-3 w-3 text-emerald-600" strokeWidth={2.5} />
            <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-600">
              EXPLORATION
            </span>
          </div>
          <h3 className="text-[19px] font-bold text-slate-900 tracking-tight font-editorial leading-tight">
            Catégories de véhicules
          </h3>
        </div>
      </div>

      {/* Swipeable Carousel */}
      <div
        className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategoryClick(cat.value)}
              className={cn(
                'snap-start shrink-0 w-[142px] p-4 rounded-3xl border border-slate-200/70 bg-white/95 backdrop-blur-md',
                'shadow-sm shadow-slate-100/80 text-left transition-all active:scale-[0.95] hover:border-emerald-300'
              )}
            >
              {/* Icon Container */}
              <div className={cn('w-10 h-10 rounded-2xl border flex items-center justify-center mb-3', cat.color)}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>

              {/* Title & Desc */}
              <p className="text-[13.5px] font-bold text-slate-900 tracking-tight font-editorial leading-snug">
                {cat.label}
              </p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">
                {cat.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
