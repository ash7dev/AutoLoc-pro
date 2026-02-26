import React from 'react';
import Link from 'next/link';
import { BadgeCheck, Car, Banknote, Scale, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardData {
  label: string;
  value: string | number;
  sub: string;
  href: string;
  trend?: { value: string; up: boolean };
}

interface AdminStatCardsProps {
  kyc?: Pick<StatCardData, 'value' | 'trend'>;
  vehicles?: Pick<StatCardData, 'value' | 'trend'>;
  withdrawals?: Pick<StatCardData, 'value' | 'trend'>;
  disputes?: Pick<StatCardData, 'value' | 'trend'>;
}

type Color = 'amber' | 'emerald' | 'blue' | 'red';

const COLOR_MAP: Record<Color, {
  bg: string; border: string; icon: string; dot: string; trendUp: string; trendDown: string;
}> = {
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200/60',   icon: 'bg-amber-100 text-amber-600',   dot: 'bg-amber-400',   trendUp: 'text-amber-600',   trendDown: 'text-emerald-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200/60', icon: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-400', trendUp: 'text-emerald-600', trendDown: 'text-emerald-600' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200/60',    icon: 'bg-blue-100 text-blue-600',    dot: 'bg-blue-400',    trendUp: 'text-blue-600',    trendDown: 'text-emerald-600' },
  red:     { bg: 'bg-red-50',     border: 'border-red-200/60',     icon: 'bg-red-100 text-red-600',     dot: 'bg-red-400',     trendUp: 'text-red-600',     trendDown: 'text-emerald-600' },
};

interface CardConfig {
  key: keyof AdminStatCardsProps;
  label: string;
  sub: string;
  href: string;
  icon: React.ElementType;
  color: Color;
}

const CARD_CONFIGS: CardConfig[] = [
  { key: 'kyc',         label: 'KYC en attente',      sub: 'Vérifications identité',    href: '/dashboard/admin/kyc',         icon: BadgeCheck, color: 'amber'   },
  { key: 'vehicles',    label: 'Véhicules à valider',  sub: 'En attente de validation',  href: '/dashboard/admin/vehicles',    icon: Car,        color: 'blue'    },
  { key: 'withdrawals', label: 'Retraits demandés',    sub: 'FCFA à traiter',            href: '/dashboard/admin/withdrawals', icon: Banknote,   color: 'emerald' },
  { key: 'disputes',    label: 'Litiges ouverts',      sub: 'À résoudre',                href: '/dashboard/admin/disputes',    icon: Scale,      color: 'red'     },
];

export function AdminStatCards({ kyc, vehicles, withdrawals, disputes }: AdminStatCardsProps) {
  const data = { kyc, vehicles, withdrawals, disputes };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {CARD_CONFIGS.map((cfg) => {
        const c = COLOR_MAP[cfg.color];
        const Icon = cfg.icon;
        const override = data[cfg.key];
        const value = override?.value ?? 0;
        const trend  = override?.trend;

        return (
          <Link
            key={cfg.key}
            href={cfg.href}
            className={cn(
              'group relative flex flex-col gap-4 rounded-2xl border p-5',
              'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
              c.bg, c.border,
            )}
          >
            {/* Icon + trend */}
            <div className="flex items-center justify-between">
              <div className={cn('flex items-center justify-center w-10 h-10 rounded-xl', c.icon)}>
                <Icon className="w-5 h-5" strokeWidth={1.75} />
              </div>
              {trend && (
                <span className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-semibold',
                  trend.up ? c.trendUp : c.trendDown,
                )}>
                  {trend.up
                    ? <TrendingUp className="h-3 w-3" strokeWidth={2} />
                    : <TrendingDown className="h-3 w-3" strokeWidth={2} />
                  }
                  {trend.value}
                </span>
              )}
            </div>

            {/* Value */}
            <div>
              <p className="text-[28px] font-black tracking-tight text-black leading-none">
                {value}
              </p>
              <p className="mt-1.5 text-[13px] font-bold text-black/70">{cfg.label}</p>
              <p className="mt-0.5 text-[12px] font-medium text-black/35">{cfg.sub}</p>
            </div>

            {/* Arrow */}
            <ArrowRight
              className="absolute top-5 right-5 w-4 h-4 text-black/20
                group-hover:text-black/50 group-hover:translate-x-0.5
                transition-all duration-200"
              strokeWidth={2.5}
            />
          </Link>
        );
      })}
    </div>
  );
}
