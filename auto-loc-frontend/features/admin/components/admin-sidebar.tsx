'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  BadgeCheck,
  Banknote,
  Scale,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Loader2,
  ShieldCheck,
  History,
  Calendar,
  Menu,
  XCircle,
  RefreshCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSignOut } from '../../auth/hooks/use-signout';
import { useAdminBadges } from '../hooks/use-admin-badges';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

/* ── Navigation config ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: '/dashboard/admin',              icon: LayoutDashboard, label: 'Vue d\'ensemble', group: 'main' },
  { href: '/dashboard/admin/vehicles',     icon: Car,             label: 'Véhicules',        group: 'ops'  },
  { href: '/dashboard/admin/reservations', icon: Calendar,        label: 'Réservations',     group: 'ops'  },
  { href: '/dashboard/admin/kyc',          icon: BadgeCheck,      label: 'KYC',              group: 'ops'  },
  { href: '/dashboard/admin/withdrawals',  icon: Banknote,        label: 'Retraits',         group: 'ops'  },
  { href: '/dashboard/admin/refunds',      icon: RefreshCcw,      label: 'Remboursements',   group: 'ops'  },
  { href: '/dashboard/admin/cancellations', icon: XCircle,        label: 'Annulations',      group: 'ops'  },
  { href: '/dashboard/admin/disputes',     icon: Scale,           label: 'Litiges',          group: 'ops'  },
  { href: '/dashboard/admin/users',        icon: Users,           label: 'Utilisateurs',     group: 'data' },
  { href: '/dashboard/admin/audit',        icon: History,         label: 'Audit',            group: 'data' },
] as const;

/* ── NavItem ──────────────────────────────────────────────────────── */
function NavItem({
  href, icon, label, active, collapsed, badge, urgent, onClick
}: {
  href: string;
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  badge?: number;
  urgent?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl font-medium transition-all duration-200',
        collapsed ? 'px-0 py-3 justify-center' : 'px-3 py-2.5 text-[13.5px]',
        active
          ? 'bg-black text-emerald-400 shadow-sm shadow-black/20'
          : 'text-slate-500 hover:bg-slate-100 hover:text-black',
      )}
    >
      {/* Active indicator bar */}
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-400" />
      )}

      {icon && (
        <span className={cn('flex-shrink-0 relative', active ? 'text-emerald-400' : '')}>
          {icon}
          {/* Badge en mode collapsed */}
          {collapsed && badge != null && badge > 0 && (
            <span className={cn(
              'absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] rounded-full px-0.5',
              'text-[8px] font-black',
              urgent ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white',
            )}>
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </span>
      )}

      {!collapsed && (
        <span className="tracking-tight leading-none flex-1">{label}</span>
      )}

      {/* Badge en mode expanded */}
      {!collapsed && badge != null && badge > 0 && (
        <span className={cn(
          'inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5',
          'text-[10px] font-black',
          urgent
            ? 'bg-red-100 text-red-600'
            : active
            ? 'bg-emerald-400/20 text-emerald-300'
            : 'bg-slate-200 text-slate-600',
        )}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}

      {/* Tooltip en mode collapsed */}
      {collapsed && (
        <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl
          opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
          transition-opacity duration-150 z-50 shadow-xl border border-slate-800">
          {label}
          {badge != null && badge > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center
              min-w-[16px] h-4 rounded-full bg-emerald-400/20 text-emerald-400 px-1 text-[9px] font-bold">
              {badge}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}

/* ── Section label ────────────────────────────────────────────────── */
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[9.5px] font-black uppercase tracking-widest text-slate-300 select-none">
      {label}
    </p>
  );
}

/* ── Main Sidebar ─────────────────────────────────────────────────── */
export function AdminSidebar() {
  const pathname  = usePathname();
  const { signOut, loading: signingOut } = useSignOut();
  const [collapsed, setCollapsed] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const badges = useAdminBadges();

  const badgeFor: Record<string, number | undefined> = {
    '/dashboard/admin/kyc':           badges?.pendingKyc,
    '/dashboard/admin/vehicles':      badges?.pendingVehicles,
    '/dashboard/admin/withdrawals':   badges?.pendingWithdrawals,
    '/dashboard/admin/disputes':      badges?.pendingLitiges,
    '/dashboard/admin/refunds':       undefined, // TODO: Add backend support
    '/dashboard/admin/cancellations': undefined, // TODO: Add backend support
  };

  const urgentPaths = ['/dashboard/admin/disputes', '/dashboard/admin/kyc'];

  const totalBadges = (badges?.pendingKyc ?? 0)
    + (badges?.pendingVehicles ?? 0)
    + (badges?.pendingWithdrawals ?? 0)
    + (badges?.pendingLitiges ?? 0);

  const NavContent = ({ compact, onToggle }: { compact: boolean; onToggle?: () => void }) => (
    <div className="flex flex-col h-full">

      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 px-3 py-5 border-b border-slate-100/60">
        <Link href="/dashboard/admin" onClick={onToggle} className="group relative">
          <Image
            src="/logoAutoLoc.jpg"
            alt="AutoLoc"
            width={compact ? 40 : 48}
            height={compact ? 38 : 44}
            className="object-contain group-hover:opacity-80 transition-opacity duration-200"
          />
          {compact && totalBadges > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center
              min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[8px] font-black px-0.5 shadow-sm">
              {totalBadges > 99 ? '99+' : totalBadges}
            </span>
          )}
        </Link>
        {!compact && (
          <span className="inline-flex items-center gap-1.5 rounded-full
            bg-black border border-emerald-400/30 px-2.5 py-1">
            <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
            <span className="text-[9.5px] font-black uppercase tracking-widest text-emerald-400">
              Admin
            </span>
          </span>
        )}
      </div>

      {/* ── Nav items ─────────────────────────────────────────────── */}
      <nav className={cn(
        'flex-1 py-4 overflow-y-auto',
        compact ? 'px-2 space-y-1' : 'px-4 space-y-0.5',
      )}>
        {/* Vue d'ensemble */}
        {(() => {
          const item = NAV_ITEMS[0];
          const isActive = pathname === item.href;
          return (
            <>
              {!compact && <SectionLabel label="Accueil" />}
              <NavItem
                href={item.href}
                icon={<item.icon className="w-[18px] h-[18px]" />}
                label={item.label}
                active={isActive}
                collapsed={compact}
                onClick={onToggle}
              />
            </>
          );
        })()}

        {/* Opérations */}
        {!compact && <SectionLabel label="Opérations" />}
        {compact && <div className="my-3 mx-2 border-t border-slate-100" />}
        <div className="space-y-1">
          {NAV_ITEMS.filter(item => item.group === 'ops').map((item) => {
            const isActive = pathname.startsWith(item.href);
            const badge = badgeFor[item.href];
            return (
              <NavItem
                key={item.href}
                href={item.href}
                icon={<item.icon className="w-[18px] h-[18px]" />}
                label={item.label}
                active={isActive}
                collapsed={compact}
                badge={badge}
                urgent={urgentPaths.includes(item.href) && (badge ?? 0) > 0}
                onClick={onToggle}
              />
            );
          })}
        </div>

        {/* Données */}
        {!compact && <SectionLabel label="Données" />}
        {compact && <div className="my-3 mx-2 border-t border-slate-100" />}
        <div className="space-y-1">
          {NAV_ITEMS.filter(item => item.group === 'data').map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <NavItem
                key={item.href}
                href={item.href}
                icon={<item.icon className="w-[18px] h-[18px]" />}
                label={item.label}
                active={isActive}
                collapsed={compact}
                onClick={onToggle}
              />
            );
          })}
        </div>
      </nav>

      {/* ── Bottom actions ─────────────────────────────────────────── */}
      <div className={cn('pb-8', compact ? 'px-2' : 'px-4')}>
        <div className="my-4 border-t border-slate-100" />
        <button
          type="button"
          onClick={() => {
            signOut();
            onToggle?.();
          }}
          disabled={signingOut}
          title={compact ? 'Déconnexion' : undefined}
          className={cn(
            'group relative w-full flex items-center gap-3 rounded-xl text-[13.5px] font-medium',
            'text-slate-500 hover:bg-red-50 hover:text-red-500',
            'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
            compact ? 'px-0 py-3 justify-center' : 'px-3 py-3',
          )}
        >
          {signingOut
            ? <Loader2 className="w-[18px] h-[18px] animate-spin flex-shrink-0" />
            : <LogOut  className="w-[18px] h-[18px] flex-shrink-0" />
          }
          {!compact && <span className="tracking-tight flex-1 text-left">Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ══ MOBILE TOP BAR ══════════════════════════════════════════ */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-5 h-16
        bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        
        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button 
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
                {totalBadges > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center
                    min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-black px-1 shadow-md border-2 border-white">
                    {totalBadges > 99 ? '99+' : totalBadges}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] border-r-0">
              <NavContent compact={false} onToggle={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link href="/dashboard/admin" className="relative flex items-center">
            <Image src="/logoAutoLoc.jpg" alt="AutoLoc" width={34} height={31} className="object-contain" />
          </Link>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full
          bg-black border border-emerald-400/30 px-3 py-1.5 shadow-lg shadow-black/5">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Admin</span>
        </span>
      </div>

      {/* ══ DESKTOP SIDEBAR ════════════════════════════════════════ */}
      <aside className={cn(
        'relative hidden lg:flex flex-col flex-shrink-0 min-h-screen',
        'bg-white border-r border-slate-100',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[240px]',
      )}>
        <NavContent compact={collapsed} />

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Agrandir' : 'Réduire'}
          className="absolute right-0 top-[82px] translate-x-1/2 z-20
            flex items-center justify-center w-6 h-6 rounded-full
            bg-white border border-slate-200
            shadow-md shadow-slate-200/80
            hover:bg-slate-50 hover:shadow-lg hover:scale-110
            transition-all duration-200"
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3 text-slate-400" />
            : <ChevronLeft  className="w-3 h-3 text-slate-400" />
          }
        </button>
      </aside>
    </>
  );
}
