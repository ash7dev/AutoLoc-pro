'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, CalendarRange, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Tab definitions ───────────────────────────────────────────── */
const TABS = [
  { href: '/', icon: Home, label: 'Accueil' },
  { href: '/reservations', icon: CalendarRange, label: 'Réservations' },
  { href: '/settings', icon: User, label: 'Mon Compte' },
] as const;

/* ── Component ─────────────────────────────────────────────────── */
export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on dashboard pages (owner/admin have their own nav)
  if (pathname.startsWith('/dashboard')) return null;

  // Hide on vehicle detail pages — the floating "Réserver" bar takes this spot instead
  if (pathname.startsWith('/vehicle/')) return null;

  return (
    <nav
      aria-label="Navigation principale mobile"
      className={cn(
        'md:hidden fixed bottom-0 inset-x-0 z-50',
        'bg-white/95 backdrop-blur-xl',
        'border-t border-slate-100/80',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.06)]',
        'pb-[env(safe-area-inset-bottom)]',
      )}
    >
      <div className="flex items-center justify-center gap-2 h-16 px-3">
        {TABS.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === '/'
              ? pathname === '/' || pathname === '/explorer'
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center justify-center transition-all duration-300 ease-out overflow-hidden',
                isActive
                  ? 'flex-[1.7] gap-2 rounded-full bg-slate-950 text-emerald-400 px-4 py-3 shadow-lg shadow-slate-900/15'
                  : 'flex-1 rounded-full text-slate-400 py-3 active:bg-slate-50',
              )}
            >
              <Icon
                className={cn('shrink-0 transition-all duration-300', isActive ? 'h-5 w-5' : 'h-[23px] w-[23px]')}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {isActive && (
                <span className="text-[13px] font-bold whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-200">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
