'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Car,
  HelpCircle,
  Mail,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Building2,
  LayoutDashboard,
  CalendarRange,
  Bell,
  Loader2,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHasVehiclesFromStore } from '../../features/auth/hooks/use-has-vehicles-from-store';
import { useRoleStore } from '../../features/auth/stores/role.store';
import { useSwitchToProprietaire } from '../../features/owner/hooks/use-switch-to-proprietaire';
import { useSignOut } from '../../features/auth/hooks/use-signout';
import { CurrencySelector } from './CurrencyConverter';

/* ── Nav links ───────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: '/', icon: Home, label: 'Accueil' },
  { href: '/explorer', icon: Car, label: 'Explorer' },
  { href: '/how-it-works', icon: HelpCircle, label: 'Comment ça marche' },
  { href: '/contact', icon: Mail, label: 'Contact' },
];

/* ── Dropdown menu item ──────────────────────────────────────── */
function DropdownItem({
  href,
  icon: Icon,
  label,
  onClick,
  danger = false,
  badge,
  disabled = false,
}: {
  href?: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  badge?: string;
  disabled?: boolean;
}) {
  const cls = cn(
    'group flex items-center gap-3 w-full px-3.5 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200',
    danger
      ? 'text-red-400 hover:bg-red-50/80 hover:text-red-500'
      : 'text-black hover:bg-slate-50 hover:text-black',
    disabled ? 'opacity-60 pointer-events-none' : ''
  );

  const inner = (
    <>
      <span className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
        danger
          ? 'bg-red-50 group-hover:bg-red-100'
          : 'bg-slate-100/80 group-hover:bg-slate-200/80'
      )}>
        <Icon className="w-3.5 h-3.5" />
      </span>
      <span className="flex-1 tracking-tight">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10.5px] font-bold rounded-full border border-emerald-100 tracking-wide">
          {badge}
        </span>
      )}
    </>
  );

  return href ? (
    <Link href={href} className={cls}>{inner}</Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>{inner}</button>
  );
}

/* ── Profile dropdown (desktop only) ────────────────────────── */
function ProfileDropdown({
  hasVehicles,
}: {
  hasVehicles: boolean | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeRole = useRoleStore((s) => s.activeRole);
  const isAdmin = activeRole === 'ADMIN' || activeRole === 'SUPPORT';
  const { switchToProprietaire, loading: switchingRole } = useSwitchToProprietaire();
  const { signOut, loading: signingOut } = useSignOut();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-2xl transition-all duration-200',
          'border hover:shadow-md',
          open
            ? 'bg-slate-900 border-slate-800 shadow-md shadow-slate-900/10'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm shadow-slate-100/80'
        )}
      >
        <span className={cn(
          'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
          open ? 'bg-white/10' : 'bg-slate-900'
        )}>
          <User className="w-3.5 h-3.5 text-white" />
        </span>
        <span className={cn(
          'text-[12.5px] font-medium tracking-tight transition-colors duration-200',
          open ? 'text-white' : 'text-black'
        )}>
          Mon compte
        </span>
        <ChevronDown className={cn(
          'w-3.5 h-3.5 transition-all duration-200',
          open ? 'rotate-180 text-white/60' : 'text-black'
        )} />
      </button>

      {/* Dropdown */}
      <div className={cn(
        'absolute right-0 top-[calc(100%+12px)] w-64 bg-white rounded-2xl z-50',
        'border border-slate-100/80 shadow-2xl shadow-slate-300/30',
        'transition-all duration-200 origin-top-right',
        open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-3 pointer-events-none'
      )}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-slate-900/20">
              <User className="w-4.5 h-4.5 text-white" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-slate-900 tracking-tight">Mon compte</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <p className="text-[11px] text-slate-400 font-medium">
                  {hasVehicles ? 'Propriétaire Pro' : 'Locataire'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="p-2 space-y-0.5">
          {isAdmin ? (
            <DropdownItem href="/dashboard/admin" icon={LayoutDashboard} label="Dashboard Admin" badge="Admin" />
          ) : hasVehicles === true ? (
            <DropdownItem 
              onClick={() => { switchToProprietaire(); }} 
              disabled={switchingRole} 
              icon={switchingRole ? Loader2 : LayoutDashboard} 
              label={switchingRole ? "Chargement..." : "Espace Propriétaire"} 
              badge="Pro" 
            />
          ) : hasVehicles === false || hasVehicles === null ? (
            <DropdownItem href="/become-owner" icon={Building2} label="Devenir hôte" badge="Nouveau" />
          ) : null}
          <DropdownItem href="/reservations" icon={CalendarRange} label="Mes réservations" />
          <DropdownItem href="/notifications" icon={Bell} label="Notifications" />
          <DropdownItem href="/settings" icon={Settings} label="Paramètres" />
          <div className="my-2 border-t border-slate-50" />
          <DropdownItem
            icon={signingOut ? Loader2 : LogOut}
            label={signingOut ? 'Déconnexion…' : 'Se déconnecter'}
            onClick={handleSignOut}
            danger
          />
        </div>
      </div>
    </div>
  );
}

