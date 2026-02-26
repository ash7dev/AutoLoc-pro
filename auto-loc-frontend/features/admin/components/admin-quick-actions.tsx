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
  { label: 'Valider un KYC',       href: '/dashboard/admin/kyc',         icon: BadgeCheck, key: 'kyc'         },
  { label: 'Approuver un véhicule', href: '/dashboard/admin/vehicles',    icon: Car,        key: 'vehicles'    },
  { label: 'Traiter un retrait',    href: '/dashboard/admin/withdrawals', icon: Banknote,   key: 'withdrawals' },
  { label: 'Gérer un litige',       href: '/dashboard/admin/disputes',    icon: Scale,      key: 'disputes'    },
  { label: 'Voir les utilisateurs', href: '/dashboard/admin/users',       icon: Users,      key: null          },
] as const;

export function AdminQuickActions({ counts = {} }: AdminQuickActionsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-[15px] font-black tracking-tight text-black mb-5">
        Actions rapides
      </h2>
      <div className="space-y-1.5">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const count = action.key ? (counts[action.key as keyof QuickActionCounts] ?? 0) : 0;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5',
                'text-[13.5px] font-semibold text-black/70',
                'hover:bg-slate-50 hover:text-black',
                'transition-all duration-200',
              )}
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-black transition-colors duration-200">
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors duration-200" strokeWidth={1.75} />
              </span>
              <span className="flex-1">{action.label}</span>
              {count > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 bg-black text-[10px] font-bold text-emerald-400">
                  {count}
                </span>
              )}
              <ArrowRight className="w-3.5 h-3.5 text-black/20 group-hover:text-black/40 group-hover:translate-x-0.5 transition-all duration-200" strokeWidth={2.5} />
            </Link>
          );
        })}
      </div>

      {/* System status */}
      <div className="mt-5 pt-5 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={1.75} />
          <div className="flex-1">
            <p className="text-[12px] font-bold text-emerald-800">Système opérationnel</p>
            <p className="text-[11px] font-medium text-emerald-600/60">API, paiements, emails — tout OK</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
