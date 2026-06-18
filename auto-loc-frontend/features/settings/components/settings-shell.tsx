'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRound, Bell, HelpCircle, LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSignOut } from '@/features/auth/hooks/use-signout';

const NAV = [
  { href: '/dashboard/settings/profile', icon: UserRound, label: 'Profil' },
  { href: '/dashboard/settings/notifications', icon: Bell, label: 'Notifications' },
  { href: '/dashboard/settings/support', icon: HelpCircle, label: 'Aide' },
];

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut, loading } = useSignOut();

  return (
    <div>
      {/*
        Sub-nav barre collante :
        - mobile : sous le top-bar de 56px (top-14)
        - desktop : en haut du contenu (top-0, sidebar gère la nav principale)
      */}
      <div className="sticky top-14 lg:top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm shadow-black/[0.03]">
        <div className="flex items-center max-w-2xl mx-auto px-4 lg:px-8 overflow-x-auto scrollbar-none">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-3.5 text-[13px] font-semibold border-b-2 whitespace-nowrap transition-all duration-150 flex-shrink-0',
                  active
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200',
                )}
              >
                <item.icon className="w-[15px] h-[15px] flex-shrink-0" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}

          <div className="flex-1 min-w-[12px]" />

          <button
            type="button"
            onClick={signOut}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-3.5 text-[13px] font-semibold text-red-500 hover:text-red-600 border-b-2 border-transparent whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
          >
            {loading
              ? <Loader2 className="w-[15px] h-[15px] animate-spin" />
              : <LogOut className="w-[15px] h-[15px]" strokeWidth={2} />
            }
            Déconnexion
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}
