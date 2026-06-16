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
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === '/'
              ? pathname === '/' || pathname === '/explorer'
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1',
                'transition-all duration-200',
                isActive ? 'text-emerald-600' : 'text-slate-400',
              )}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -top-0.5 w-6 h-[3px] rounded-full bg-emerald-500" />
              )}

              <span
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-emerald-50 scale-105'
                    : 'bg-transparent group-hover:bg-slate-50',
                )}
              >
                <Icon
                  className={cn(
                    'h-[22px] w-[22px] transition-all duration-200',
                    isActive ? 'text-emerald-600' : 'text-slate-400',
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </span>

              <span
                className={cn(
                  'text-[10px] font-semibold tracking-tight transition-colors duration-200',
                  isActive ? 'text-emerald-600' : 'text-slate-400',
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
