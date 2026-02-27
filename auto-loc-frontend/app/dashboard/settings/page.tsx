'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Bell,
  HelpCircle,
  Star,
  BadgeCheck,
  UserRound,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSwitchToLocataire } from '@/features/owner/hooks/use-switch-to-locataire';
import { useSignOut } from '@/features/auth/hooks/use-signout';

const SETTINGS_ITEMS = [
  { href: '/dashboard/settings/profile', icon: User, label: 'Informations' },
  { href: '/dashboard/settings/notifications', icon: Bell, label: 'Notifications' },
  { href: '/dashboard/settings/support', icon: HelpCircle, label: 'Aide & Support' },
  { href: '/dashboard/owner/reviews', icon: Star, label: 'Avis' },
  { href: '/dashboard/owner/kyc', icon: BadgeCheck, label: 'Vérification' },
];

export default function DashboardSettingsPage() {
  const pathname = usePathname();
  const { switchToLocataire, loading: switching } = useSwitchToLocataire();
  const { signOut, loading: signingOut } = useSignOut();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center px-4 h-14">
          <Link href="/dashboard/owner" className="mr-3">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">Paramètres</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto p-4 lg:p-6">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {/* Settings Items */}
          <div className="divide-y divide-slate-100">
            {SETTINGS_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 transition-colors duration-150',
                    isActive ? 'bg-emerald-50' : 'hover:bg-slate-50'
                  )}
                >
                  <span className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                    isActive ? 'bg-emerald-100' : 'bg-slate-100'
                  )}>
                    <item.icon className={cn(
                      'w-4.5 h-4.5',
                      isActive ? 'text-emerald-600' : 'text-slate-600'
                    )} />
                  </span>
                  <span className={cn(
                    'text-[14.5px] font-medium tracking-tight',
                    isActive ? 'text-emerald-700' : 'text-slate-900'
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="border-t border-slate-100 p-2 space-y-1">
            <button
              type="button"
              onClick={switchToLocataire}
              disabled={switching}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-medium',
                'text-slate-700 hover:bg-slate-50 transition-colors duration-150',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              {switching ? (
                <div className="w-4.5 h-4.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              ) : (
                <UserRound className="w-4.5 h-4.5" />
              )}
              <span>Mode locataire</span>
            </button>

            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-medium',
                'text-red-600 hover:bg-red-50 transition-colors duration-150',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              {signingOut ? (
                <div className="w-4.5 h-4.5 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
              ) : (
                <LogOut className="w-4.5 h-4.5" />
              )}
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
