'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Car,
  CalendarRange,
  Banknote,
  BadgeCheck,
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
const NAV_ITEMS = [
  { href: '/dashboard/owner/vehicles',     icon: Car,             label: 'Véhicules'    },
  { href: '/dashboard/owner/reservations', icon: CalendarRange,   label: 'Réservations' },
  { href: '/dashboard/owner/wallet',       icon: Banknote,        label: 'Portefeuille' },
  { href: '/dashboard/owner/kyc',          icon: BadgeCheck,      label: 'Vérification' },
  {
    href: '/dashboard/settings',
    icon: SlidersHorizontal,
    label: 'Paramètres',
    submenu: [
      { name: 'Informations',  href: '/dashboard/settings/profile'       },
      { name: 'Notifications', href: '/dashboard/settings/notifications' },
      { name: 'Aide & Support',href: '/dashboard/settings/support'       },
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
}

function NavItem({ href, icon, label, active, collapsed, subItem = false }: NavItemProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl font-medium transition-all duration-150',
        subItem
          ? 'py-2.5 pl-11 pr-4 text-[14px] hover:bg-black/5'
          : collapsed
          ? 'px-0 py-4 justify-center'
          : 'px-4 py-3 text-[15px]',
        active && !subItem
          ? 'bg-black text-white'
          : 'text-black hover:bg-black/5',
        active && subItem ? 'font-semibold' : ''
      )}
    >
      {active && !collapsed && !subItem && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-black rounded-r-full" />
      )}

      {icon && (
        <span className={cn(
          'flex-shrink-0 transition-colors duration-150',
          active && !subItem ? 'text-white' : 'text-black'
        )}>
          {icon}
        </span>
      )}

      {!collapsed && <span className="tracking-tight">{label}</span>}

      {collapsed && !subItem && (
        <span className="absolute left-full ml-3 px-2.5 py-1 bg-black text-white text-xs rounded-lg
          opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
          transition-opacity duration-150 z-50 shadow-lg">
          {label}
        </span>
      )}
    </Link>
  );
}

/* ── Main Sidebar ─────────────────────────────────────────────── */
export function OwnerSidebar() {
  const pathname = usePathname();
  const { switchToLocataire, loading: switching } = useSwitchToLocataire();
  const { signOut, loading: signingOut } = useSignOut();

  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  /* ── Desktop nav content ─────────────────────────────────────── */
  const NavContent = ({ compact }: { compact: boolean }) => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-black/10',
        compact ? 'px-4 py-5 justify-center' : 'px-5 py-5'
      )}>
        <Link href="/dashboard/owner/vehicles" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-150">
            <Car className="w-5 h-5 text-white" />
          </div>
          {!compact && (
            <span className="text-xl font-bold text-black tracking-tight whitespace-nowrap">
              Auto<span className="font-light">Loc</span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {!compact && (
          <p className="px-4 mb-3 text-[10px] font-bold tracking-[0.18em] text-black/40 uppercase">
            Navigation
          </p>
        )}

        {NAV_ITEMS.map((item) => {
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
                    'group relative w-full flex items-center gap-3 rounded-xl font-medium transition-all duration-150',
                    compact ? 'px-0 py-4 justify-center' : 'px-4 py-3 text-[15px]',
                    isActive ? 'bg-black text-white' : 'text-black hover:bg-black/5'
                  )}
                >
                  {isActive && !compact && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-black rounded-r-full" />
                  )}
                  <item.icon className={cn(
                    'w-[18px] h-[18px] flex-shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-black'
                  )} />
                  {!compact && (
                    <>
                      <span className="flex-1 text-left tracking-tight">{item.label}</span>
                      <ChevronDown className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        isSubmenuOpen ? 'rotate-180' : '',
                        isActive ? 'text-white' : 'text-black'
                      )} />
                    </>
                  )}
                  {compact && (
                    <span className="absolute left-full ml-3 px-2.5 py-1 bg-black text-white text-xs rounded-lg
                      opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
                      transition-opacity duration-150 z-50 shadow-lg">
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

      {/* Bottom actions */}
      <div className="border-t border-black/10 px-3 py-4 space-y-0.5">
        <button
          type="button"
          onClick={switchToLocataire}
          disabled={switching}
          title={compact ? 'Mode locataire' : undefined}
          className={cn(
            'group relative w-full flex items-center gap-3 rounded-xl text-[15px] font-medium text-black',
            'hover:bg-black/5 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
            compact ? 'px-0 py-4 justify-center' : 'px-4 py-3'
          )}
        >
          {switching
            ? <Loader2 className="w-[18px] h-[18px] animate-spin flex-shrink-0 text-black" />
            : <UserRound className="w-[18px] h-[18px] flex-shrink-0 text-black transition-colors" />
          }
          {!compact && <span className="tracking-tight">Mode locataire</span>}
          {compact && (
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-black text-white text-xs rounded-lg
              opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
              transition-opacity duration-150 z-50 shadow-lg">
              Mode locataire
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          title={compact ? 'Déconnexion' : undefined}
          className={cn(
            'group relative w-full flex items-center gap-3 rounded-xl text-[15px] font-medium text-black',
            'hover:bg-red-50 hover:text-red-600 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
            compact ? 'px-0 py-4 justify-center' : 'px-4 py-3'
          )}
        >
          {signingOut
            ? <Loader2 className="w-[18px] h-[18px] animate-spin flex-shrink-0" />
            : <LogOut className="w-[18px] h-[18px] flex-shrink-0 text-black group-hover:text-red-500 transition-colors" />
          }
          {!compact && <span className="tracking-tight">Déconnexion</span>}
          {compact && (
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-black text-white text-xs rounded-lg
              opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
              transition-opacity duration-150 z-50 shadow-lg">
              Déconnexion
            </span>
          )}
        </button>

        {!compact ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium
              text-black hover:bg-black/5 transition-all duration-150 mt-1 border-t border-black/10 pt-3"
          >
            <ChevronLeft className="w-4 h-4 flex-shrink-0" />
            <span>Réduire</span>
          </button>
        ) : (
          <div className="flex justify-center pt-2 border-t border-black/10 mt-1">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="Agrandir"
              className="group w-9 h-9 rounded-xl flex items-center justify-center
                text-black hover:bg-black/5 transition-all duration-150"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ══ MOBILE TOP BAR ══════════════════════════════════════════ */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center px-5 h-14 bg-white border-b border-black/10">
        <Link href="/dashboard/owner/vehicles" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          <span className="text-[17px] font-bold text-black tracking-tight">
            Auto<span className="font-light">Loc</span>
          </span>
        </Link>
      </div>

      {/* ══ MOBILE BOTTOM TAB BAR ══════════════════════════════════ */}
      {/* Le layout parent doit ajouter pb-[72px] au contenu sur mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex bg-white border-t border-black/10">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-1 group min-w-0"
            >
              <span className={cn(
                'flex items-center justify-center w-11 h-7 rounded-xl transition-all duration-150',
                isActive ? 'bg-black' : ''
              )}>
                <item.icon className={cn(
                  'w-5 h-5 transition-colors duration-150',
                  isActive ? 'text-white' : 'text-black'
                )} />
              </span>
              <span className={cn(
                'text-[10px] font-bold tracking-tight leading-none truncate max-w-full px-1 text-black'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ══ DESKTOP SIDEBAR ════════════════════════════════════════ */}
      <aside className={cn(
        'hidden lg:flex flex-col flex-shrink-0 min-h-screen bg-white border-r border-black/10',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <NavContent compact={collapsed} />
      </aside>
    </>
  );
}
