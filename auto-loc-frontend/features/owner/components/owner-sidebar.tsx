'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  Car,
  Calendar,
  Wallet,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSwitchToLocataire } from '../hooks/use-switch-to-locataire';
import { useSignOut } from '../../auth/hooks/use-signout';
import { useRoleStore } from '../../auth/stores/role.store';
import { LogoLoader } from '@/components/ui/logo-loader';


/* ── Navigation config ────────────────────────────────────────── */
const DESKTOP_NAV_ITEMS = [
  { href: '/dashboard/owner', icon: LayoutGrid, label: 'Tableau de bord', badge: null },
  { href: '/dashboard/owner/vehicles', icon: Car, label: 'Véhicules', badge: null },
  { href: '/dashboard/owner/reservations', icon: Calendar, label: 'Réservations', badge: null },
  { href: '/dashboard/owner/wallet', icon: Wallet, label: 'Portefeuille', badge: null },
  { href: '/dashboard/owner/analytics', icon: BarChart3, label: 'Analytics', badge: 'NOUVEAU' },
  { href: '/dashboard/settings/profile', icon: Settings, label: 'Paramètres', badge: null },
] as const;

const MOBILE_NAV_ITEMS = [
  { href: '/dashboard/owner', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/dashboard/owner/vehicles', icon: Car, label: 'Véhicules' },
  { href: '/dashboard/owner/reservations', icon: Calendar, label: 'Réservations' },
  { href: '/dashboard/owner/wallet', icon: Wallet, label: 'Portefeuille' },
  {
    href: '/dashboard/settings/profile',
    icon: Settings,
    label: 'Paramètres',
    submenu: [
      { name: 'Informations', href: '/dashboard/settings/profile' },
      { name: 'Notifications', href: '/dashboard/settings/notifications' },
      { name: 'Aide & Support', href: '/dashboard/settings/support' },
      { name: 'Mode locataire', href: 'switch-locataire' },
      { name: 'Déconnexion', href: 'sign-out' },
    ],
  },
] as const;

/* ── Main Sidebar ─────────────────────────────────────────────── */
/** Minimal profile shape the sidebar needs. Accepts both ProfileResponse and UserProfile. */
interface SidebarProfile {
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string;
}

interface OwnerSidebarProps {
  profile?: SidebarProfile | null;
}

export function OwnerSidebar({ profile }: OwnerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeRole = useRoleStore((s) => s.activeRole);
  const isAdmin = activeRole === 'ADMIN' || activeRole === 'SUPPORT';
  const { switchToLocataire, loading: switching } = useSwitchToLocataire();
  const { signOut, loading: signingOut } = useSignOut();

  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const handleNavClick = (href: string) => {
    setPendingHref(href);
    startTransition(() => {
      router.push(href);
    });
  };

  const userInitials = profile
    ? `${profile.prenom?.[0] || ''}${profile.nom?.[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  return (
    <>
      {/* Overlay full-screen pendant le changement de rôle */}
      {switching && <LogoLoader />}

      {/* ══ MOBILE TOP BAR ══════════════════════════════════════════ */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center px-5 h-14
        bg-white/80 backdrop-blur-xl border-b border-black/[0.06] shadow-sm shadow-black/[0.02]">
        <button
          onClick={isAdmin ? () => router.push('/dashboard/admin') : switchToLocataire}
          disabled={!isAdmin && switching}
          className="hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          <Image
            src="/logoAutoLoc.jpg"
            alt="AutoLoc"
            width={140}
            height={65}
            priority
            className="object-contain"
          />
        </button>
      </div>

      {/* ══ MOBILE BOTTOM TAB BAR ══════════════════════════════════ */}
      <nav
        className="fixed inset-x-0 z-50 flex justify-center px-4 lg:hidden"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-full p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = item.href === '/dashboard/owner'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center justify-center"
              >
                {isActive && (
                  <motion.span
                    layoutId="owner-bottom-nav-active-pill"
                    className="absolute inset-0 rounded-full bg-slate-950"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span
                  className={cn(
                    'relative z-10 flex items-center gap-1.5 px-4 py-2.5 transition-colors duration-200',
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  )}
                >
                  <item.icon
                    className="h-5 w-5 flex-shrink-0"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <span className="text-[13px] font-bold whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ══ DESKTOP SIDEBAR ════════════════════════════════════════ */}
      <aside className="relative hidden lg:flex lg:flex-col lg:w-[280px] flex-shrink-0 bg-gradient-to-b from-[#2D1B69] via-[#1F1147] to-[#0F0A1F] border-r border-white/[0.08] shadow-2xl">

        {/* ── STICKY HEADER: Logo + User Profile ─────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-white/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent">
          {/* Logo */}
          <div className="flex items-center justify-center px-6 py-5">
            <button
              onClick={isAdmin ? () => router.push('/dashboard/admin') : undefined}
              className="group hover:opacity-90 transition-all duration-200"
            >
              <Image
                src="/logoAutoLoc.jpg"
                alt="AutoLoc"
                width={160}
                height={75}
                priority
                className="object-contain"
              />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="px-4 pb-4">
            <div className="group relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200 cursor-pointer">
              {/* Subtle glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative flex items-center gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {profile?.avatarUrl ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-emerald-400/30 transition-all">
                      <Image
                        src={profile.avatarUrl}
                        alt={profile.prenom || 'User'}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-emerald-400/30 transition-all shadow-lg shadow-emerald-500/20">
                      <span className="text-[16px] font-black text-white">
                        {userInitials}
                      </span>
                    </div>
                  )}
                  {/* Online dot */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#1F1147]" />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-white truncate leading-tight">
                    {profile?.prenom && profile?.nom
                      ? `${profile.prenom} ${profile.nom}`
                      : profile?.email || 'Utilisateur'
                    }
                  </p>
                  <p className="text-[11px] font-medium text-emerald-400 mt-0.5">
                    {profile?.role === 'PROPRIETAIRE' ? 'Propriétaire Pro' : profile?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                  </p>
                </div>

                {/* Chevron */}
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all flex-shrink-0" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE NAVIGATION ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
          <nav className="p-4 space-y-1.5">
            {DESKTOP_NAV_ITEMS.map((item) => {
              const isActive = item.href === '/dashboard/owner'
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const isPending = pendingHref === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className={cn(
                    'group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-white/10 text-white shadow-lg shadow-black/10'
                      : 'text-white/60 hover:bg-white/[0.04] hover:text-white/80'
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-r-full shadow-lg shadow-emerald-400/50" />
                  )}

                  {/* Icon */}
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
                    isActive
                      ? 'bg-white/10'
                      : 'bg-white/[0.03] group-hover:bg-white/[0.06]'
                  )}>
                    {isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-400" strokeWidth={2.5} />
                    ) : (
                      <item.icon className={cn(
                        'w-5 h-5 transition-all duration-200',
                        isActive ? 'text-emerald-400' : 'text-white/60 group-hover:text-white/80 group-hover:scale-110'
                      )} strokeWidth={2.5} />
                    )}
                  </div>

                  {/* Label */}
                  <span className={cn(
                    'flex-1 text-[14px] font-semibold tracking-tight',
                    isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                  )}>
                    {item.label}
                  </span>

                  {/* Badge */}
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 text-[9px] font-black text-amber-300 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Divider + Plus d'outils */}
          <div className="px-4 py-6">
            <div className="h-px bg-white/[0.08]" />
          </div>

          <div className="px-4 pb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 px-4">
              Plus d'outils
            </p>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:bg-white/[0.04] hover:text-white/70 transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.06] flex items-center justify-center transition-all">
                <span className="text-[18px]">📊</span>
              </div>
              <span className="flex-1 text-left text-[14px] font-semibold">Rapports</span>
              <span className="text-[10px] font-bold text-white/20">Bientôt</span>
            </button>
          </div>
        </div>

        {/* ── STICKY FOOTER: Bottom actions ────────────────────────── */}
        <div className="flex-shrink-0 p-4 pt-3 space-y-2 border-t border-white/[0.08] bg-gradient-to-b from-transparent to-black/10">



          {/* Switch to locataire — masqué pour les admins */}
          {!isAdmin && (
            <button
              type="button"
              onClick={switchToLocataire}
              disabled={switching}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/[0.06] hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition-all">
                {switching
                  ? <Loader2 className="w-5 h-5 animate-spin text-white/70" strokeWidth={2.5} />
                  : <Users className="w-5 h-5 text-white/70" strokeWidth={2.5} />
                }
              </div>
              <span className="flex-1 text-left text-[14px] font-semibold">Mode locataire</span>
              <ChevronRight className="w-4 h-4 text-white/30" strokeWidth={2} />
            </button>
          )}

          {/* Sign out */}
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed border border-transparent hover:border-red-500/20"
          >
            <div className="w-9 h-9 rounded-lg bg-white/[0.03] hover:bg-red-500/10 flex items-center justify-center transition-all">
              {signingOut
                ? <Loader2 className="w-5 h-5 animate-spin text-red-400" strokeWidth={2.5} />
                : <LogOut className="w-5 h-5 text-white/70 group-hover:text-red-400" strokeWidth={2.5} />
              }
            </div>
            <span className="flex-1 text-left text-[14px] font-semibold">Se déconnecter</span>
          </button>
        </div>
      </aside>
    </>
  );
}
