'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Car, Package, KeyRound, Truck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'CITADINE', label: 'Citadines', icon: KeyRound, desc: 'Agiles & Éco' },
  { value: 'BERLINE', label: 'Berlines', icon: Car, desc: 'Confortables' },
  { value: 'SUV', label: 'SUV & 4x4', icon: Sparkles, desc: 'Spacieux & Robustes' },
  { value: 'PICKUP', label: 'Pick-ups', icon: Truck, desc: 'Tout-terrain' },
  { value: 'UTILITAIRE', label: 'Utilitaires', icon: Package, desc: 'Grands volumes' },
];

export function MobileCategoriesCarousel(): React.ReactElement {
  const router = useRouter();

  const handleCategoryClick = (val: string) => {
    router.push(`/explorer?type=${val}`);
  };

  return (
    <div className="py-4">
      <div className="px-4 mb-3 flex items-center justify-between">
        <h3 className="text-[14px] font-black text-slate-800 tracking-tight uppercase">
          Catégories de véhicules
        </h3>
      </div>
      
      <div 
        className="flex gap-3 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
                'flex-shrink-0 w-[120px] p-3.5 rounded-2xl border border-slate-100 bg-white',
                'shadow-sm shadow-slate-100/60 text-left transition-all active:scale-95 hover:border-emerald-200'
              )}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                <Icon className="h-4.5 w-4.5 text-emerald-600" strokeWidth={2} />
              </div>
              <p className="text-[12px] font-black text-slate-900 tracking-tight leading-tight">
                {cat.label}
              </p>
              <p className="text-[9.5px] font-medium text-slate-400 mt-0.5 leading-none">
                {cat.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