/* ── Animated pill slider nav ────────────────────────────────── */
function SliderNav({ pathname }: { pathname: string }) {
  const navRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const activeIdx = NAV_LINKS.findIndex(({ href }) =>
      pathname === href || (href !== '/' && pathname.startsWith(href))
    );
    if (activeIdx === -1) {
      setPillStyle(s => ({ ...s, opacity: 0 }));
      return;
    }
    const el = itemRefs.current[activeIdx];
    const nav = navRef.current;
    if (!el || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setPillStyle({
      left: elRect.left - navRect.left,
      width: elRect.width,
      opacity: 1,
    });
  }, [pathname]);

  return (
    <div ref={navRef} className="hidden md:flex items-center gap-1 relative">
      {/* Sliding pill background */}
      <div
        className="absolute inset-y-0 rounded-xl bg-black transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          left: pillStyle.left,
          width: pillStyle.width,
          opacity: pillStyle.opacity,
        }}
      />

      {NAV_LINKS.map(({ href, label }, i) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            ref={el => { itemRefs.current[i] = el; }}
            className={cn(
              'relative z-10 px-4 py-2 text-[13.5px] font-medium tracking-tight rounded-xl transition-colors duration-200 whitespace-nowrap',
              isActive ? 'text-emerald-400' : 'text-black hover:text-black'
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

/* ── Main navbar ─────────────────────────────────────────────── */
export function MarketplaceNavbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const hasVehicles = useHasVehiclesFromStore();
  const activeRole = useRoleStore((s) => s.activeRole);
  const authChecked = useRoleStore((s) => s.authChecked);
  const sessionValid = useRoleStore((s) => s.sessionValid);
  const isAdmin = activeRole === 'ADMIN' || activeRole === 'SUPPORT';
  const pathname = usePathname();
  const router = useRouter();
  const { switchToProprietaire, loading: switchingRole } = useSwitchToProprietaire();
  const { signOut, loading: signingOut } = useSignOut();

  function handleMobileSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (mobileSearch.trim()) params.set('q', mobileSearch.trim());
    router.push(`/vehicle?${params.toString()}`);
  }

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      setMobileSearchVisible(window.scrollY > 350);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    setLoggedIn(sessionValid && Boolean(activeRole));
    setHydrated(authChecked);
  }, [activeRole, authChecked, sessionValid]);


  // Hide navbar on dashboard pages (owner/admin have their own nav)
  if (pathname.startsWith('/dashboard')) return null;

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-sm shadow-slate-200/60 border-b border-slate-100/60'
        : 'bg-white/95 border-b border-slate-100'
    )}>
      <div className="relative">

        {/* ── Contenu principal (logo + nav + auth) ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-6">

          {/* Left slot : logo uniquement */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Logo */}
            <Link href="/" className="group -ml-[5px]">
              <Image
                src="/logoAutoLoc.jpg"
                alt="AutoLoc"
                width={220}
                height={110}
                className="w-[120px] sm:w-[160px] md:w-[220px] object-contain group-hover:opacity-80 transition-opacity duration-200"
              />
            </Link>
          </div>

          {/* Center nav desktop */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-1">
              <SliderNav pathname={pathname} />
            </div>
          </div>

          {/* Right slot */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* ── MOBILE uniquement ─────────────────────────────── */}

            {/* Skeleton mobile — évite le layout shift pendant l'hydratation */}
            {!hydrated && (
              <div className="w-[82px] h-8 bg-slate-100 rounded-xl animate-pulse md:hidden" />
            )}

            {/* Déconnecté mobile : bouton Connexion solid (CTA visible, pas juste un lien) */}
            {hydrated && !loggedIn && (
              <Link
                href="/login"
                className="md:hidden flex items-center px-4 py-2 text-[12.5px] font-bold text-white bg-slate-950 rounded-xl active:scale-[0.97] transition-transform"
              >
                Connexion
              </Link>
            )}

            {/* Connecté mobile : rien ici — la bottom nav gère toute la navigation */}

            {/* ── DESKTOP uniquement ────────────────────────────── */}

            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-[10px] text-red-500 hidden md:block">
                {hydrated ? (loggedIn ? '✅' : '❌') : '⏳'}
              </div>
            )}

            {/* Skeleton desktop */}
            {!hydrated && (
              <div className="w-32 h-9 bg-slate-100 rounded-2xl animate-pulse hidden md:block" />
            )}

            {/* Déconnecté desktop : Connexion + Commencer */}
            {hydrated && !loggedIn && (
              <>
                <Link
                  href="/login"
                  className="hidden md:inline-flex px-4 py-2 text-[13px] font-medium text-black hover:text-black
                    rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100
                    transition-all duration-200 tracking-tight"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="hidden md:relative md:inline-flex px-4 py-2 text-[13px] font-semibold text-white
                    bg-slate-900 hover:bg-slate-800 rounded-xl transition-all duration-200 tracking-tight
                    shadow-md shadow-slate-900/20 hover:shadow-lg hover:shadow-slate-900/25
                    hover:-translate-y-px active:translate-y-0"
                >
                  Commencer
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white" />
                </Link>
              </>
            )}

            {/* Connecté desktop : dropdown Mon compte */}
            {hydrated && loggedIn && (
              <div className="hidden md:block">
                <ProfileDropdown hasVehicles={hasVehicles} />
              </div>
            )}

            {/* Sélecteur de devise — toujours visible (mobile + desktop) */}
            <CurrencySelector />
          </div>
        </div>

        {/* ── Mobile : barre de recherche sticky (apparaît au scroll) ── */}
        <form
          onSubmit={handleMobileSearch}
          className={cn(
            'md:hidden absolute inset-0 flex items-center px-3',
            'bg-white transition-all duration-300',
            mobileSearchVisible
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none',
          )}
        >
          <div className={cn(
            'flex items-center w-full gap-3 h-11',
            'bg-white rounded-2xl px-4',
            'border border-slate-200 shadow-lg shadow-slate-300/50',
          )}>
            <Search className="h-[18px] w-[18px] text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un véhicule..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="flex-1 bg-transparent text-[14px] font-medium text-slate-900 placeholder-slate-400 outline-none tracking-tight"
            />
          </div>
        </form>

      </div>
    </header>
  );
}
