'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/providers/currency-provider';
import { TrendingDown } from 'lucide-react';

export interface PremiumPriceTagProps {
  /** Prix par jour brut en FCFA (ex: 25000) */
  price: number;
  /** Taille d'affichage */
  size?: 'sm' | 'md' | 'lg' | 'hero';
  /** Thème visuel */
  variant?: 'default' | 'dark' | 'emerald' | 'subtle';
  /** Libellé de période (par défaut: "/j") */
  period?: string;
  /** Pourcentage de réduction éventuel si tarif dégressif (ex: 15 pour -15%) */
  savingsPercent?: number;
  /** Jours minimum pour bénéficier de la réduction */
  minDays?: number | null;
  /** Masquer le préfixe "À partir de" */
  hidePrefix?: boolean;
  className?: string;
}

export function PremiumPriceTag({
  price,
  size = 'md',
  variant = 'default',
  period = '/j',
  savingsPercent = 0,
  minDays = null,
  hidePrefix = false,
  className,
}: PremiumPriceTagProps): React.ReactElement {
  const { formatPrice } = useCurrency();
  const formatted = formatPrice(price); // Exemple: "25 000 FCFA" ou "25 000 F"

  // Séparer le montant des chiffres du symbole de monnaie s'il y a lieu
  const parts = formatted.split(/\s+/);
  const currencySymbol = parts.length > 1 ? parts.pop() : '';
  const numberPart = parts.join(' ');

  // Variantes de couleur
  const colorStyles = {
    default: {
      number: 'text-slate-900',
      currency: 'text-emerald-600 font-extrabold',
      period: 'text-slate-400',
      prefix: 'text-slate-400',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    },
    dark: {
      number: 'text-white',
      currency: 'text-emerald-400 font-extrabold',
      period: 'text-white/50',
      prefix: 'text-white/40',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
    },
    emerald: {
      number: 'text-emerald-600',
      currency: 'text-emerald-700 font-extrabold',
      period: 'text-emerald-600/70',
      prefix: 'text-emerald-600/60',
      badge: 'bg-amber-400/15 text-amber-600 border-amber-400/30',
    },
    subtle: {
      number: 'text-slate-700',
      currency: 'text-slate-500 font-bold',
      period: 'text-slate-400',
      prefix: 'text-slate-400',
      badge: 'bg-slate-100 text-slate-600 border-slate-200',
    },
  }[variant];

  // Tailles
  const sizeStyles = {
    sm: {
      prefix: 'text-[8.5px] uppercase tracking-wider font-bold mb-0.5',
      number: 'text-[17px] leading-none',
      currency: 'text-[10px] ml-1 uppercase tracking-wider',
      period: 'text-[10px] font-bold ml-0.5',
      badge: 'text-[9px] px-1.5 py-0.5 rounded-md gap-0.5 mt-1',
    },
    md: {
      prefix: 'text-[9px] uppercase tracking-wider font-extrabold mb-1',
      number: 'text-[22px] lg:text-[24px] leading-none',
      currency: 'text-[11px] ml-1 uppercase tracking-wider',
      period: 'text-[11.5px] font-bold ml-0.5',
      badge: 'text-[9.5px] px-2 py-0.5 rounded-lg gap-1 mt-1.5',
    },
    lg: {
      prefix: 'text-[10px] uppercase tracking-widest font-extrabold mb-1',
      number: 'text-[28px] lg:text-[32px] leading-none',
      currency: 'text-[13px] ml-1.5 uppercase tracking-widest',
      period: 'text-[13px] font-bold ml-1',
      badge: 'text-[10.5px] px-2.5 py-1 rounded-xl gap-1 mt-2',
    },
    hero: {
      prefix: 'text-[11px] uppercase tracking-widest font-black mb-1.5',
      number: 'text-[36px] lg:text-[44px] leading-none',
      currency: 'text-[15px] ml-2 uppercase tracking-widest',
      period: 'text-[15px] font-black ml-1',
      badge: 'text-[11.5px] px-3 py-1 rounded-xl gap-1.5 mt-2.5',
    },
  }[size];

  return (
    <div className={cn('inline-flex flex-col select-none', className)}>
      {!hidePrefix && (
        <span className={cn(sizeStyles.prefix, colorStyles.prefix)}>
          À partir de
        </span>
      )}

      <div className="flex items-baseline font-brand tracking-tight">
        <span className={cn('font-black tabular-nums tracking-tight', sizeStyles.number, colorStyles.number)}>
          {numberPart}
        </span>
        {currencySymbol && (
          <span className={cn(sizeStyles.currency, colorStyles.currency)}>
            {currencySymbol}
          </span>
        )}
        {period && (
          <span className={cn(sizeStyles.period, colorStyles.period)}>
            {period}
          </span>
        )}
      </div>

      {savingsPercent > 0 && (
        <div className="flex items-center">
          <span
            className={cn(
              'inline-flex items-center border font-black whitespace-nowrap transition-transform',
              sizeStyles.badge,
              colorStyles.badge
            )}
          >
            <TrendingDown className="h-3 w-3 flex-shrink-0 animate-pulse" strokeWidth={2.5} />
            <span>−{savingsPercent}%</span>
            {minDays != null && <span>dès {minDays}j</span>}
          </span>
        </div>
      )}
    </div>
  );
}
