import React from 'react';
import Link from 'next/link';
import { BadgeCheck, Car, Banknote, Scale, ArrowRight } from 'lucide-react';
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
  bg: string; border: string; iconBg: string; iconText: string;
  valuText: string; urgent: string; zeroBg: string;
}> = {
  amber:   {
    bg: 'bg-amber-50',   border: 'border-amber-200/70',
    iconBg: 'bg-amber-100', iconText: 'text-amber-600',
    valuText: 'text-amber-900', urgent: 'ring-amber-300/60',
    zeroBg: 'bg-slate-50 border-slate-100',
  },
  emerald: {
    bg: 'bg-emerald-50', border: 'border-emerald-200/70',
    iconBg: 'bg-emerald-100', iconText: 'text-emerald-600',
    valuText: 'text-emerald-900', urgent: 'ring-emerald-300/60',
    zeroBg: 'bg-slate-50 border-slate-100',
  },
  blue:    {
    bg: 'bg-blue-50',    border: 'border-blue-200/70',
    iconBg: 'bg-blue-100',    iconText: 'text-blue-600',
    valuText: 'text-blue-900',    urgent: 'ring-blue-300/60',
    zeroBg: 'bg-slate-50 border-slate-100',
  },
  red:     {
    bg: 'bg-red-50',     border: 'border-red-200/70',
    iconBg: 'bg-red-100',     iconText: 'text-red-600',
    valuText: 'text-red-900',     urgent: 'ring-red-300/60',
    zeroBg: 'bg-slate-50 border-slate-100',
  },
};

interface CardConfig {
  key: keyof AdminStatCardsProps;
  label: string;
  sub: string;
  cta: string;
  href: string;
  icon: React.ElementType;
  color: Color;
}

const CARD_CONFIGS: CardConfig[] = [
  { key: 'kyc',         label: 'KYC en attente',     sub: 'vérifications identité',   cta: 'Examiner',  href: '/dashboard/admin/kyc',         icon: BadgeCheck, color: 'amber'   },
  { key: 'vehicles',    label: 'Véhicules à valider', sub: 'en attente de validation', cta: 'Valider',   href: '/dashboard/admin/vehicles',    icon: Car,        color: 'blue'    },
  { key: 'withdrawals', label: 'Retraits demandés',   sub: 'FCFA à traiter',           cta: 'Traiter',   href: '/dashboard/admin/withdrawals', icon: Banknote,   color: 'emerald' },
  { key: 'disputes',    label: 'Litiges ouverts',     sub: 'à résoudre en priorité',   cta: 'Arbitrer',  href: '/dashboard/admin/disputes',    icon: Scale,      color: 'red'     },
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
        const isUrgent = Number(value) > 0;
        const isEmpty = Number(value) === 0;

        return (
          <Link
            key={cfg.key}
            href={cfg.href}
            className={cn(
              'group relative flex flex-col gap-3 rounded-2xl border p-5',
              'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
              isEmpty ? c.zeroBg : cn(c.bg, c.border),
              isUrgent && 'ring-2 ring-offset-1',
              isUrgent && c.urgent,
            )}
          >
            {/* Pulse indicator pour items urgents */}
            {isUrgent && (
              <span className="absolute top-4 right-4 flex h-2 w-2">
                <span className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-60',
                  cfg.color === 'red' ? 'bg-red-400' :
                  cfg.color === 'amber' ? 'bg-amber-400' :
                  cfg.color === 'blue' ? 'bg-blue-400' : 'bg-emerald-400',
                )} />
                <span className={cn(
                  'relative inline-flex rounded-full h-2 w-2',
                  cfg.color === 'red' ? 'bg-red-500' :
                  cfg.color === 'amber' ? 'bg-amber-500' :
                  cfg.color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500',
                )} />
              </span>
            )}

            {/* Icône */}
            <div className={cn(
              'flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0',
              isEmpty ? 'bg-slate-100 text-slate-400' : cn(c.iconBg, c.iconText),
            )}>
              <Icon className="w-5 h-5" strokeWidth={1.75} />
            </div>

            {/* Valeur + label */}
            <div>
              <p className={cn(
                'text-[32px] font-black leading-none tracking-tight tabular-nums',
                isEmpty ? 'text-slate-300' : c.valuText,
              )}>
                {value}
              </p>
              <p className={cn(
                'mt-1.5 text-[13px] font-bold leading-tight',
                isEmpty ? 'text-slate-400' : 'text-black/70',
              )}>
                {cfg.label}
              </p>
              <p className={cn(
                'mt-0.5 text-[11.5px] font-medium capitalize',
                isEmpty ? 'text-slate-300' : 'text-black/35',
              )}>
                {isEmpty ? 'Tout est à jour ✓' : cfg.sub}
              </p>
            </div>

            {/* CTA */}
            {isUrgent && (
              <div className="flex items-center gap-1 mt-1">
                <span className={cn('text-[12px] font-bold', c.iconText)}>
                  {cfg.cta}
                </span>
                <ArrowRight
                  className={cn('w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200', c.iconText)}
                  strokeWidth={2.5}
                />
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
