'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Car,
  LayoutDashboard,
  CalendarRange,
  Banknote,
  BadgeCheck,
  Star,
  SlidersHorizontal,
  UserRound,
  LogOut,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSwitchToLocataire } from '../hooks/use-switch-to-locataire';
import { useSignOut } from '../../auth/hooks/use-signout';

/* ── Navigation config ────────────────────────────────────────── */
const DESKTOP_NAV_ITEMS = [
  { href: '/dashboard/owner', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/owner/vehicles', icon: Car, label: 'Véhicules' },
  { href: '/dashboard/owner/reservations', icon: CalendarRange, label: 'Réservations' },
  { href: '/dashboard/owner/wallet', icon: Banknote, label: 'Portefeuille' },
  { href: '/dashboard/owner/reviews', icon: Star, label: 'Avis' },
  { href: '/dashboard/owner/kyc', icon: BadgeCheck, label: 'Vérification' },
  {
    href: '/dashboard/settings',
    icon: SlidersHorizontal,
    label: 'Paramètres',
    submenu: [
      { name: 'Informations', href: '/dashboard/settings/profile' },
      { name: 'Notifications', href: '/dashboard/settings/notifications' },
      { name: 'Aide & Support', href: '/dashboard/settings/support' },
    ],
  },
] as const;

const MOBILE_NAV_ITEMS = [
  { href: '/dashboard/owner', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/owner/vehicles', icon: Car, label: 'Véhicules' },
  { href: '/dashboard/owner/reservations', icon: CalendarRange, label: 'Réservations' },
  { href: '/dashboard/owner/wallet', icon: Banknote, label: 'Portefeuille' },
  {
    href: '/dashboard/settings',
    icon: SlidersHorizontal,
    label: 'Paramètres',
    submenu: [
      { name: 'Informations', href: '/dashboard/settings/profile' },
      { name: 'Notifications', href: '/dashboard/settings/notifications' },
      { name: 'Aide & Support', href: '/dashboard/settings/support' },
      { name: 'Avis', href: '/dashboard/owner/reviews' },
      { name: 'Vérification', href: '/dashboard/owner/kyc' },
      { name: 'Mode locataire', href: 'switch-locataire' },
      { name: 'Déconnexion', href: 'sign-out' },
    ],
  },
] as const;

/* ── NavItem ──────────────────────────────────────────────────── */
interface NavItemProps {
  href: string;
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  subItem?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, active, collapsed, subItem = false, onClick }: NavItemProps) {
  const handleClick = onClick ? (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  } : undefined;

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={handleClick}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl font-medium transition-all duration-200',
        subItem
          ? cn(
            'py-2 pl-9 pr-4 text-[13.5px]',
            active
              ? 'text-emerald-400 font-semibold'
              : 'text-black hover:text-black'
          )
          : collapsed
            ? 'px-0 py-3.5 justify-center'
            : 'px-3 py-2.5 text-[14.5px]',
        !subItem && active
          ? 'bg-black text-emerald-400'
          : !subItem
            ? 'text-black hover:bg-slate-50 hover:text-black'
            : ''
      )}
    >
      {icon && (
        <span className="flex-shrink-0 transition-colors duration-200">
          {icon}
        </span>
      )}

      {!collapsed && <span className="tracking-tight leading-none flex-1">{label}</span>}

      {/* Tooltip collapsed */}
      {collapsed && !subItem && (
        <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl
          opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
          transition-opacity duration-150 z-50 shadow-xl border border-slate-800">
          {label}
        </span>
      )}
    </Link>
  );
}

/* ── Divider ─────────────────────────────────────────────────── */
function SidebarDivider() {
  return <div className="my-1 mx-3 border-t border-slate-100" />;
}

