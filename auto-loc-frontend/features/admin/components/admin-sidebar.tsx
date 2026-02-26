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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSignOut } from '../../auth/hooks/use-signout';

/* ── Navigation config ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: '/dashboard/admin',             icon: LayoutDashboard, label: 'Vue d\'ensemble' },
  { href: '/dashboard/admin/vehicles',    icon: Car,             label: 'Véhicules'       },
  { href: '/dashboard/admin/kyc',         icon: BadgeCheck,      label: 'KYC'             },
  { href: '/dashboard/admin/withdrawals', icon: Banknote,        label: 'Retraits'        },
  { href: '/dashboard/admin/disputes',    icon: Scale,           label: 'Litiges'         },
  { href: '/dashboard/admin/users',       icon: Users,           label: 'Utilisateurs'    },
] as const;

/* ── NavItem ──────────────────────────────────────────────────────── */
interface NavItemProps {
  href: string;
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  badge?: number;
}

function NavItem({ href, icon, label, active, collapsed, badge }: NavItemProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl font-medium transition-all duration-200',
        collapsed ? 'px-0 py-3.5 justify-center' : 'px-3 py-2.5 text-[14px]',
        active
          ? 'bg-black text-emerald-400'
          : 'text-slate-600 hover:bg-slate-100 hover:text-black',
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}

      {!collapsed && (
        <span className="tracking-tight leading-none flex-1">{label}</span>
      )}

      {/* Badge compteur */}
      {!collapsed && badge != null && badge > 0 && (
        <span className={cn(
          'inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1',
          'text-[10px] font-bold',
          active
            ? 'bg-emerald-400/20 text-emerald-400'
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

/* ── Main Sidebar ─────────────────────────────────────────────────── */
export function AdminSidebar() {
  const pathname  = usePathname();
  const { signOut, loading: signingOut } = useSignOut();
  const [collapsed, setCollapsed] = useState(true);

  const NavContent = ({ compact }: { compact: boolean }) => (
    <div className="flex flex-col h-full">

      {/* ── Logo + badge Admin ─────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 px-3 py-5">
        <Link href="/dashboard/admin" className="group">
          <Image
            src="/logoAutoLoc.jpg"
            alt="AutoLoc"
            width={compact ? 45 : 52}
            height={compact ? 42 : 48}
            className="object-contain group-hover:opacity-80 transition-opacity duration-200"
          />
        </Link>
        {!compact && (
          <span className="inline-flex items-center gap-1 rounded-full
            bg-black border border-emerald-400/30 px-2.5 py-1">
            <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
            <span className="text-[9.5px] font-bold uppercase tracking-widest text-emerald-400">
              Admin
            </span>
          </span>
        )}
      </div>

      {/* ── Section label ─────────────────────────────────────────── */}
      {!compact && (
        <div className="px-4 mb-2">
          <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-widest">
            Administration
          </span>
        </div>
      )}

      {/* ── Nav items ─────────────────────────────────────────────── */}
      <nav className={cn(
        'flex-1 py-1 space-y-0.5 overflow-y-auto',
        compact ? 'px-2' : 'px-3',
      )}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard/admin'
              ? pathname === '/dashboard/admin'
              : pathname.startsWith(item.href);

          return (
            <NavItem
              key={item.href}
              href={item.href}
              icon={<item.icon className="w-[18px] h-[18px]" />}
              label={item.label}
              active={isActive}
              collapsed={compact}
            />
          );
        })}
      </nav>

      {/* ── Bottom actions ─────────────────────────────────────────── */}
      <div className={cn('pb-5 space-y-0.5', compact ? 'px-2' : 'px-3')}>
        <div className="my-1 mx-3 border-t border-slate-100" />

        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          title={compact ? 'Déconnexion' : undefined}
          className={cn(
            'group relative w-full flex items-center gap-3 rounded-xl text-[14px] font-medium',
            'text-slate-600 hover:bg-red-50 hover:text-red-500',
            'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
            compact ? 'px-0 py-3.5 justify-center' : 'px-3 py-2.5',
          )}
        >
          {signingOut
            ? <Loader2 className="w-[18px] h-[18px] animate-spin flex-shrink-0" />
            : <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          }
          {!compact && <span className="tracking-tight flex-1 text-left">Déconnexion</span>}
          {compact && (
            <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl
              opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
              transition-opacity duration-150 z-50 shadow-xl border border-slate-800">
              Déconnexion
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ══ MOBILE TOP BAR ══════════════════════════════════════════ */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-5 h-14
        bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <Link href="/dashboard/admin">
          <Image src="/logoAutoLoc.jpg" alt="AutoLoc" width={36} height={36} className="object-contain" />
        </Link>
        <span className="inline-flex items-center gap-1 rounded-full
          bg-black border border-emerald-400/30 px-2.5 py-1">
          <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Admin</span>
        </span>
      </div>

      {/* ══ MOBILE BOTTOM TAB BAR ══════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex bg-white/90 backdrop-blur-xl pb-safe
        border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive =
            item.href === '/dashboard/admin'
              ? pathname === '/dashboard/admin'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 min-w-0 group"
            >
              <span className={cn(
                'flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200',
                isActive ? 'bg-black shadow-md shadow-black/20' : 'group-active:bg-slate-100',
              )}>
                <item.icon className={cn(
                  'w-[18px] h-[18px] transition-colors duration-200',
                  isActive ? 'text-emerald-400' : 'text-slate-400',
                )} />
              </span>
              <span className={cn(
                'text-[9px] font-semibold tracking-tight leading-none truncate max-w-full px-1',
                isActive ? 'text-emerald-400' : 'text-slate-400',
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ══ DESKTOP SIDEBAR ════════════════════════════════════════ */}
      <aside className={cn(
        'relative hidden lg:flex flex-col flex-shrink-0 min-h-screen',
        'bg-white border-r border-slate-100',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[65px]' : 'w-[230px]',
      )}>
        <NavContent compact={collapsed} />

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Agrandir' : 'Réduire'}
          className="absolute right-0 top-[74px] translate-x-1/2 z-20
            flex items-center justify-center w-5 h-5 rounded-full
            bg-white border border-slate-200
            shadow-md shadow-slate-200/80
            hover:bg-slate-50 hover:shadow-lg hover:scale-110
            transition-all duration-200"
        >
          {collapsed
            ? <ChevronRight className="w-2.5 h-2.5 text-slate-400" />
            : <ChevronLeft  className="w-2.5 h-2.5 text-slate-400" />
          }
        </button>
      </aside>
    </>
  );
}
