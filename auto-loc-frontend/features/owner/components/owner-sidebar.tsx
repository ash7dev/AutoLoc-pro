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
      <aside className="relative hidden lg:flex lg:flex-col lg:w-[260px] flex-shrink-0 bg-white border-r border-sand-200 shadow-sm">

        {/* ── Logo ─────────────────────────────── */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <button
            onClick={isAdmin ? () => router.push('/dashboard/admin') : switchToLocataire}
            disabled={!isAdmin && switching}
            className="group hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* ── User Profile Card ────────────────── */}
        <div className="flex-shrink-0 px-4 pb-4">
          <div className="group relative overflow-hidden rounded-xl bg-green-50/60 border border-green-100 p-3.5 hover:bg-green-50 hover:border-green-200 transition-all duration-200 cursor-pointer">
            <div className="relative flex items-center gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {profile?.avatarUrl ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-green-200 group-hover:ring-green-300 transition-all">
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.prenom || 'User'}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center ring-2 ring-green-200 group-hover:ring-green-300 transition-all shadow-sm">
                    <span className="text-[13px] font-black text-white">
                      {userInitials}
                    </span>
                  </div>
                )}
                {/* Online dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-sand-900 truncate leading-tight">
                  {profile?.prenom && profile?.nom
                    ? `${profile.prenom} ${profile.nom}`
                    : profile?.email || 'Utilisateur'
                  }
                </p>
                <p className="text-[11px] font-semibold text-green-600 mt-0.5">
                  {profile?.role === 'PROPRIETAIRE' ? 'Propriétaire Pro' : profile?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Separator ───────────────────────── */}
        <div className="px-6 pb-2">
          <div className="h-px bg-sand-200" />
        </div>

        {/* ── Navigation ──────────────────────── */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
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
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-sand-500 hover:bg-sand-50 hover:text-sand-800'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-r-full" />
                )}

                {/* Icon */}
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                  isActive
                    ? 'bg-green-100/80'
                    : 'bg-sand-100/60 group-hover:bg-sand-100'
                )}>
                  {isPending ? (
                    <Loader2 className="w-[18px] h-[18px] animate-spin text-green-500" strokeWidth={2.5} />
                  ) : (
                    <item.icon className={cn(
                      'w-[18px] h-[18px] transition-all duration-200',
                      isActive ? 'text-green-600' : 'text-sand-400 group-hover:text-sand-600'
                    )} strokeWidth={2} />
                  )}
                </div>

                {/* Label */}
                <span className={cn(
                  'flex-1 text-[13px] font-semibold',
                  isActive ? 'text-green-700' : 'text-sand-600 group-hover:text-sand-800'
                )}>
                  {item.label}
                </span>

                {/* Badge */}
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[9px] font-black text-amber-600 uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer actions ──────────────────── */}
        <div className="flex-shrink-0 px-3 pb-4 pt-2 space-y-1 border-t border-sand-100">

          {/* Switch to locataire — masqué pour les admins */}
          {!isAdmin && (
            <button
              type="button"
              onClick={switchToLocataire}
              disabled={switching}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sand-500 hover:bg-sand-50 hover:text-sand-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="w-8 h-8 rounded-lg bg-sand-100/60 flex items-center justify-center transition-all">
                {switching
                  ? <Loader2 className="w-[18px] h-[18px] animate-spin text-sand-400" strokeWidth={2.5} />
                  : <Users className="w-[18px] h-[18px] text-sand-400" strokeWidth={2} />
                }
              </div>
              <span className="flex-1 text-left text-[13px] font-semibold">Mode locataire</span>
              <ChevronRight className="w-3.5 h-3.5 text-sand-300" strokeWidth={2} />
            </button>
          )}

          {/* Sign out */}
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sand-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <div className="w-8 h-8 rounded-lg bg-sand-100/60 group-hover:bg-red-100/60 flex items-center justify-center transition-all">
              {signingOut
                ? <Loader2 className="w-[18px] h-[18px] animate-spin text-red-400" strokeWidth={2.5} />
                : <LogOut className="w-[18px] h-[18px] text-sand-400 group-hover:text-red-500" strokeWidth={2} />
              }
            </div>
            <span className="flex-1 text-left text-[13px] font-semibold">Se déconnecter</span>
          </button>
        </div>
      </aside>
    </>
  );
}

