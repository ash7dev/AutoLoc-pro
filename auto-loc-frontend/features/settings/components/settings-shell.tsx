'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRound, Bell, HelpCircle, LogOut, Loader2, Menu, X, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSignOut } from '@/features/auth/hooks/use-signout';

const NAV = [
  { href: '/dashboard/settings/profile', icon: UserRound, label: 'Profil', description: 'Informations personnelles' },
  { href: '/dashboard/settings/notifications', icon: Bell, label: 'Notifications', description: 'Gérer vos alertes' },
  { href: '/dashboard/settings/support', icon: HelpCircle, label: 'Aide & Support', description: 'Besoin d\'assistance' },
];

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut, loading } = useSignOut();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPage = NAV.find(item => pathname.startsWith(item.href));

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop Sidebar Navigation ────────────────────────────────── */}
      <aside className="hidden lg:block w-72 border-r border-slate-200 bg-white">
        <div className="sticky top-0 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <Settings className="w-5 h-5 text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-slate-900 tracking-tight">Paramètres</h2>
              <p className="text-[11px] text-slate-400 font-medium">Configuration du compte</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150',
                    active
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                    active
                      ? 'bg-white/10'
                      : 'bg-slate-100 group-hover:bg-slate-200'
                  )}>
                    <item.icon className={cn(
                      'w-4.5 h-4.5',
                      active ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-900'
                    )} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-[14px] font-bold tracking-tight',
                      active ? 'text-white' : 'text-slate-900'
                    )}>
                      {item.label}
                    </p>
                    <p className={cn(
                      'text-[11px] font-medium mt-0.5',
                      active ? 'text-white/60' : 'text-slate-400'
                    )}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Disconnect Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={signOut}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                {loading
                  ? <Loader2 className="w-4.5 h-4.5 animate-spin text-red-600" strokeWidth={2} />
                  : <LogOut className="w-4.5 h-4.5 text-red-600" strokeWidth={2} />
                }
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[14px] font-bold text-red-600">Déconnexion</p>
                <p className="text-[11px] font-medium text-red-400">Se déconnecter du compte</p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header with Menu ───────────────────────────────────── */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            {currentPage && (
              <>
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                  <currentPage.icon className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-[15px] font-black text-slate-900 tracking-tight">{currentPage.label}</h1>
                  <p className="text-[11px] text-slate-400 font-medium">{currentPage.description}</p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-900" strokeWidth={2} />
            ) : (
              <Menu className="w-5 h-5 text-slate-900" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Overlay ───────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute top-28 right-4 left-4 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 space-y-1">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center',
                      active ? 'bg-white/10' : 'bg-slate-100'
                    )}>
                      <item.icon className={cn(
                        'w-4.5 h-4.5',
                        active ? 'text-emerald-400' : 'text-slate-600'
                      )} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-[14px] font-bold',
                        active ? 'text-white' : 'text-slate-900'
                      )}>
                        {item.label}
                      </p>
                      <p className={cn(
                        'text-[11px] font-medium mt-0.5',
                        active ? 'text-white/60' : 'text-slate-400'
                      )}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}

              <div className="h-px bg-slate-100 my-2" />

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                  {loading
                    ? <Loader2 className="w-4.5 h-4.5 animate-spin text-red-600" strokeWidth={2} />
                    : <LogOut className="w-4.5 h-4.5 text-red-600" strokeWidth={2} />
                  }
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[14px] font-bold text-red-600">Déconnexion</p>
                  <p className="text-[11px] font-medium text-red-400">Se déconnecter</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 lg:pt-0 pt-28">
        {children}
      </div>
    </div>
  );
}
