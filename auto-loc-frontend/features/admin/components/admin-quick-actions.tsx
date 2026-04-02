import React from 'react';
import Link from 'next/link';
import { BadgeCheck, Car, Banknote, Scale, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuickActionCounts {
  kyc?: number;
  vehicles?: number;
  withdrawals?: number;
  disputes?: number;
}

interface AdminQuickActionsProps {
  counts?: QuickActionCounts;
}

const ACTIONS = [
  { label: 'Valider un KYC',        href: '/dashboard/admin/kyc',         icon: BadgeCheck, key: 'kyc',         urgent: true  },
  { label: 'Approuver un véhicule', href: '/dashboard/admin/vehicles',    icon: Car,        key: 'vehicles',    urgent: false },
  { label: 'Traiter un retrait',    href: '/dashboard/admin/withdrawals', icon: Banknote,   key: 'withdrawals', urgent: false },
  { label: 'Gérer un litige',       href: '/dashboard/admin/disputes',    icon: Scale,      key: 'disputes',    urgent: true  },
  { label: 'Voir les utilisateurs', href: '/dashboard/admin/users',       icon: Users,      key: null,          urgent: false },
] as const;

export function AdminQuickActions({ counts = {} }: AdminQuickActionsProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-black tracking-tight text-black">
          Actions rapides
        </h2>
        <span className="text-[11px] font-semibold text-black/30 uppercase tracking-widest">
          Raccourcis
        </span>
      </div>

      <div className="space-y-1">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const count = action.key ? (counts[action.key as keyof QuickActionCounts] ?? 0) : 0;
          const hasUrgent = action.urgent && count > 0;

          return (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5',
                'text-[13.5px] font-semibold',
                'transition-all duration-200',
                hasUrgent
                  ? 'text-black hover:bg-black/5'
                  : 'text-black/60 hover:bg-slate-50 hover:text-black',
              )}
            >
              <span className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
                hasUrgent
                  ? 'bg-black group-hover:bg-black/90'
                  : 'bg-slate-100 group-hover:bg-black',
              )}>
                <Icon className={cn(
                  'w-4 h-4 transition-colors duration-200',
                  hasUrgent
                    ? 'text-emerald-400'
                    : 'text-slate-500 group-hover:text-emerald-400',
                )} strokeWidth={1.75} />
              </span>
              <span className="flex-1">{action.label}</span>
              {count > 0 && (
                <span className={cn(
                  'inline-flex items-center justify-center min-w-[22px] h-5 rounded-full px-1.5 text-[10px] font-black',
                  hasUrgent ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600',
                )}>
                  {count}
                </span>
              )}
              <ArrowRight className="w-3.5 h-3.5 text-black/20 group-hover:text-black/40 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" strokeWidth={2.5} />
            </Link>
          );
        })}
      </div>

      {/* System status */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={1.75} />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-emerald-800">Système opérationnel</p>
            <p className="text-[10.5px] font-medium text-emerald-600/60">API · Paiements · Emails</p>
          </div>
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>
      </div>
    </div>
  );
}