/* ── Main Sidebar ─────────────────────────────────────────────── */
export function OwnerSidebar() {
  const pathname = usePathname();
  const { switchToLocataire, loading: switching } = useSwitchToLocataire();
  const { signOut, loading: signingOut } = useSignOut();

  const [collapsed, setCollapsed] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const NavContent = ({ compact }: { compact: boolean }) => (
    <div className="flex flex-col h-full">

      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-3 py-5">
        <Link href="/dashboard/owner" className="group">
          <Image
            src="/logoAutoLoc.jpg"
            alt="AutoLoc"
            width={compact ? 45 : 52}
            height={compact ? 42 : 48}
            className="object-contain group-hover:opacity-80 transition-opacity duration-200"
          />
        </Link>
      </div>

      {/* ── Section label ────────────────────────────────────────── */}
      {!compact && (
        <div className="px-4 mb-2">
          <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-widest">
            Navigation
          </span>
        </div>
      )}

      {/* ── Nav items ────────────────────────────────────────────── */}
      <nav className={cn(
        'flex-1 py-1 space-y-0.5 overflow-y-auto',
        compact ? 'px-2' : 'px-3'
      )}>
        {DESKTOP_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const hasSubmenu = 'submenu' in item && item.submenu && item.submenu.length > 0;
          const isSubmenuOpen = openSubmenu === item.href;

          return (
            <div key={item.href}>
              {hasSubmenu ? (
                <button
                  type="button"
                  onClick={() => setOpenSubmenu(isSubmenuOpen ? null : item.href)}
                  title={compact ? item.label : undefined}
                  className={cn(
                    'group relative w-full flex items-center gap-3 rounded-xl font-medium transition-all duration-200',
                    compact ? 'px-0 py-3.5 justify-center' : 'px-3 py-2.5 text-[14.5px]',
                    isActive
                      ? 'bg-black text-emerald-400'
                      : 'text-black hover:bg-slate-50 hover:text-black'
                  )}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!compact && (
                    <>
                      <span className="flex-1 text-left tracking-tight leading-none">{item.label}</span>
                      <ChevronDown className={cn(
                        'w-3.5 h-3.5 transition-transform duration-200',
                        isSubmenuOpen ? 'rotate-180' : '',
                        isActive ? 'text-emerald-400/60' : 'text-black'
                      )} />
                    </>
                  )}
                  {compact && (
                    <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl
                      opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
                      transition-opacity duration-150 z-50 shadow-xl border border-slate-800">
                      {item.label}
                    </span>
                  )}
                </button>
              ) : (
                <NavItem
                  href={item.href}
                  icon={<item.icon className="w-[18px] h-[18px]" />}
                  label={item.label}
                  active={isActive}
                  collapsed={compact}
                />
              )}

              {/* Submenu */}
              {hasSubmenu && isSubmenuOpen && !compact && (
                <div className="mt-0.5 space-y-0.5">
                  {(item as any).submenu.map((sub: { name: string; href: string }) => (
                    <NavItem
                      key={sub.href}
                      href={sub.href}
                      label={sub.name}
                      active={pathname === sub.href}
                      collapsed={false}
                      subItem
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom actions ───────────────────────────────────────── */}
      <div className={cn('pb-5 space-y-0.5', compact ? 'px-2' : 'px-3')}>
        <SidebarDivider />

        {/* Switch to locataire */}
        <button
          type="button"
          onClick={switchToLocataire}
          disabled={switching}
          title={compact ? 'Mode locataire' : undefined}
          className={cn(
            'group relative w-full flex items-center gap-3 rounded-xl text-[14.5px] font-medium',
            'text-black hover:bg-slate-50 hover:text-black',
            'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
            compact ? 'px-0 py-3.5 justify-center' : 'px-3 py-2.5'
          )}
        >
          {switching
            ? <Loader2 className="w-[18px] h-[18px] animate-spin flex-shrink-0" />
            : <UserRound className="w-[18px] h-[18px] flex-shrink-0" />
          }
          {!compact && <span className="tracking-tight flex-1 text-left">Mode locataire</span>}
          {compact && (
            <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl
              opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
              transition-opacity duration-150 z-50 shadow-xl border border-slate-800">
              Mode locataire
            </span>
          )}
        </button>

        {/* Sign out */}
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          title={compact ? 'Déconnexion' : undefined}
          className={cn(
            'group relative w-full flex items-center gap-3 rounded-xl text-[14.5px] font-medium',
            'text-black hover:bg-red-50 hover:text-red-500',
            'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
            compact ? 'px-0 py-3.5 justify-center' : 'px-3 py-2.5'
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
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center px-5 h-14
        bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm shadow-slate-100/80">
        <Link href="/dashboard/owner">
          <Image
            src="/logoAutoLoc.jpg"
            alt="AutoLoc"
            width={40}
            height={40}
            className="object-contain"
          />
        </Link>
      </div>

      {/* ══ MOBILE BOTTOM TAB BAR ══════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex bg-white/80 backdrop-blur-xl pb-safe
        border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 min-w-0 group"
            >
              <span className={cn(
                'flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200',
                isActive ? 'bg-black shadow-md shadow-black/20' : 'group-active:bg-slate-100'
              )}>
                <item.icon className={cn(
                  'w-[18px] h-[18px] transition-colors duration-200',
                  isActive ? 'text-emerald-400' : 'text-slate-400'
                )} />
              </span>
              <span className={cn(
                'text-[9.5px] font-semibold tracking-tight leading-none truncate max-w-full px-1 transition-colors duration-200',
                isActive ? 'text-emerald-400' : 'text-slate-400'
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
        collapsed ? 'w-[65px]' : 'w-[230px]'
      )}>
        <NavContent compact={collapsed} />

        {/* Edge toggle button */}
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
            : <ChevronLeft className="w-2.5 h-2.5 text-slate-400" />
          }
        </button>
      </aside>
    </>
  );
}
