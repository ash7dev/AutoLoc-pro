'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '../../lib/supabase/client';
import { useNestToken } from '../../features/auth/hooks/use-nest-token';
import { fetchMe } from '../../lib/nestjs/auth';

/* ── Nav links ───────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: '/',             icon: Home,       label: 'Accueil'           },
  { href: '/explorer',     icon: Car,        label: 'Explorer'          },
  { href: '/how-it-works', icon: HelpCircle, label: 'Comment ça marche' },
  { href: '/contact',      icon: Mail,       label: 'Contact'           },
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
      : 'text-black hover:bg-slate-50 hover:text-black'
    ,
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

/* ── Profile dropdown ────────────────────────────────────────── */
function ProfileDropdown({
  isOwner,
  showBecomeOwner,
  showHostSpace,
  loadingHostEntry,
}: {
  isOwner: boolean;
  showBecomeOwner: boolean;
  showHostSpace: boolean;
  loadingHostEntry: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
    setOpen(false);
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
          <User className={cn('w-3.5 h-3.5 transition-colors duration-200', open ? 'text-white' : 'text-white')} />
        </span>
        <span className={cn(
          'text-[12.5px] font-medium tracking-tight transition-colors duration-200 hidden sm:block',
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
                  {isOwner ? 'Propriétaire Pro' : 'Locataire'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="p-2 space-y-0.5">
          {isOwner ? (
            <DropdownItem href="/dashboard/owner" icon={LayoutDashboard} label="Espace propriétaire" badge="Pro" />
          ) : loadingHostEntry ? (
            <DropdownItem icon={Loader2} label="Chargement..." disabled />
          ) : showBecomeOwner ? (
            <DropdownItem href="/become-owner" icon={Building2} label="Devenir hôte" badge="Nouveau" />
          ) : showHostSpace ? (
            <DropdownItem href="/dashboard/owner" icon={LayoutDashboard} label="Espace hôte" />
          ) : null}
          <DropdownItem href="/reservations"  icon={CalendarRange} label="Mes réservations" />
          <DropdownItem href="/notifications" icon={Bell}          label="Notifications"    />
          <DropdownItem href="/profile"       icon={User}          label="Mon profil"       />
          <DropdownItem href="/settings"      icon={Settings}      label="Paramètres"       />
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
    const elRect  = el.getBoundingClientRect();
    setPillStyle({
      left:    elRect.left - navRect.left,
      width:   elRect.width,
      opacity: 1,
    });
  }, [pathname]);

  return (
    <div ref={navRef} className="hidden md:flex items-center gap-1 relative">
      {/* Sliding pill background */}
      <div
        className="absolute inset-y-0 rounded-xl bg-black transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          left:    pillStyle.left,
          width:   pillStyle.width,
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
  const [hasVehicles, setHasVehicles] = useState<boolean | null>(null);
  const { activeRole }          = useNestToken();
  const pathname                = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const isLogged = Boolean(data.session?.access_token);
      setLoggedIn(isLogged);
      setHydrated(true);
      if (isLogged) {
        try {
          const profile = await fetchMe('');
          setHasVehicles(Boolean(profile.hasVehicles));
        } catch {
          setHasVehicles(false);
        }
      } else {
        setHasVehicles(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const isLogged = Boolean(session?.access_token);
      setLoggedIn(isLogged);
      if (isLogged) {
        try {
          const profile = await fetchMe('');
          setHasVehicles(Boolean(profile.hasVehicles));
        } catch {
          setHasVehicles(false);
        }
      } else {
        setHasVehicles(null);
      }
    });

    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (hydrated && activeRole === 'PROPRIETAIRE') return null;
  const showBecomeOwner = hydrated && loggedIn && hasVehicles === false;
  const showHostSpace = hydrated && loggedIn && hasVehicles === true;
  const loadingHostEntry = hydrated && loggedIn && hasVehicles === null;

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-sm shadow-slate-200/60 border-b border-slate-100/60'
        : 'bg-white/95 border-b border-slate-100'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-6">

        {/* ── Logo ───────────────────────────────────────────── */}
        <Link href="/" className="group flex-shrink-0">
          <Image
            src="/logoAutoLoc.jpg"
            alt="AutoLoc"
            width={48}
            height={48}
            className="object-contain group-hover:opacity-80 transition-opacity duration-200"
          />
        </Link>

        {/* ── Center nav with slider pill ─────────────────────── */}
        {/* Pill container with subtle bg */}
        <div className="hidden md:flex items-center flex-1 justify-center">
          <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-1">
            <SliderNav pathname={pathname} />
          </div>
        </div>

        {/* ── Right slot ──────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!hydrated && (
            <div className="w-32 h-9 bg-slate-100 rounded-2xl animate-pulse" />
          )}

          {hydrated && !loggedIn && (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-[13px] font-medium text-black hover:text-black
                  rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100
                  transition-all duration-200 tracking-tight"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="relative px-4 py-2 text-[13px] font-semibold text-white
                  bg-slate-900 hover:bg-slate-800
                  rounded-xl transition-all duration-200 tracking-tight
                  shadow-md shadow-slate-900/20 hover:shadow-lg hover:shadow-slate-900/25
                  hover:-translate-y-px active:translate-y-0"
              >
                Commencer
                {/* Subtle green dot accent */}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white" />
              </Link>
            </div>
          )}

          {hydrated && loggedIn && (
            <ProfileDropdown
              isOwner={activeRole === 'PROPRIETAIRE'}
              showBecomeOwner={showBecomeOwner}
              showHostSpace={showHostSpace}
              loadingHostEntry={loadingHostEntry}
            />
          )}
        </div>
      </div>

      {/* ── Mobile bottom nav ──────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100/80 flex pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {NAV_LINKS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 group"
            >
              <span className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                isActive
                  ? 'bg-black shadow-md shadow-black/20'
                  : 'bg-transparent group-active:bg-slate-100'
              )}>
                <Icon className={cn(
                  'w-4.5 h-4.5 transition-colors duration-200',
                  isActive ? 'text-emerald-400' : 'text-black'
                )} />
              </span>
              <span className={cn(
                'text-[9.5px] font-semibold tracking-tight transition-colors duration-200',
                isActive ? 'text-emerald-400' : 'text-black'
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
