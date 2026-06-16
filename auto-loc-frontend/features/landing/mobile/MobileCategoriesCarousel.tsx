'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Car, Package, KeyRound, Truck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'CITADINE', label: 'Citadines', icon: KeyRound, desc: 'Agiles & Éco', color: 'from-amber-500/10 to-orange-500/10 text-orange-600 border-orange-500/10' },
  { value: 'BERLINE', label: 'Berlines', icon: Car, desc: 'Confortables', color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-500/10' },
  { value: 'SUV', label: 'SUV & 4x4', icon: Sparkles, desc: 'Spacieux & Robustes', color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-500/10' },
  { value: 'PICKUP', label: 'Pick-ups', icon: Truck, desc: 'Tout-terrain', color: 'from-purple-500/10 to-violet-500/10 text-purple-600 border-purple-500/10' },
  { value: 'UTILITAIRE', label: 'Utilitaires', icon: Package, desc: 'Grands volumes', color: 'from-rose-500/10 to-pink-500/10 text-rose-600 border-rose-500/10' },
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
                'flex-shrink-0 w-[130px] p-3.5 rounded-2xl border bg-gradient-to-br text-left transition-all active:scale-95',
                cat.color
              )}
            >
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm mb-3">
                <Icon className="h-4.5 w-4.5" />
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
