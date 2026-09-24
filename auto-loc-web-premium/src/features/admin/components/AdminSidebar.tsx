'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  UserCheck,
  ShieldAlert,
  Scale,
  Users,
  KeyRound,
  Luggage,
  Car,
  CalendarRange,
  Wallet,
  Radio,
  ShieldCheck,
  LogOut,
  Menu,
  X,


  ArrowUpRight,
} from 'lucide-react';
import { useUserStore } from '@/src/core/store/useUserStore';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const ADMIN_NAVIGATION: NavSection[] = [
  {
    title: "Vue d'ensemble",
    items: [
      { id: 'dashboard', label: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
      { id: 'stats', label: 'Revenus & stats', href: '/admin/stats', icon: TrendingUp },
    ],
  },
  {
    title: 'Modération & contrôle',
    items: [
      { id: 'kyc', label: 'Vérification KYC', href: '/admin/kyc', icon: UserCheck },
      { id: 'moderation', label: 'Modération annonces', href: '/admin/vehicles/moderation', icon: ShieldAlert },
      { id: 'disputes', label: 'Litiges & arbitrage', href: '/admin/disputes', icon: Scale },
    ],
  },
  {
    title: 'Gestion & supervision',
    items: [
      { id: 'users', label: 'Tous les utilisateurs', href: '/admin/users', icon: Users },
      { id: 'hosts', label: 'Hôtes & propriétaires', href: '/admin/hosts', icon: KeyRound },
      { id: 'tenants', label: 'Locataires & voyageurs', href: '/admin/tenants', icon: Luggage },
      { id: 'vehicles', label: 'Tous les véhicules', href: '/admin/vehicles', icon: Car },
      { id: 'reservations', label: 'Réservations', href: '/admin/reservations', icon: CalendarRange },
      { id: 'payouts', label: 'Retraits & finances', href: '/admin/payouts', icon: Wallet },
    ],
  },
  {
    title: 'Système & diffusion',
    items: [
      { id: 'broadcast', label: 'Notifications broadcast', href: '/admin/broadcast', icon: Radio },
    ],
  },
];



export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  const sidebarContent = (
    <div className="relative flex h-full select-none flex-col overflow-hidden bg-[#041912] text-white/70">
      {/* Matière décorative : halo + grain de lumière, comme le hero de profil */}
      <div className="pointer-events-none absolute -top-32 -right-20 h-72 w-72 rounded-full bg-[#4ADE80]/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0A3D2E]/50 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      {/* Logo & plaque admin */}
      <div className="relative z-10 flex flex-col gap-4 px-5 pb-5 pt-6">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative h-9 w-36">
              <Image src="/logo.png" alt="AutoLoc" fill priority sizes="144px" className="object-contain object-left" />
            </div>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.06] to-transparent px-3.5 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4ADE80]/12 text-[#4ADE80] ring-1 ring-[#4ADE80]/25">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-fraunces font-normal text-[15px] leading-tight text-[#F1DFB6]" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>Suite administrateur</p>
            <p className="text-[10.5px] text-white/35">Accès complet à la plateforme</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Navigation */}
      <div className="relative z-10 flex-1 space-y-7 overflow-y-auto px-4 py-5">
        {ADMIN_NAVIGATION.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <div className="px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/30">
              {section.title}
            </div>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13px] transition-all ${isActive
                      ? 'bg-gradient-to-r from-white/[0.09] to-white/[0.02] font-semibold text-[#F1DFB6] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                      : 'font-medium text-white/50 hover:bg-white/[0.04] hover:text-white/85'
                      }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${isActive
                        ? 'bg-[#4ADE80]/15 text-[#4ADE80] ring-1 ring-[#4ADE80]/20'
                        : 'text-white/40 group-hover:bg-white/[0.06] group-hover:text-white/70'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Bascule vers l'espace hôte */}
      <div className="relative z-10 px-4 py-4">
        <Link
          href="/dashboard"
          className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-[12.5px] font-medium text-white/60 transition-all hover:border-[#F1DFB6]/25 hover:bg-white/[0.06] hover:text-[#F1DFB6]"
        >
          Accéder à l'espace hôte
          <ArrowUpRight className="h-3.5 w-3.5 text-white/30 transition-colors group-hover:text-[#F1DFB6]" />
        </Link>
      </div>

      {/* Profil admin */}
      {user && (
        <div className="relative z-10 border-t border-white/8 px-4 py-4">
          <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-2.5">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1DFB6] font-fraunces text-[14px] text-[#041912] ring-2 ring-[#F1DFB6]/20">
                {user.prenom?.[0] || 'A'}
              </div>
              <div className="truncate">
                <p className="truncate text-[12.5px] font-semibold text-white">
                  {user.prenom} {user.nom}
                </p>
                <p className="truncate text-[10.5px] text-white/40">{user.email}</p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Déconnexion administrateur"
              className="shrink-0 rounded-lg p-2 text-white/40 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Topbar mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-[#041912] px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded-xl bg-white/10 p-2 text-white/80 hover:bg-white/15"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-fraunces text-[15px] text-[#F1DFB6]">AutoLoc Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
          <span className="text-[11.5px] text-white/40">En ligne</span>
        </div>
      </div>

      {/* Sidebar desktop */}
      <aside className="sticky top-0 self-start hidden h-screen w-72 shrink-0 lg:block">{sidebarContent}</aside>

      {/* Drawer mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative z-10 h-full w-80 max-w-[85vw]">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};