'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
      className="md:hidden fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className={cn(
          'flex items-center gap-1 bg-white/90 backdrop-blur-xl',
          'border border-slate-100 rounded-full p-1.5',
          'shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
        )}
      >
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
              className="relative flex items-center justify-center"
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active-pill"
                  className="absolute inset-0 rounded-full bg-slate-950"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span
                className={cn(
                  'relative z-10 flex items-center gap-1.5 px-4 py-2.5 transition-colors duration-200',
                  isActive ? 'text-emerald-400' : 'text-slate-400',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="text-[13px] font-bold whitespace-nowrap">{label}</span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
